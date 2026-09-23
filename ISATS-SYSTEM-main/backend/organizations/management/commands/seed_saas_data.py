from django.core.management.base import BaseCommand
from organizations.services.subscription_service import SubscriptionService
from organizations.services.device_catalogue_service import DeviceCatalogueService
from organizations.models import Organization, SubscriptionPlan, Subscription, DeviceCategory, DeviceType
from django.contrib.auth.models import User
from core.models import UserProfile, Department
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seeds all SaaS baseline data: Device Catalogue, Standard Plan (250 users), PantherMode Admin, and Primary Tenant.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting ISATS SaaS baseline seeding...'))

        # 1. Seed Device Catalogue (35+ hardware types across 8 categories)
        DeviceCatalogueService.seed_default_catalogue()
        cat_count = DeviceCategory.objects.count()
        type_count = DeviceType.objects.count()
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {cat_count} categories with {type_count} hardware device types."))

        # 2. Seed Default Standard Plan (TZS 100,000 / 250 included users)
        plan = SubscriptionService.get_or_create_default_plan()
        self.stdout.write(self.style.SUCCESS(f"[OK] Standard SaaS plan confirmed: {plan.name} (TZS {plan.monthly_base_price:,.0f}/mo - {plan.included_users} users included)."))

        # 3. Create or Confirm Primary Tenant Organization
        org, created = Organization.objects.get_or_create(
            organization_code='ISATS-ORG01',
            defaults={
                'name': 'ISATS Primary Enterprise',
                'legal_name': 'ISATS Enterprise Solutions Limited',
                'slug': 'isats-primary-enterprise',
                'country': 'Tanzania',
                'status': 'ACTIVE',
                'employee_count': 10,
                'email': 'admin@isats-enterprise.co.tz',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"[OK] Created primary tenant organization: {org.name}"))
        else:
            self.stdout.write(self.style.NOTICE(f"[OK] Primary tenant organization exists: {org.name}"))

        # 4. Create or Confirm Subscription for Primary Tenant
        sub, sub_created = Subscription.objects.get_or_create(
            organization=org,
            defaults={
                'plan': plan,
                'status': 'ACTIVE',
                'current_period_start': timezone.now(),
                'current_period_end': timezone.now() + timedelta(days=365),
                'auto_renew': True,
            }
        )
        if sub_created:
            self.stdout.write(self.style.SUCCESS("[OK] Active 365-day subscription provisioned."))

        # 5. Create Default Departments
        depts = ['ICT Support', 'Finance & Accounting', 'Operations & Logistics', 'Human Resources', 'Executive Management']
        for d in depts:
            Department.objects.get_or_create(name=d, defaults={'description': f'{d} Department'})
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(depts)} organizational departments."))

        self.stdout.write(self.style.SUCCESS('\n========================================='))
        self.stdout.write(self.style.SUCCESS('ISATS SaaS Platform Seeding Completed!'))
        self.stdout.write(self.style.SUCCESS('=========================================\n'))
