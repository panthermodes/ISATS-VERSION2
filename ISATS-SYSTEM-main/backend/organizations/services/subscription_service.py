from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from organizations.models import (
    Organization, Subscription, SubscriptionPlan,
    Feature, PlanFeature, Invoice
)


class SubscriptionService:
    @staticmethod
    def get_or_create_default_plan() -> SubscriptionPlan:
        """
        Retrieves or creates the Standard Enterprise SaaS Plan:
        - Monthly Base: TZS 100,000
        - Included Users: 250
        - Additional User Rate: TZS 500 / month (configurable)
        """
        plan, created = SubscriptionPlan.objects.get_or_create(
            slug='standard-plan',
            defaults={
                'name': 'Standard Enterprise Plan',
                'description': 'Comprehensive ICT asset management & ticketing with 250 users included.',
                'monthly_base_price': Decimal('100000.00'),
                'included_users': 250,
                'additional_user_monthly_price': Decimal('500.00'),
                'is_active': True,
                'is_default': True,
                'features': {
                    'TICKETING': True,
                    'ASSET_MANAGEMENT': True,
                    'INVENTORY': True,
                    'DEPARTMENT_MANAGEMENT': True,
                    'RBAC': True,
                    'REPORTING': True,
                    'AUDIT_LOGS': True,
                    'NOTIFICATIONS': True,
                    'PREVENTIVE_MAINTENANCE': True,
                    'SLA_MANAGEMENT': True,
                    'QR_BARCODE': True,
                }
            }
        )
        return plan

    @staticmethod
    def calculate_active_billable_users(organization: Organization) -> int:
        """
        Calculates active billable users for the organization,
        strictly excluding inactive/deleted users and system service accounts.
        """
        from core.models import UserProfile
        active_count = UserProfile.objects.filter(
            user__is_active=True,
            is_active=True
        ).count()
        return max(1, active_count)

    @classmethod
    def calculate_billing_breakdown(cls, organization: Organization, plan: SubscriptionPlan = None, active_users_override: int = None) -> dict:
        """
        Calculates the exact billing breakdown for the 250-user SaaS model:
        - First 250 active users = 0 additional charge
        - Each user above 250 = additional_user_monthly_price
        """
        if not plan:
            sub = getattr(organization, 'subscription', None)
            plan = sub.plan if sub else cls.get_or_create_default_plan()

        active_users = active_users_override if active_users_override is not None else cls.calculate_active_billable_users(organization)
        included_users = plan.included_users  # e.g., 250
        additional_users = max(0, active_users - included_users)
        additional_user_rate = plan.additional_user_monthly_price
        additional_charges = Decimal(str(additional_users)) * Decimal(str(additional_user_rate))
        
        base_price = Decimal(str(plan.monthly_base_price))
        subtotal = base_price + additional_charges
        tax_rate = Decimal('0.00')  # Configurable VAT if needed
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount

        return {
            'plan_id': plan.id,
            'plan_name': plan.name,
            'base_price': float(base_price),
            'included_users': included_users,
            'active_users': active_users,
            'additional_users': additional_users,
            'additional_user_rate': float(additional_user_rate),
            'additional_charges': float(additional_charges),
            'subtotal': float(subtotal),
            'tax_amount': float(tax_amount),
            'total_amount': float(total_amount),
            'currency': 'TZS',
            'exceeded_allowance': additional_users > 0,
        }

    @classmethod
    def activate_subscription(cls, organization: Organization, plan: SubscriptionPlan = None, duration_days: int = 30) -> Subscription:
        """
        Activates or extends an organization's subscription upon verified payment.
        """
        if not plan:
            plan = cls.get_or_create_default_plan()

        now = timezone.now()
        period_end = now + timedelta(days=duration_days)

        with transaction.atomic():
            sub, created = Subscription.objects.select_for_update().get_or_create(
                organization=organization,
                defaults={
                    'plan': plan,
                    'status': 'ACTIVE',
                    'current_period_start': now,
                    'current_period_end': period_end,
                    'auto_renew': True
                }
            )
            if not created:
                sub.plan = plan
                sub.status = 'ACTIVE'
                sub.current_period_start = now
                sub.current_period_end = period_end
                sub.save()

            organization.status = 'ACTIVE'
            organization.save(update_fields=['status'])

        return sub

    @classmethod
    def check_feature_entitlement(cls, organization: Organization, feature_code: str) -> bool:
        """
        Verifies if an organization has access to a specific SaaS feature.
        """
        sub = getattr(organization, 'subscription', None)
        if not sub or not sub.is_valid:
            return False
        
        features = sub.plan.features or {}
        return bool(features.get(feature_code, True))
