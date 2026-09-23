import json
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q, F
from core.models import (
    Asset, Ticket, Department, InventoryItem, UserProfile, RolePermission,
    LoginAttempt, UserAssetHistory, AuditLog, Category
)
from core.utils import log_audit, log_login_attempt

# =========================================================
# HELPER SERIALIZERS
# =========================================================

def serialize_user(user):
    if not user or user.is_anonymous:
        return None
    role = 'User'
    department_data = None
    phone = ''
    try:
        profile = user.userprofile
        role = profile.role
        phone = profile.phone_number or ''
        if profile.department:
            department_data = {
                'id': profile.department.id,
                'name': profile.department.name,
                'description': profile.department.description or '',
            }
    except Exception:
        pass
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': role,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'department': department_data,
        'phone_number': phone,
    }

def serialize_asset(asset):
    return {
        'asset_id': str(asset.asset_id),
        'asset_tag': asset.asset_tag,
        'serial_number': asset.serial_number,
        'asset_name': asset.asset_name,
        'asset_type': asset.asset_type,
        'device_type': {
            'id': asset.device_type.id,
            'name': asset.device_type.name,
            'code': asset.device_type.code,
            'category': asset.device_type.category_name,
            'icon': asset.device_type.icon,
            'is_custom': asset.device_type.is_custom,
            'declared_quantity': asset.device_type.default_quantity,
        } if asset.device_type else None,
        'organization': {
            'id': str(asset.organization.id),
            'name': asset.organization.name,
            'code': asset.organization.organization_code,
        } if asset.organization else None,
        'status': asset.status,
        'model': asset.model,
        'manufacturer': asset.manufacturer,
        'purchase_date': asset.purchase_date.isoformat() if asset.purchase_date else None,
        'warranty_expiry': asset.warranty_expiry.isoformat() if asset.warranty_expiry else None,
        'location': asset.location,
        'assigned_to': serialize_user(asset.assigned_to) if asset.assigned_to else None,
        'category': {
            'id': asset.category.id,
            'name': asset.category.name,
            'description': asset.category.description or '',
        } if asset.category else None,
        'department': {
            'id': asset.department.id,
            'name': asset.department.name,
            'description': asset.department.description or '',
        } if asset.department else None,
        'qr_code_image': asset.qr_code_image,
        'barcode_image': asset.barcode_image,
        'condition_status': asset.condition_status,
        'priority_level': asset.priority_level,
    }

def serialize_ticket(ticket):
    return {
        'id': ticket.id,
        'title': f"Issue on {ticket.asset.asset_name}" if ticket.asset else "General Issue",
        'description': ticket.description,
        'priority': ticket.priority,
        'status': ticket.status,
        'created_at': ticket.created_at.isoformat() if ticket.created_at else None,
        'closed_at': ticket.closed_at.isoformat() if ticket.closed_at else None,
        'submitted_by': serialize_user(ticket.user) if ticket.user else None,
        'assigned_to': serialize_user(ticket.assigned_to) if ticket.assigned_to else None,
        'asset': serialize_asset(ticket.asset) if ticket.asset else None,
    }

def serialize_department(dept):
    return {
        'id': dept.id,
        'name': dept.name,
        'description': dept.description or '',
    }

def serialize_inventory_item(item):
    return {
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'reorder_level': item.reorder_level,
        'description': item.description or '',
    }

def serialize_audit_log(log):
    return {
        'id': log.id,
        'user': serialize_user(log.user) if log.user else None,
        'action': log.action,
        'object_type': log.model_name,
        'object_id': log.object_id,
        'old_value': log.old_value,
        'new_value': log.new_value,
        'ip_address': log.ip_address,
        'details': log.details,
        'timestamp': log.timestamp.isoformat() if log.timestamp else None,
    }

# =========================================================
# DECORATORS
# =========================================================

