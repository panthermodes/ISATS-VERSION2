import uuid
from django.utils import timezone
from django.utils.text import slugify
from django.db import transaction
from django.contrib.auth.models import User
from organizations.models import (
    Organization, OrganizationRegistration, SubscriptionPlan
)
from organizations.services.subscription_service import SubscriptionService
from organizations.services.billing_service import BillingService
from organizations.services.device_catalogue_service import DeviceCatalogueService


class OrganizationService:
    @staticmethod
    def generate_registration_reference() -> str:
        return f"REG-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

    @classmethod
    def save_registration_step(
        cls,
        step: int,
        step_payload: dict,
        registration_ref: str = None
    ) -> dict:
        """
        CRITICAL REQUIREMENT: Persists every step progressively into the database immediately.
        Recovers if reference exists, or creates a new registration draft.
        """
        reg = None
        if registration_ref:
            reg = OrganizationRegistration.objects.filter(
                registration_reference=registration_ref
            ).first()

        if not reg:
            ref = cls.generate_registration_reference()
            reg = OrganizationRegistration.objects.create(
                registration_reference=ref,
                current_step=step,
                status='IN_PROGRESS',
                step_data={}
            )

        # Merge step payload into persistent JSON structure
        data = reg.step_data or {}
        step_key = f"step_{step}"
        data[step_key] = step_payload
        reg.step_data = data
        reg.current_step = max(reg.current_step, step)

        # Update contact information from step 1 or step 5 if provided
        if 'email' in step_payload:
            reg.contact_email = step_payload['email']
        if 'phone' in step_payload:
            reg.contact_phone = step_payload['phone']
        if 'admin_email' in step_payload:
            reg.contact_email = step_payload['admin_email']

        reg.save()

        return {
            'registration_reference': reg.registration_reference,
            'current_step': reg.current_step,
            'status': reg.status,
            'saved_data': reg.step_data
        }

    @classmethod
    def get_registration_draft(cls, registration_ref: str) -> dict:
        """
        Recovers previously entered registration information.
        """
        reg = OrganizationRegistration.objects.filter(
            registration_reference=registration_ref
        ).first()

        if not reg:
            return {'found': False, 'error': 'Registration draft not found'}

        return {
            'found': True,
            'registration_reference': reg.registration_reference,
            'current_step': reg.current_step,
            'status': reg.status,
            'contact_email': reg.contact_email,
            'contact_phone': reg.contact_phone,
            'is_verified': reg.is_verified,
            'step_data': reg.step_data,
        }

    @classmethod
    def complete_registration_and_provision(cls, registration_ref: str) -> dict:
        """
        Finalizes registration:
        1. Creates Organization tenant record
        2. Provisions Admin user account
        3. Seeds default Departments
        4. Saves ICT Device Estimates
        5. Generates Subscription and Initial Invoice
        """
        reg = OrganizationRegistration.objects.filter(
            registration_reference=registration_ref
        ).first()

        if not reg:
            raise ValueError("Registration record not found")

        data = reg.step_data or {}
        step1 = data.get('step_1', {})
        step2 = data.get('step_2', {})
        step3 = data.get('step_3', {})
        step4 = data.get('step_4', {})
        step5 = data.get('step_5', {})

        org_name = step1.get('organization_name') or 'Default Organization'
        base_slug = slugify(org_name)
        unique_slug = base_slug
        count = 1
        while Organization.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{base_slug}-{count}"
            count += 1

        org_code = f"ORG-{uuid.uuid4().hex[:6].upper()}"

        with transaction.atomic():
            organization = Organization.objects.create(
                name=org_name,
                legal_name=step1.get('legal_name', ''),
                slug=unique_slug,
                organization_code=org_code,
                organization_type=step1.get('organization_type', 'PRIVATE_COMPANY'),
                industry=step1.get('industry', ''),
                registration_number=step1.get('registration_number', ''),
                tax_identification_number=step1.get('tin', ''),
                country=step1.get('country', 'Tanzania'),
                region=step1.get('region', ''),
                district=step1.get('district', ''),
                address=step1.get('address', ''),
                postal_address=step1.get('postal_address', ''),
                phone=step1.get('phone', ''),
                email=step1.get('email', ''),
                website=step1.get('website', ''),
                employee_count=int(step2.get('employee_count', 1)),
                status='TRIAL'
            )

            # Provision administrator account
            admin_username = step5.get('admin_username') or step5.get('admin_email', '').split('@')[0] or f"admin_{unique_slug}"
            admin_email = step5.get('admin_email') or reg.contact_email
            admin_password = step5.get('admin_password') or 'ISATS@2026Admin'
            
            user = User.objects.filter(username=admin_username).first()
            if not user:
                user = User.objects.create_user(
                    username=admin_username,
                    email=admin_email,
                    password=admin_password,
                    first_name=step5.get('first_name', 'Admin'),
                    last_name=step5.get('last_name', '')
                )

            # Set SuperAdmin / Admin role in core UserProfile and associate organization
            from core.models import UserProfile, Department
            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': 'SuperAdmin',
                    'organization': organization,
                    'is_active': True,
                    'phone_number': step5.get('admin_phone', '')
                }
            )
            profile.role = 'SuperAdmin'
            profile.organization = organization
            profile.save()

            # Seed default departments
            default_departments = ['ICT Support', 'Administration', 'Finance & Accounting', 'Human Resources', 'Operations']
            for dept_name in default_departments:
                Department.objects.get_or_create(name=dept_name)

            # Save device estimates and selections from Step 5 or Step 3
            devices_data = (
                data.get('step_5', {}).get('devices')
                or data.get('step_3', {}).get('devices')
                or data.get('devices', {})
            )
            if devices_data:
                DeviceCatalogueService.save_organization_estimates(organization, devices_data, user=user)

            # Save any custom devices created during onboarding
            custom_devices = (
                data.get('step_5', {}).get('custom_devices')
                or data.get('step_3', {}).get('custom_devices')
                or data.get('custom_devices', [])
            )
            for cdev in custom_devices:
                try:
                    DeviceCatalogueService.create_custom_device_type(organization, cdev, user=user)
                except Exception:
                    pass

            # Create default subscription & initial invoice
            plan = SubscriptionService.get_or_create_default_plan()
            subscription = SubscriptionService.activate_subscription(organization, plan)
            invoice = BillingService.create_subscription_invoice(organization, subscription)

            # Mark registration completed
            reg.status = 'COMPLETED'
            reg.organization = organization
            reg.completed_at = timezone.now()
            reg.save()

        return {
            'organization_id': str(organization.id),
            'organization_name': organization.name,
            'organization_slug': organization.slug,
            'organization_code': organization.organization_code,
            'admin_username': user.username,
            'subscription_id': str(subscription.id),
            'invoice_number': invoice.invoice_number,
            'status': 'COMPLETED'
        }
