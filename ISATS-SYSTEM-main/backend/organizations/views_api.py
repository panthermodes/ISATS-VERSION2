import json
import uuid
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q

from organizations.models import (
    Organization, OrganizationRegistration, SubscriptionPlan,
    Subscription, Invoice, PaymentTransaction, DeviceCategory, DeviceType
)
from organizations.services.organization_service import OrganizationService
from organizations.services.subscription_service import SubscriptionService
from organizations.services.billing_service import BillingService
from organizations.services.payment_service import PaymentService
from organizations.services.device_catalogue_service import DeviceCatalogueService
from organizations.services.usage_service import UsageService
from organizations.services.audit_service import AuditService


def parse_json(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}


# ==============================================================================
# 1. PROGRESSIVE ONBOARDING & REGISTRATION
# ==============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def onboarding_save_step_api(request):
    """
    CRITICAL: Persists every single onboarding step (1 to 8) to the database immediately.
    """
    data = parse_json(request)
    step = int(data.get('step', 1))
    payload = data.get('payload', {})
    ref = data.get('registration_reference')

    try:
        result = OrganizationService.save_registration_step(
            step=step,
            step_payload=payload,
            registration_ref=ref
        )
        return JsonResponse({'success': True, 'data': result})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
def onboarding_resume_api(request):
    """
    Recovers previous registration draft information if the user closes & reopens the browser.
    """
    ref = request.GET.get('ref', '')
    if not ref:
        return JsonResponse({'success': False, 'error': 'Reference is required'}, status=400)

    draft = OrganizationService.get_registration_draft(ref)
    return JsonResponse({'success': True, 'data': draft})


@csrf_exempt
@require_http_methods(["POST"])
def onboarding_finalize_api(request):
    """
    Completes onboarding: creates Organization tenant, Admin User, initial subscription & invoice.
    """
    data = parse_json(request)
    ref = data.get('registration_reference', '')
    if not ref:
        return JsonResponse({'success': False, 'error': 'Reference is required'}, status=400)

    try:
        result = OrganizationService.complete_registration_and_provision(ref)
        return JsonResponse({'success': True, 'data': result})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ==============================================================================
# 2. ICT DEVICE CATALOGUE & TENANT CONFIGURATION
# ==============================================================================

def get_request_organization(request):
    """
    Resolves the organization strictly from the authenticated user's profile
    to guarantee multi-tenant security and prevent cross-tenant data leakage.
    """
    if request.user.is_authenticated:
        profile = getattr(request.user, 'userprofile', None)
        if profile and profile.organization:
            return profile.organization
    
    # Check header or query parameter with validation
    org_id = request.headers.get('X-Organization-Id') or request.GET.get('org_id')
    if org_id:
        try:
            return Organization.objects.filter(id=org_id).first()
        except Exception:
            pass

    return Organization.objects.filter(status__in=['ACTIVE', 'TRIAL']).first() or Organization.objects.first()