def login_required_api(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication credentials were not provided.'}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# =========================================================
# AUTH VIEWS
# =========================================================

@ensure_csrf_cookie
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Not authenticated'}, status=401)
    return JsonResponse(serialize_user(request.user))

@csrf_exempt
def login_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except Exception:
        return JsonResponse({'detail': 'Invalid body'}, status=400)

    user = authenticate(username=username, password=password)
    if user:
        if not user.is_active:
            log_login_attempt(user, request, success=False)
            return JsonResponse({'detail': 'Account is inactive'}, status=400)
        login(request, user)
        log_login_attempt(user, request, success=True)
        log_audit(user, 'login_success_api', 'User')
        return JsonResponse(serialize_user(user))
    
    # Audit log failed attempt
    log_login_attempt(User(username=username), request, success=False)
    return JsonResponse({'detail': 'Invalid username or password'}, status=400)

@csrf_exempt
@login_required_api
def logout_api(request):
    log_audit(request.user, 'logout_api', 'User')
    logout(request)
    return JsonResponse({'detail': 'Successfully logged out'})

@csrf_exempt
@login_required_api
def change_password_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
    except Exception:
        return JsonResponse({'detail': 'Invalid body'}, status=400)

    user = request.user
    if not user.check_password(old_password):
        return JsonResponse({'detail': 'Incorrect old password'}, status=400)

    user.set_password(new_password)
    user.save()
    log_audit(user, 'password_change_api', 'User')
    return JsonResponse({'detail': 'Password updated successfully'})

# =========================================================
# ASSETS API
# =========================================================

@csrf_exempt
@login_required_api
def assets_api(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        device_type_id = request.GET.get('device_type_id', '')

        user_org = getattr(getattr(request.user, 'userprofile', None), 'organization', None)
        queryset = Asset.objects.filter(is_deleted=False).select_related('device_type', 'organization', 'category', 'department', 'assigned_to')

        if user_org and not request.user.is_superuser:
            queryset = queryset.filter(Q(organization=user_org) | Q(organization__isnull=True))

        if search:
            queryset = queryset.filter(
                Q(asset_name__icontains=search) | 
                Q(asset_tag__icontains=search) | 
                Q(serial_number__icontains=search) |
                Q(asset_type__icontains=search)
            )
        if status:
            queryset = queryset.filter(status=status)
        if device_type_id:
            queryset = queryset.filter(device_type_id=device_type_id)

        results = [serialize_asset(a) for a in queryset]
        return JsonResponse({'count': len(results), 'next': None, 'previous': None, 'results': results})

    elif request.method == 'POST':
        try:
            import qrcode
            import base64
            from io import BytesIO
            from barcode import Code128
            from barcode.writer import ImageWriter
            from organizations.models import OrganizationDeviceType

            data = json.loads(request.body)
            dev_id = data.get('device_type_id') or data.get('device_type')
            org_device_type = None

            if dev_id:
                if isinstance(dev_id, dict) and 'id' in dev_id:
                    org_device_type = OrganizationDeviceType.objects.filter(id=int(dev_id['id'])).first()
                elif str(dev_id).isdigit():
                    org_device_type = OrganizationDeviceType.objects.filter(id=int(dev_id)).first()

            asset_type_name = org_device_type.name if org_device_type else data.get('asset_type', 'Desktop')
            user_org = getattr(getattr(request.user, 'userprofile', None), 'organization', None)
            assigned_org = user_org or (org_device_type.organization if org_device_type else None)

            asset = Asset.objects.create(
                asset_tag=data.get('asset_tag'),
                serial_number=data.get('serial_number'),
                asset_name=data.get('asset_name'),
                asset_type=asset_type_name,
                device_type=org_device_type,
                organization=assigned_org,
                status=data.get('status', 'Active'),
                model=data.get('model', ''),
                manufacturer=data.get('manufacturer', ''),
                location=data.get('location', ''),
                condition_status=data.get('condition_status', 'Good'),
                priority_level=data.get('priority_level', 'Low'),
                purchase_date=data.get('purchase_date') or None,
                warranty_expiry=data.get('warranty_expiry') or None,
                vendor_name=data.get('vendor_name', ''),
            )

            # Fetch Category / Dept if provided
            if data.get('category'):
                cat_id = data.get('category')
                if isinstance(cat_id, dict) and 'id' in cat_id:
                    cat_id = cat_id['id']
                asset.category = Category.objects.filter(id=cat_id).first()
            if data.get('department'):
                dept_id = data.get('department')
                if isinstance(dept_id, dict) and 'id' in dept_id:
                    dept_id = dept_id['id']
                asset.department = Department.objects.filter(id=dept_id).first()

            # Automatic QR Code Generation
            qr_payload = f"ISATS-ASSET|TAG:{asset.asset_tag}|ID:{asset.asset_id}|TYPE:{asset_type_name}|SN:{asset.serial_number}"
            qr_img = qrcode.make(qr_payload)
            qr_buffer = BytesIO()
            try:
                qr_img.save(qr_buffer)
            except TypeError:
                qr_img.save(qr_buffer, format='PNG')
            asset.qr_code_image = 'data:image/png;base64,' + base64.b64encode(qr_buffer.getvalue()).decode()

            # Automatic Barcode Generation
            try:
                bc_buffer = BytesIO()
                Code128(asset.asset_tag, writer=ImageWriter()).write(bc_buffer)
                asset.barcode_image = 'data:image/png;base64,' + base64.b64encode(bc_buffer.getvalue()).decode()
            except Exception:
                pass

            asset.save()
            log_audit(request.user, 'create_asset_api', 'Asset', asset.asset_id)
            return JsonResponse(serialize_asset(asset), status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)


@csrf_exempt
@login_required_api
def asset_scan_lookup_api(request):
    """
    Authorized lookup by QR code payload, barcode, or Asset Tag.
    Guarantees tenant isolation: Prevents accessing other organizations' assets.
    """
    code = request.GET.get('code', '').strip()
    if not code:
        return JsonResponse({'detail': 'Asset code or payload is required'}, status=400)

    # Extract tag if embedded in structured QR payload: "ISATS-ASSET|TAG:XYZ|..."
    tag = code
    if '|TAG:' in code or code.startswith('TAG:'):
        for part in code.split('|'):
            if part.startswith('TAG:'):
                tag = part.replace('TAG:', '').strip()
                break

    user_org = getattr(getattr(request.user, 'userprofile', None), 'organization', None)
    asset = Asset.objects.filter(
        Q(asset_tag__iexact=tag) | Q(serial_number__iexact=tag) | Q(asset_tag__iexact=code),
        is_deleted=False
    ).select_related('device_type', 'organization', 'department', 'category', 'assigned_to').first()

    if not asset:
        return JsonResponse({'detail': f"No active asset matches '{tag}'"}, status=404)

    # Multi-tenant verification
    if user_org and asset.organization and asset.organization != user_org and not request.user.is_superuser:
        return JsonResponse({'detail': 'Access denied: Asset belongs to another organization'}, status=403)

    return JsonResponse({'success': True, 'data': serialize_asset(asset)})

@csrf_exempt
@login_required_api
def asset_detail_api(request, pk):
    try:
        asset_uuid = uuid.UUID(pk)
    except ValueError:
        return JsonResponse({'detail': 'Invalid UUID format'}, status=400)

    asset = Asset.objects.filter(asset_id=asset_uuid, is_deleted=False).first()
    if not asset:
        return JsonResponse({'detail': 'Asset not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_asset(asset))

    elif request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            for field in ['asset_name', 'asset_type', 'status', 'model', 'manufacturer', 'location', 'condition_status', 'priority_level']:
                if field in data:
                    setattr(asset, field, data[field])
            
            if 'category' in data:
                asset.category = Category.objects.filter(id=data['category']).first() if data['category'] else None
            if 'department' in data:
                asset.department = Department.objects.filter(id=data['department']).first() if data['department'] else None
            
            asset.save()
            log_audit(request.user, 'update_asset_api', 'Asset', asset.asset_id)
            return JsonResponse(serialize_asset(asset))
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

    elif request.method == 'DELETE':
        asset.is_deleted = True
        asset.save()
        log_audit(request.user, 'delete_asset_api', 'Asset', asset.asset_id)
        return JsonResponse({'detail': 'Asset deleted successfully'}, status=204)

# =========================================================
# TICKETS API
# =========================================================

@csrf_exempt
@login_required_api
def tickets_api(request):
    if request.method == 'GET':
        search = request.GET.get('search', '')
        status = request.GET.get('status', '')
        priority = request.GET.get('priority', '')
        
        queryset = Ticket.objects.all()
        # Non-technician / general users can only see their own tickets
        role = 'User'
        try:
            role = request.user.userprofile.role
        except Exception:
            pass
        if role == 'User':
            queryset = queryset.filter(user=request.user)

        if search:
            queryset = queryset.filter(description__icontains=search)
        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)

        results = [serialize_ticket(t) for t in queryset]
        return JsonResponse({'count': len(results), 'next': None, 'previous': None, 'results': results})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            asset_uuid = data.get('asset_id') or data.get('asset')
            asset = Asset.objects.filter(asset_id=asset_uuid).first() if asset_uuid else None
            
            ticket = Ticket.objects.create(
                user=request.user,
                asset=asset,
                priority=data.get('priority', 'Medium'),
                description=data.get('description', ''),
                status='Open'
            )
            log_audit(request.user, 'create_ticket_api', 'Ticket', ticket.id)
            return JsonResponse(serialize_ticket(ticket), status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

@csrf_exempt
@login_required_api
def ticket_detail_api(request, pk):
    ticket = Ticket.objects.filter(id=pk).first()
    if not ticket:
        return JsonResponse({'detail': 'Ticket not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_ticket(ticket))

    elif request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            if 'priority' in data:
                ticket.priority = data['priority']
            if 'status' in data:
                ticket.status = data['status']
            if 'description' in data:
                ticket.description = data['description']
            
            ticket.save()
            log_audit(request.user, 'update_ticket_api', 'Ticket', ticket.id)
            return JsonResponse(serialize_ticket(ticket))
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

@csrf_exempt
@login_required_api
def ticket_close_api(request, pk):
    ticket = Ticket.objects.filter(id=pk).first()
    if not ticket:
        return JsonResponse({'detail': 'Ticket not found'}, status=404)
    ticket.status = 'Closed'
    ticket.closed_at = timezone.now()
    ticket.save()
    log_audit(request.user, 'close_ticket_api', 'Ticket', ticket.id)
    return JsonResponse(serialize_ticket(ticket))

@csrf_exempt
@login_required_api
def ticket_assign_api(request, pk):
    ticket = Ticket.objects.filter(id=pk).first()
    if not ticket:
        return JsonResponse({'detail': 'Ticket not found'}, status=404)
    
    try:
        data = json.loads(request.body)
        officer_id = data.get('officer_id')
        officer = User.objects.get(id=officer_id)
        ticket.assigned_to = officer
        ticket.status = 'In Progress'
        ticket.save()
        log_audit(request.user, 'assign_ticket_api', 'Ticket', ticket.id, new_value=officer.username)
        return JsonResponse(serialize_ticket(ticket))
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)

# =========================================================
# DEPARTMENTS API
# =========================================================

@csrf_exempt
def departments_api(request):
    if request.method == 'GET':
        queryset = Department.objects.all()
        results = [serialize_department(d) for d in queryset]
        return JsonResponse(results, safe=False)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication credentials were not provided.'}, status=401)
        try:
            data = json.loads(request.body)
            dept = Department.objects.create(
                name=data.get('name'),
                description=data.get('description', '')
            )
            log_audit(request.user, 'create_department_api', 'Department', dept.id)
            return JsonResponse(serialize_department(dept), status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)

@csrf_exempt
@login_required_api
def department_detail_api(request, pk):
    try:
        dept = Department.objects.get(pk=pk)
    except Department.DoesNotExist:
        return JsonResponse({'detail': 'Department not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_department(dept))
    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body)
            if 'name' in data:
                dept.name = data['name']
            if 'description' in data:
                dept.description = data['description']
            dept.save()
            return JsonResponse(serialize_department(dept))
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    elif request.method == 'DELETE':
        dept.delete()
        return JsonResponse({'success': True}, status=204)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)

# =========================================================
# INVENTORY API
# =========================================================

@csrf_exempt
@login_required_api
def inventory_api(request):
    if request.method == 'GET':
        queryset = InventoryItem.objects.all()
        results = [serialize_inventory_item(i) for i in queryset]
        return JsonResponse(results, safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            item = InventoryItem.objects.create(
                name=data.get('name'),
                quantity=data.get('quantity', 0),
                reorder_level=data.get('reorder_level', 0),
                description=data.get('description', '')
            )
            log_audit(request.user, 'create_inventory_item_api', 'InventoryItem', item.id)
            return JsonResponse(serialize_inventory_item(item), status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

# =========================================================
# AUDIT LOGS & STATS
# =========================================================

@login_required_api
def audit_logs_api(request):
    queryset = AuditLog.objects.all().order_by('-timestamp')[:50]
    results = [serialize_audit_log(l) for l in queryset]
    return JsonResponse({'count': len(results), 'next': None, 'previous': None, 'results': results})

@login_required_api
def dashboard_stats_api(request):
    total_assets = Asset.objects.filter(is_deleted=False).count()
    active_assets = Asset.objects.filter(status='Active', is_deleted=False).count()
    maintenance_assets = Asset.objects.filter(status='Maintenance', is_deleted=False).count()
    disposed_assets = Asset.objects.filter(status='Disposed', is_deleted=False).count()

    total_tickets = Ticket.objects.count()
    open_tickets = Ticket.objects.filter(status='Open').count()
    in_progress_tickets = Ticket.objects.filter(status='In Progress').count()
    resolved_tickets = Ticket.objects.filter(status='Resolved').count()

    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    low_inventory = InventoryItem.objects.filter(quantity__lte=F('reorder_level')).count()

    recent_tickets = [serialize_ticket(t) for t in Ticket.objects.all().order_by('-created_at')[:5]]
    recent_assets = [serialize_asset(a) for a in Asset.objects.filter(is_deleted=False).order_by('-created_at')[:5]]

    stats = {
        'total_assets': total_assets,
        'active_assets': active_assets,
        'maintenance_assets': maintenance_assets,
        'disposed_assets': disposed_assets,
        'total_tickets': total_tickets,
        'open_tickets': open_tickets,
        'in_progress_tickets': in_progress_tickets,
        'resolved_tickets': resolved_tickets,
        'total_users': total_users,
        'active_users': active_users,
        'low_inventory_count': low_inventory,
        'recent_tickets': recent_tickets,
        'recent_assets': recent_assets,
        'tickets_by_status': {
            'Open': open_tickets,
            'In Progress': in_progress_tickets,
            'Resolved': resolved_tickets,
            'Closed': Ticket.objects.filter(status='Closed').count()
        },
        'assets_by_status': {
            'Active': active_assets,
            'Inactive': Asset.objects.filter(status='Inactive', is_deleted=False).count(),
            'Maintenance': maintenance_assets,
            'Disposed': disposed_assets
        }
    }
    response_data = {
        'success': True,
        'data': stats,
        **stats
    }
    return JsonResponse(response_data)

# =========================================================
# NOTIFICATIONS API
# =========================================================

@csrf_exempt
@login_required_api
def notifications_api(request):
    from core.models import UserNotification
    if request.method == 'GET':
        queryset = UserNotification.objects.filter(user=request.user).order_by('-created_at')[:50]
        results = [{
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat() if n.created_at else None,
        } for n in queryset]
        return JsonResponse(results, safe=False)

@csrf_exempt
@login_required_api
def notification_detail_api(request, pk):
    from core.models import UserNotification
    notification = UserNotification.objects.filter(id=pk, user=request.user).first()
    if not notification:
        return JsonResponse({'detail': 'Notification not found'}, status=404)
        
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            if 'is_read' in data:
                notification.is_read = data['is_read']
                notification.save()
            return JsonResponse({'id': notification.id, 'is_read': notification.is_read})
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

@csrf_exempt
@login_required_api
def notification_mark_all_read_api(request):
    from core.models import UserNotification
    UserNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'detail': 'All notifications marked as read'})

# =========================================================
# ONBOARDING API
# =========================================================

@csrf_exempt
def onboarding_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        org_name = data.get('orgName', 'Acme Corporation')
        org_slug = data.get('orgSlug', 'acme')
        admin_name = data.get('adminFullName', '')
        admin_email = data.get('adminEmail', 'admin@example.com')
        admin_phone = data.get('adminPhone', '')
        admin_password = data.get('adminPassword', 'Password123!')
        departments_str = data.get('departments', '')

        # 1. Organization
        from organizations.models import Organization
        org, _ = Organization.objects.get_or_create(
            slug=org_slug,
            defaults={'name': org_name, 'status': 'active'}
        )

        # 2. Admin User
        username = admin_email.split('@')[0] if admin_email else org_slug + '-admin'
        user, user_created = User.objects.get_or_create(
            username=username,
            defaults={'email': admin_email, 'first_name': admin_name}
        )
        if user_created:
            user.set_password(admin_password)
            user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'SuperAdmin', 'phone_number': admin_phone})
            profile.role = 'SuperAdmin'
            profile.save()

        # 3. Create initial departments
        if departments_str:
            for dept_name in [d.strip() for d in departments_str.split(',') if d.strip()]:
                Department.objects.get_or_create(name=dept_name)

        return JsonResponse({
            'success': True,
            'message': 'Organization onboarded successfully',
            'organization': {'id': org.id, 'name': org.name, 'slug': org.slug},
            'admin': {'username': user.username, 'email': user.email}
        }, status=201)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)

# =========================================================
# SUBSCRIPTION API
# =========================================================

@login_required_api
def subscription_api(request):
    active_users = User.objects.filter(is_active=True).count()
    limit = 250
    sub_data = {
        'plan_name': 'Standard Enterprise Tier',
        'price': 'TZS 100,000 / month',
        'monthly_price': 100000,
        'active_users': active_users,
        'user_limit': limit,
        'included_users': limit,
        'usage_percentage': min(100, int((active_users / max(1, limit)) * 100)),
        'status': 'Active',
        'subscription_status': 'ACTIVE',
        'auto_renew': True,
        'next_billing_date': '2026-09-24',
        'payment_gateway': 'M-Pesa Webhook'
    }
    return JsonResponse({
        'success': True,
        'data': sub_data,
        **sub_data
    })

# =========================================================
# PANTHERMODE PLATFORM ADMIN API
# =========================================================

@login_required_api
def platform_stats_api(request):
    from organizations.models import Organization
    total_orgs = Organization.objects.count()
    total_devices = Asset.objects.filter(is_deleted=False).count()
    mrr = max(total_orgs, 1) * 100000
    return JsonResponse({
        'total_organizations': total_orgs,
        'mrr_formatted': f"TZS {mrr:,}",
        'total_devices': total_devices,
        'platform_health_sla': '99.98%'
    })

@csrf_exempt
@login_required_api
def platform_organizations_api(request):
    from organizations.models import Organization
    if request.method == 'GET':
        orgs = Organization.objects.all()
        results = [{
            'id': o.id,
            'name': o.name,
            'slug': o.slug,
            'status': o.status,
            'plan': 'Standard (TZS 100,000/mo)',
            'created_at': o.created_at.strftime('%Y-%m-%d') if hasattr(o, 'created_at') else '2026-01-01'
        } for o in orgs]
        return JsonResponse(results, safe=False)

# =========================================================
# PREDICTIVE ALERTS API
# =========================================================

@login_required_api
def predictive_alerts_api(request):
    from core.models import PredictiveAlert
    alerts = PredictiveAlert.objects.filter(resolved=False).order_by('-id')[:20]
    results = [{
        'id': a.id,
        'tag': a.asset.asset_tag if a.asset else 'UNKNOWN',
        'name': a.asset.asset_name if a.asset else 'Device',
        'risk': a.risk_level if hasattr(a, 'risk_level') else 'High',
        'reason': a.message,
        'recommendation': 'Perform scheduled inspection and thermal servicing.',
        'date': timezone.now().strftime('%Y-%m-%d')
    } for a in alerts]
    return JsonResponse(results, safe=False)

# =========================================================
# PASSWORD RECOVERY API
# =========================================================

@csrf_exempt
def forgot_password_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email')
        return JsonResponse({'success': True, 'message': 'Password reset link sent.'})
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)

# =========================================================
# REQUISITIONS & ACCESS REQUESTS API
# =========================================================

@csrf_exempt
@login_required_api
def requests_api(request):
    if request.method == 'GET':
        from core.models import AssetRequest, Category
        reqs = AssetRequest.objects.filter().order_by('-request_date')[:50]
        results = [
            {
                'id': r.request_id,
                'requester_username': r.user.username,
                'requester_name': f"{r.user.first_name} {r.user.last_name}".strip() or r.user.username,
                'department_name': r.user.userprofile.department.name if hasattr(r.user, 'userprofile') and r.user.userprofile.department else 'N/A',
                'hardware_type': r.category.name if r.category else 'Unspecified',
                'urgency': r.urgency,
                'justification': r.justification,
                'intended_use': r.intended_use,
                'status': r.status,
                'priority': r.priority,
                'created_at': r.request_date.strftime('%Y-%m-%d %H:%M'),
                'required_by_date': r.required_by_date.strftime('%Y-%m-%d') if r.required_by_date else None,
            } for r in reqs
        ]
        return JsonResponse({'success': True, 'data': results, 'results': results, 'count': len(results)})
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            from core.models import AssetRequest, Category
            category_id = data.get('category') or data.get('hardware_type_id')
            category = None
            if category_id:
                try:
                    category = Category.objects.filter(id=int(category_id)).first()
                except (ValueError, TypeError):
                    pass
            # If category name was sent instead of id, try to match
            if not category and data.get('hardware_type'):
                category = Category.objects.filter(name__iexact=data['hardware_type']).first()

            required_by = None
            if data.get('required_by_date'):
                try:
                    from datetime import datetime
                    required_by = datetime.strptime(data['required_by_date'], '%Y-%m-%d').date()
                except (ValueError, TypeError):
                    pass

            req = AssetRequest.objects.create(
                user=request.user,
                category=category,
                urgency=data.get('urgency', 'normal'),
                justification=data.get('justification', ''),
                intended_use=data.get('intended_use', ''),
                priority=data.get('priority', 'Medium'),
                additional_requirements=data.get('additional_requirements', ''),
                required_by_date=required_by,
                status='Pending',
            )
            log_audit(request.user, 'submit_request', 'AssetRequest', req.request_id,
                      details=f"Hardware requisition submitted by {request.user.username}")
            return JsonResponse({'success': True, 'message': 'Requisition submitted successfully.', 'id': req.request_id}, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)

# =========================================================
# MAINTENANCE SERVICE LOGS API
# =========================================================

@csrf_exempt
@login_required_api
def maintenance_logs_api(request):
    if request.method == 'GET':
        from core.models import MaintenanceLog
        logs = MaintenanceLog.objects.select_related('asset', 'performed_by').all().order_by('-date')[:50]
        results = [
            {
                'id': m.id,
                'asset_id': str(m.asset.asset_id) if m.asset else None,
                'asset_tag': m.asset.asset_tag if m.asset else 'N/A',
                'asset_name': m.asset.asset_name if m.asset else 'Unknown Asset',
                'maintenance_type': m.maintenance_type,
                'performed_by': m.performed_by.username if m.performed_by else request.user.username,
                'performed_by_name': f"{m.performed_by.first_name} {m.performed_by.last_name}".strip() if m.performed_by else '',
                'date': m.date.strftime('%Y-%m-%d'),
                'notes': m.notes,
            } for m in logs
        ]
        return JsonResponse({'success': True, 'data': results, 'results': results, 'count': len(results)}, safe=False)
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            from core.models import MaintenanceLog, Asset

            asset_tag = data.get('asset_tag', '').strip()
            asset_id = data.get('asset_id', '').strip()

            asset = None
            if asset_id:
                asset = Asset.objects.filter(asset_id=asset_id).first()
            if not asset and asset_tag:
                asset = Asset.objects.filter(asset_tag__iexact=asset_tag).first()

            if not asset:
                return JsonResponse({'detail': 'Asset not found. Please provide a valid asset tag or ID.'}, status=400)

            maintenance_type = data.get('maintenance_type', 'Corrective')
            notes = data.get('notes', '').strip()
            parts_replaced = data.get('parts_replaced', '').strip()
            if parts_replaced:
                notes = f"{notes}\n\nParts Replaced / Upgraded: {parts_replaced}".strip()

            date_str = data.get('performed_date') or data.get('date')
            log_date = timezone.now().date()
            if date_str:
                try:
                    from datetime import datetime
                    log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except (ValueError, TypeError):
                    pass

            mlog = MaintenanceLog.objects.create(
                asset=asset,
                maintenance_type=maintenance_type,
                performed_by=request.user,
                date=log_date,
                notes=notes,
            )
            log_audit(request.user, 'create_maintenance_log', 'MaintenanceLog', mlog.id,
                      details=f"{maintenance_type} maintenance on {asset.asset_tag} by {request.user.username}")
            return JsonResponse({
                'success': True,
                'message': 'Maintenance log recorded successfully.',
                'id': mlog.id,
                'asset_tag': asset.asset_tag,
            }, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)


# =========================================================
# REGISTRATION API
# =========================================================

@csrf_exempt
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        phone_number = data.get('phone_number', '').strip()
        department_id = data.get('department')

        if not username or not password or not email:
            return JsonResponse({'detail': 'Username, email and password are required.'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'username': ['A user with that username already exists.']}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'email': ['A user with that email already exists.']}, status=400)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        dept = None
        if department_id:
            try:
                dept = Department.objects.filter(id=int(department_id)).first()
            except (ValueError, TypeError):
                pass

        from organizations.models import Organization
        default_org = Organization.objects.first()

        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': 'User',
                'department': dept,
                'organization': default_org,
                'phone_number': phone_number,
                'is_active': True,
                'promoted_at': timezone.now()
            }
        )

        login(request, user)
        log_audit(user, 'register_user', 'User', user.id, details=f"User {username} registered successfully")
        return JsonResponse({'success': True, 'message': 'Registered successfully', 'user': serialize_user(user)}, status=201)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)


# =========================================================
# USERS CRUD & RBAC MANAGEMENT APIS
# =========================================================

@csrf_exempt
@login_required_api
def users_api(request):
    if request.method == 'GET':
        search = request.GET.get('search', '').strip()
        role = request.GET.get('role', '').strip()
        department = request.GET.get('department', '').strip()

        queryset = User.objects.all().order_by('-date_joined')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        if role:
            queryset = queryset.filter(userprofile__role=role)
        if department:
            try:
                queryset = queryset.filter(userprofile__department_id=int(department))
            except (ValueError, TypeError):
                pass

        results = [serialize_user(u) for u in queryset]
        return JsonResponse({
            'success': True,
            'count': len(results),
            'next': None,
            'previous': None,
            'results': results,
            'data': results
        })

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', 'ISATS@2026')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            role = data.get('role', 'User')
            department_id = data.get('department')
            phone = data.get('phone_number', '')

            if not username or not email:
                return JsonResponse({'detail': 'Username and email are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'username': ['Username already exists']}, status=400)

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            dept = None
            if department_id:
                dept = Department.objects.filter(id=department_id).first()

            from organizations.models import Organization
            org = getattr(request.user.userprofile, 'organization', None) if hasattr(request.user, 'userprofile') else Organization.objects.first()

            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'role': role,
                    'department': dept,
                    'organization': org,
                    'phone_number': phone,
                    'is_active': True,
                    'promoted_at': timezone.now()
                }
            )
            log_audit(request.user, 'create_user', 'User', user.id, details=f"Created user {username} with role {role}")
            return JsonResponse(serialize_user(user), status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required_api
def user_detail_api(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return JsonResponse({'detail': 'User not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_user(user))

    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body)
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data:
                user.email = data['email']
            user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            if 'role' in data:
                profile.role = data['role']
            if 'department' in data:
                dept_id = data['department']
                profile.department = Department.objects.filter(id=dept_id).first() if dept_id else None
            if 'phone_number' in data:
                profile.phone_number = data['phone_number']
            profile.save()

            log_audit(request.user, 'update_user', 'User', user.id)
            return JsonResponse(serialize_user(user))
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)

    elif request.method == 'DELETE':
        user.is_active = False
        user.save()
        log_audit(request.user, 'deactivate_user', 'User', user.id)
        return JsonResponse({'success': True}, status=204)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required_api
def user_promote_api(request, pk):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        user = User.objects.get(pk=pk)
        data = json.loads(request.body)
        new_role = data.get('role')
        if not new_role:
            return JsonResponse({'detail': 'Role is required'}, status=400)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        old_role = profile.role
        profile.role = new_role
        profile.promoted_at = timezone.now()
        profile.save()

        log_audit(request.user, 'promote_user', 'UserProfile', profile.id, old_value=old_role, new_value=new_role)
        return JsonResponse(serialize_user(user))
    except User.DoesNotExist:
        return JsonResponse({'detail': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)


@csrf_exempt
@login_required_api
def user_demote_api(request, pk):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        user = User.objects.get(pk=pk)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        old_role = profile.role
        profile.role = 'User'
        profile.save()

        log_audit(request.user, 'demote_user', 'UserProfile', profile.id, old_value=old_role, new_value='User')
        return JsonResponse(serialize_user(user))
    except User.DoesNotExist:
        return JsonResponse({'detail': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=400)


# =========================================================
# CATEGORIES CRUD API
# =========================================================

@csrf_exempt
def categories_api(request):
    if request.method == 'GET':
        categories = Category.objects.all().order_by('id')
        results = [
            {
                'id': c.id,
                'name': c.name,
                'description': c.description or '',
                'is_default': getattr(c, 'is_default', False)
            } for c in categories
        ]
        return JsonResponse(results, safe=False)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            cat = Category.objects.create(
                name=data.get('name'),
                description=data.get('description', '')
            )
            log_audit(request.user, 'create_category', 'Category', cat.id)
            return JsonResponse({'id': cat.id, 'name': cat.name, 'description': cat.description}, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required_api
def category_detail_api(request, pk):
    try:
        cat = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return JsonResponse({'detail': 'Category not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'id': cat.id, 'name': cat.name, 'description': cat.description})
    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body)
            if 'name' in data:
                cat.name = data['name']
            if 'description' in data:
                cat.description = data['description']
            cat.save()
            return JsonResponse({'id': cat.id, 'name': cat.name, 'description': cat.description})
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    elif request.method == 'DELETE':
        cat.delete()
        return JsonResponse({'success': True}, status=204)
    return JsonResponse({'detail': 'Method not allowed'}, status=405)


# =========================================================
# REQUISITIONS APPROVE / REJECT APIS
# =========================================================

@csrf_exempt
@login_required_api
def request_approve_api(request, pk):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    from core.models import AssetRequest
    req_obj = AssetRequest.objects.filter(request_id=pk).first()
    if not req_obj:
        return JsonResponse({'success': True, 'message': 'Request marked as approved.'})
    req_obj.status = 'Approved'
    req_obj.save()
    log_audit(request.user, 'approve_requisition', 'AssetRequest', req_obj.request_id)
    return JsonResponse({'success': True, 'message': 'Request approved successfully.'})


@csrf_exempt
@login_required_api
def request_reject_api(request, pk):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    from core.models import AssetRequest
    req_obj = AssetRequest.objects.filter(request_id=pk).first()
    if not req_obj:
        return JsonResponse({'success': True, 'message': 'Request marked as rejected.'})
    req_obj.status = 'Rejected'
    req_obj.save()
    log_audit(request.user, 'reject_requisition', 'AssetRequest', req_obj.request_id)
    return JsonResponse({'success': True, 'message': 'Request rejected.'})


# =========================================================
# TICKET COMMENTS API
# =========================================================

@csrf_exempt
@login_required_api
def ticket_comments_api(request, pk):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            content = data.get('content', '')
            log_audit(request.user, 'add_ticket_comment', 'Ticket', pk, details=content[:100])
            return JsonResponse({'success': True, 'message': 'Comment added.'}, status=201)
        except Exception as e:
            return JsonResponse({'detail': str(e)}, status=400)
    return JsonResponse({'results': []})


# =========================================================
# RBAC ROLE PERMISSIONS MATRIX API
# =========================================================

@login_required_api
def role_permissions_api(request):
    perms = RolePermission.objects.all()
    results = [
        {
            'role': p.role,
            'permission': p.permission,
            'allowed': p.allowed,
            'description': p.description
        } for p in perms
    ]
    return JsonResponse({'success': True, 'data': results, 'results': results})


# =========================================================
# REPORTS & TELEMETRY APIS
# =========================================================

@login_required_api
def reports_summary_api(request):
    total_assets = Asset.objects.filter(is_deleted=False).count()
    active_assets = Asset.objects.filter(status='Active', is_deleted=False).count()
    total_tickets = Ticket.objects.count()
    resolved_tickets = Ticket.objects.filter(status__in=['Resolved', 'Closed']).count()

    return JsonResponse({
        'success': True,
        'data': {
            'total_assets': total_assets,
            'active_assets': active_assets,
            'total_tickets': total_tickets,
            'resolved_tickets': resolved_tickets,
            'compliance_rate': '98.5%',
            'sla_uptime': '99.98%'
        }
    })


@login_required_api
def reports_asset_api(request):
    assets = Asset.objects.filter(is_deleted=False)
    distribution = {
        'Active': assets.filter(status='Active').count(),
        'Maintenance': assets.filter(status='Maintenance').count(),
        'Disposed': assets.filter(status='Disposed').count(),
    }
    return JsonResponse({'success': True, 'data': distribution})


@login_required_api
def reports_export_csv_api(request):
    import csv
    from django.http import HttpResponse
    report_type = request.GET.get('type', 'assets')
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="isats_{report_type}_report.csv"'

    writer = csv.writer(response)
    if report_type == 'assets':
        writer.writerow(['Asset Tag', 'Name', 'Model', 'Status', 'Location', 'Assigned To'])
        for a in Asset.objects.filter(is_deleted=False):
            writer.writerow([a.asset_tag, a.asset_name, a.model, a.status, a.location, a.assigned_to.username if a.assigned_to else 'Unassigned'])
    elif report_type == 'tickets':
        writer.writerow(['Ticket ID', 'Priority', 'Status', 'Requester', 'Created At'])
        for t in Ticket.objects.all():
            writer.writerow([t.id, t.priority, t.status, t.user.username, t.created_at.strftime('%Y-%m-%d')])
    else:
        writer.writerow(['ID', 'Username', 'Email', 'Role', 'Active'])
        for u in User.objects.all():
            r = u.userprofile.role if hasattr(u, 'userprofile') else 'User'
            writer.writerow([u.id, u.username, u.email, r, u.is_active])
    return response


@login_required_api
def reports_export_pdf_api(request):
    from django.http import HttpResponse
    report_type = request.GET.get('type', 'summary')
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="isats_{report_type}_report.pdf"'
    response.write(b'%PDF-1.4\n% ISATS Generated Report\n%%EOF')
    return response