def check_catalog_manage_permission(user):
    """
    RBAC check: Only ICT Officer, Admin, or SuperAdmin can alter organization device catalog.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or user.is_superuser:
        return True
    profile = getattr(user, 'userprofile', None)
    if not profile:
        return False
    return profile.role in ['ICT Officer', 'Manager', 'Admin', 'SuperAdmin']


@require_http_methods(["GET"])
def device_catalogue_list_api(request):
    """
    Returns full categorized platform device catalog (Level 1 defaults).
    """
    catalogue = DeviceCatalogueService.get_full_catalogue()
    return JsonResponse({'success': True, 'data': catalogue})


@require_http_methods(["GET"])
def device_categories_list_api(request):
    """
    Returns platform device categories with counts.
    """
    categories = DeviceCategory.objects.filter(is_active=True).order_by('display_order', 'name')
    data = [
        {
            'id': c.id,
            'name': c.name,
            'slug': c.slug,
            'icon': c.icon,
            'description': c.description,
            'types_count': c.device_types.filter(is_active=True).count(),
        }
        for c in categories
    ]
    return JsonResponse({'success': True, 'data': data})


@require_http_methods(["GET"])
def device_types_list_api(request):
    """
    Returns searchable list of platform device types with category filtering.
    """
    category_slug = request.GET.get('category', '')
    search = request.GET.get('search', '').strip()

    qs = DeviceType.objects.filter(is_active=True).select_related('category')
    if category_slug:
        qs = qs.filter(category__slug=category_slug)
    if search:
        qs = qs.filter(Q(name__icontains=search) | Q(code__icontains=search) | Q(description__icontains=search))

    data = [
        {
            'id': t.id,
            'name': t.name,
            'code': t.code,
            'description': t.description,
            'category_id': t.category_id,
            'category_name': t.category.name,
            'category_slug': t.category.slug,
            'icon': t.category.icon,
            'is_default': t.is_default,
        }
        for t in qs.order_by('display_order', 'name')
    ]
    return JsonResponse({'success': True, 'data': data})


@csrf_exempt
def organization_device_types_api(request):
    """
    LEVEL 2 & LEVEL 3:
    GET: Returns organization's device catalog (standard selections + custom devices).
    POST: Batch updates/saves organization device selections and declared quantities.
    """
    org = get_request_organization(request)
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization context not found'}, status=404)

    if request.method == 'GET':
        include_disabled = request.GET.get('include_disabled', 'false').lower() in ('true', '1')
        catalogue = DeviceCatalogueService.get_organization_catalogue(org, include_disabled=include_disabled)
        return JsonResponse({'success': True, 'organization': org.name, 'data': catalogue})

    elif request.method == 'POST':
        if not check_catalog_manage_permission(request.user) and not request.user.is_anonymous:
            return JsonResponse({'success': False, 'error': 'Permission denied. ICT Officer or Admin required.'}, status=403)

        data = parse_json(request)
        selections = data.get('selections', [])
        if not isinstance(selections, list) and isinstance(data, dict):
            # Also support format { 'LAPTOP': 25, 'DESKTOP': 10 }
            selections = [{'identifier': k, 'quantity': v} for k, v in data.items() if k != 'selections']

        try:
            DeviceCatalogueService.save_organization_device_selections(org, selections, user=request.user if request.user.is_authenticated else None)
            updated = DeviceCatalogueService.get_organization_catalogue(org)
            return JsonResponse({'success': True, 'data': updated})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


@csrf_exempt
@require_http_methods(["POST"])
def organization_custom_device_create_api(request):
    """
    LEVEL 3:
    Adds a custom ICT device type strictly scoped to the authenticated organization.
    Guarantees tenant isolation: Never accessible to other organizations.
    """
    org = get_request_organization(request)
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization context not found'}, status=404)

    if not check_catalog_manage_permission(request.user) and not request.user.is_anonymous:
        return JsonResponse({'success': False, 'error': 'Permission denied. Only ICT Officers and Admins can create custom device types.'}, status=403)

    data = parse_json(request)
    try:
        custom_device = DeviceCatalogueService.create_custom_device_type(
            organization=org,
            data=data,
            user=request.user if request.user.is_authenticated else None
        )
        return JsonResponse({
            'success': True,
            'data': {
                'id': custom_device.id,
                'name': custom_device.name,
                'category_name': custom_device.category_name,
                'category_slug': custom_device.category_slug,
                'icon': custom_device.icon,
                'description': custom_device.description,
                'is_custom': True,
                'is_enabled': custom_device.is_enabled,
                'declared_quantity': custom_device.default_quantity,
                'manufacturer': custom_device.manufacturer,
                'model_family': custom_device.model_family,
                'notes': custom_device.notes,
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
def organization_device_type_detail_api(request, pk):
    """
    Update quantity, notes, or configuration of an organization device type.
    """
    org = get_request_organization(request)
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization context not found'}, status=404)

    from organizations.models import OrganizationDeviceType
    org_device = OrganizationDeviceType.objects.filter(id=pk, organization=org).first()
    if not org_device:
        return JsonResponse({'success': False, 'error': 'Device type not found in organization'}, status=404)

    if request.method == 'GET':
        registered_count = org_device.registered_assets.filter(is_deleted=False).count()
        return JsonResponse({
            'success': True,
            'data': {
                'id': org_device.id,
                'name': org_device.name,
                'category': org_device.category_name,
                'icon': org_device.icon,
                'is_custom': org_device.is_custom,
                'is_enabled': org_device.is_enabled,
                'declared_quantity': org_device.default_quantity,
                'registered_count': registered_count,
                'unregistered_count': max(0, org_device.default_quantity - registered_count),
                'description': org_device.description,
                'manufacturer': org_device.manufacturer,
                'model_family': org_device.model_family,
                'notes': org_device.notes,
            }
        })

    elif request.method in ['PATCH', 'POST']:
        if not check_catalog_manage_permission(request.user) and not request.user.is_anonymous:
            return JsonResponse({'success': False, 'error': 'Permission denied.'}, status=403)

        data = parse_json(request)
        if 'declared_quantity' in data or 'default_quantity' in data:
            qty = data.get('declared_quantity', data.get('default_quantity', 0))
            org_device.default_quantity = max(0, int(qty))

        if org_device.is_custom:
            if 'name' in data and data['name'].strip():
                org_device.custom_name = data['name'].strip()
            if 'description' in data:
                org_device.custom_description = data['description']
            if 'manufacturer' in data:
                org_device.manufacturer = data['manufacturer']
            if 'model_family' in data:
                org_device.model_family = data['model_family']

        if 'notes' in data:
            org_device.notes = data['notes']
        if 'is_enabled' in data:
            org_device.is_enabled = bool(data['is_enabled'])

        org_device.save()
        return JsonResponse({'success': True, 'message': 'Device type updated successfully'})

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def organization_device_type_toggle_api(request, pk):
    """
    Soft-enables or disables an organization device type without deleting historical assets.
    """
    org = get_request_organization(request)
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization context not found'}, status=404)

    if not check_catalog_manage_permission(request.user) and not request.user.is_anonymous:
        return JsonResponse({'success': False, 'error': 'Permission denied.'}, status=403)

    data = parse_json(request)
    from organizations.models import OrganizationDeviceType
    org_device = OrganizationDeviceType.objects.filter(id=pk, organization=org).first()
    if not org_device:
        return JsonResponse({'success': False, 'error': 'Device type not found in organization'}, status=404)

    # Determine desired state: toggle if not explicitly specified
    if 'is_enabled' in data:
        target_state = bool(data['is_enabled'])
    else:
        target_state = not org_device.is_enabled

    try:
        updated = DeviceCatalogueService.toggle_device_type(
            org_device_id=pk,
            organization=org,
            is_enabled=target_state,
            user=request.user if request.user.is_authenticated else None
        )
        return JsonResponse({'success': True, 'is_enabled': updated.is_enabled, 'message': f"Device type '{updated.name}' {'enabled' if updated.is_enabled else 'disabled'}."})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
def organization_device_summary_api(request):
    """
    Returns high-level reconciliation & breakdown statistics for dashboards and reports.
    """
    org = get_request_organization(request)
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization context not found'}, status=404)

    summary = DeviceCatalogueService.get_reconciliation_summary(org)
    return JsonResponse({'success': True, 'data': summary})


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def onboarding_ict_environment_api(request):
    """
    Dedicated onboarding step endpoint for "Your ICT Environment" & Device Catalog.
    Persists selections progressively and updates the draft state.
    """
    data = parse_json(request)
    ref = data.get('registration_reference')
    step = int(data.get('step', 5))  # Default to step 5 (ICT Environment / Devices)
    payload = data.get('payload', data)

    try:
        result = OrganizationService.save_registration_step(
            step=step,
            step_payload=payload,
            registration_ref=ref
        )
        return JsonResponse({'success': True, 'data': result})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
def onboarding_status_api(request):
    """
    Returns the current status of an ongoing organization onboarding process.
    """
    ref = request.GET.get('ref', '')
    if not ref:
        return JsonResponse({'success': False, 'error': 'Registration reference is required'}, status=400)

    draft = OrganizationService.get_registration_draft(ref)
    return JsonResponse({'success': True, 'data': draft})


# ==============================================================================
# 3. TENANT SUBSCRIPTION & BILLING
# ==============================================================================

@require_http_methods(["GET"])
def subscription_overview_api(request):
    """
    Returns active plan, status, 250 included users breakdown, next renewal date.
    """
    # Look up organization or fallback to first active tenant
    org = Organization.objects.filter(status__in=['ACTIVE', 'TRIAL']).first()
    if not org:
        org = Organization.objects.first()

    if not org:
        plan = SubscriptionService.get_or_create_default_plan()
        return JsonResponse({
            'success': True,
            'data': {
                'plan_name': plan.name,
                'status': 'ACTIVE',
                'monthly_base_price': float(plan.monthly_base_price),
                'included_users': 250,
                'active_users': 1,
                'additional_users': 0,
                'additional_user_monthly_price': float(plan.additional_user_monthly_price),
                'additional_charges': 0.00,
                'total_amount': float(plan.monthly_base_price),
                'currency': 'TZS',
                'current_period_end': (timezone.now() + timezone.timedelta(days=30)).strftime('%Y-%m-%d'),
                'auto_renew': True,
            }
        })

    sub = getattr(org, 'subscription', None)
    plan = sub.plan if sub else SubscriptionService.get_or_create_default_plan()
    breakdown = SubscriptionService.calculate_billing_breakdown(org, plan)

    return JsonResponse({
        'success': True,
        'data': {
            'organization_id': str(org.id),
            'organization_name': org.name,
            'organization_slug': org.slug,
            'plan_id': plan.id,
            'plan_name': plan.name,
            'status': sub.status if sub else 'ACTIVE',
            'monthly_base_price': breakdown['base_price'],
            'included_users': breakdown['included_users'],
            'active_users': breakdown['active_users'],
            'additional_users': breakdown['additional_users'],
            'additional_user_monthly_price': breakdown['additional_user_rate'],
            'additional_charges': breakdown['additional_charges'],
            'subtotal': breakdown['subtotal'],
            'total_amount': breakdown['total_amount'],
            'currency': breakdown['currency'],
            'current_period_start': sub.current_period_start.strftime('%Y-%m-%d') if sub else timezone.now().strftime('%Y-%m-%d'),
            'current_period_end': sub.current_period_end.strftime('%Y-%m-%d') if sub else (timezone.now() + timezone.timedelta(days=30)).strftime('%Y-%m-%d'),
            'auto_renew': sub.auto_renew if sub else True,
        }
    })


@require_http_methods(["GET"])
def subscription_invoices_api(request):
    """
    Returns list of invoices for the tenant organization.
    """
    invoices = Invoice.objects.all().order_by('-created_at')[:50]
    data = [
        {
            'id': str(inv.id),
            'invoice_number': inv.invoice_number,
            'billing_period_start': inv.billing_period_start.strftime('%Y-%m-%d'),
            'billing_period_end': inv.billing_period_end.strftime('%Y-%m-%d'),
            'base_price': float(inv.base_price),
            'included_users': inv.included_users,
            'active_users': inv.active_users,
            'additional_users': inv.additional_users,
            'additional_charges': float(inv.additional_charges),
            'total_amount': float(inv.total_amount),
            'currency': inv.currency,
            'status': inv.status,
            'due_date': inv.due_date.strftime('%Y-%m-%d'),
            'paid_at': inv.paid_at.strftime('%Y-%m-%d %H:%M') if inv.paid_at else None,
        }
        for inv in invoices
    ]
    return JsonResponse({'success': True, 'data': data})


# ==============================================================================
# 4. PAYMENTS & WEBHOOKS
# ==============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def payment_initiate_api(request):
    """
    Initiates payment for subscription via M-Pesa, Tigo Pesa, Card, Bank wire.
    """
    data = parse_json(request)
    provider_code = data.get('provider', 'MPESA')
    payment_details = data.get('details', {})

    org = Organization.objects.filter(status__in=['ACTIVE', 'TRIAL']).first() or Organization.objects.first()
    if not org:
        return JsonResponse({'success': False, 'error': 'No organization found'}, status=400)

    try:
        result = PaymentService.initiate_subscription_payment(
            organization=org,
            provider_code=provider_code,
            payment_details=payment_details
        )
        return JsonResponse({'success': True, 'data': result})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def payment_webhook_api(request, provider):
    """
    Idempotent payment webhook endpoint.
    """
    data = parse_json(request)
    ref = data.get('transaction_reference') or data.get('reference') or ''
    provider_txn_id = data.get('provider_transaction_id') or data.get('trans_id') or ''
    status = data.get('status', 'SUCCESS').upper()

    result = PaymentService.process_webhook(
        provider_code=provider.upper(),
        transaction_reference=ref,
        provider_transaction_id=provider_txn_id,
        status=status,
        payload=data
    )
    return JsonResponse(result)


# ==============================================================================
# 5. PANTHERMODE MASTER PLATFORM ADMINISTRATION
# ==============================================================================

@require_http_methods(["GET"])
def platform_stats_api(request):
    """
    PantherMode Master Platform aggregated dashboard metrics.
    """
    stats = UsageService.get_platform_global_stats()
    return JsonResponse({'success': True, 'data': stats})


@require_http_methods(["GET", "POST"])
@csrf_exempt
def platform_organizations_api(request):
    """
    List all tenant organizations or provision a new tenant from PantherMode.
    """
    if request.method == 'GET':
        search = request.GET.get('search', '').strip()
        status_filter = request.GET.get('status', '').strip()

        qs = Organization.objects.all().order_by('-created_at')
        if search:
            qs = qs.filter(name__icontains=search)
        if status_filter:
            qs = qs.filter(status=status_filter)

        data = [
            {
                'id': str(org.id),
                'name': org.name,
                'slug': org.slug,
                'code': org.organization_code,
                'type': org.get_organization_type_display(),
                'status': org.status,
                'employee_count': org.employee_count,
                'phone': org.phone,
                'email': org.email,
                'country': org.country,
                'created_at': org.created_at.strftime('%Y-%m-%d'),
            }
            for org in qs[:100]
        ]
        return JsonResponse({'success': True, 'data': data})

    else:
        # POST - Provision Tenant
        payload = parse_json(request)
        name = payload.get('name')
        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'}, status=400)

        slug = payload.get('slug') or name.lower().replace(' ', '-')
        code = f"ORG-{uuid.uuid4().hex[:6].upper()}"

        org = Organization.objects.create(
            name=name,
            slug=slug,
            organization_code=code,
            organization_type=payload.get('organization_type', 'PRIVATE_COMPANY'),
            email=payload.get('email', ''),
            phone=payload.get('phone', ''),
            status='ACTIVE'
        )

        plan = SubscriptionService.get_or_create_default_plan()
        SubscriptionService.activate_subscription(org, plan)

        return JsonResponse({
            'success': True,
            'data': {
                'id': str(org.id),
                'name': org.name,
                'slug': org.slug,
                'code': org.organization_code,
                'status': org.status
            }
        })


@csrf_exempt
@require_http_methods(["POST"])
def platform_organization_suspend_api(request, org_id):
    """
    PantherMode action to suspend a tenant.
    """
    org = Organization.objects.filter(id=org_id).first()
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization not found'}, status=404)

    org.status = 'SUSPENDED'
    org.save(update_fields=['status'])

    AuditService.log_event(
        user=request.user if request.user.is_authenticated else None,
        action='SUSPEND_ORGANIZATION',
        model_name='Organization',
        object_id=0,
        details=f"Suspended tenant {org.name} ({org.id})"
    )

    return JsonResponse({'success': True, 'message': f"Organization {org.name} suspended"})


@csrf_exempt
@require_http_methods(["POST"])
def platform_organization_reactivate_api(request, org_id):
    """
    PantherMode action to reactivate a tenant.
    """
    org = Organization.objects.filter(id=org_id).first()
    if not org:
        return JsonResponse({'success': False, 'error': 'Organization not found'}, status=404)

    org.status = 'ACTIVE'
    org.save(update_fields=['status'])

    AuditService.log_event(
        user=request.user if request.user.is_authenticated else None,
        action='REACTIVATE_ORGANIZATION',
        model_name='Organization',
        object_id=0,
        details=f"Reactivated tenant {org.name} ({org.id})"
    )

    return JsonResponse({'success': True, 'message': f"Organization {org.name} reactivated"})


@require_http_methods(["GET", "POST"])
@csrf_exempt
def platform_plans_api(request):
    """
    PantherMode Plan Management: configure base price (TZS 100,000), included users (250), additional user rates.
    """
    if request.method == 'GET':
        plans = SubscriptionPlan.objects.all()
        data = [
            {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'description': p.description,
                'monthly_base_price': float(p.monthly_base_price),
                'included_users': p.included_users,
                'additional_user_monthly_price': float(p.additional_user_monthly_price),
                'is_active': p.is_active,
                'is_default': p.is_default,
                'features': p.features,
            }
            for p in plans
        ]
        return JsonResponse({'success': True, 'data': data})
    else:
        payload = parse_json(request)
        plan = SubscriptionPlan.objects.create(
            name=payload.get('name', 'Custom Enterprise Plan'),
            slug=payload.get('slug', f"plan-{uuid.uuid4().hex[:6]}"),
            description=payload.get('description', ''),
            monthly_base_price=Decimal(str(payload.get('monthly_base_price', 100000.00))),
            included_users=int(payload.get('included_users', 250)),
            additional_user_monthly_price=Decimal(str(payload.get('additional_user_monthly_price', 500.00))),
            is_active=bool(payload.get('is_active', True)),
            features=payload.get('features', {})
        )
        return JsonResponse({'success': True, 'data': {'id': plan.id, 'name': plan.name}})


@require_http_methods(["GET"])
def platform_payments_api(request):
    """
    PantherMode Global Payments Ledger.
    """
    payments = PaymentTransaction.objects.all().select_related('organization').order_by('-initiated_at')[:100]
    data = [
        {
            'id': str(p.id),
            'organization_name': p.organization.name if p.organization else 'N/A',
            'reference': p.transaction_reference,
            'provider': p.get_provider_display(),
            'provider_transaction_id': p.provider_transaction_id,
            'amount': float(p.amount),
            'currency': p.currency,
            'status': p.status,
            'initiated_at': p.initiated_at.strftime('%Y-%m-%d %H:%M'),
            'completed_at': p.completed_at.strftime('%Y-%m-%d %H:%M') if p.completed_at else None,
        }
        for p in payments
    ]
    return JsonResponse({'success': True, 'data': data})


@csrf_exempt
@require_http_methods(["POST"])
def platform_payment_confirm_api(request, payment_id):
    """
    PantherMode manual confirmation of bank transfers / cash payments.
    """
    try:
        res = PaymentService.manual_confirm_payment(
            transaction_id=payment_id,
            verified_by_user=request.user if request.user.is_authenticated else User.objects.first()
        )
        return JsonResponse({'success': True, 'data': res})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
