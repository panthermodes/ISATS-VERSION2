import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ict_support_tracking.settings')
django.setup()

from django.contrib.auth.models import User
from organizations.models import Organization, SubscriptionPlan, Subscription
from organizations.services.subscription_service import SubscriptionService
from organizations.services.device_catalogue_service import DeviceCatalogueService
from core.models import UserProfile, Department, Category

print("1. Seeding Device Catalogue...")
DeviceCatalogueService.seed_default_catalogue()
print("Device Catalogue seeded successfully.")

print("2. Seeding Standard Subscription Plan...")
plan = SubscriptionService.get_or_create_default_plan()
print(f"Plan seeded: {plan.name} (TZS {plan.monthly_base_price:,.0f}/mo, {plan.included_users} users included)")

print("3. Ensuring PantherMode Platform Admin exists...")
admin_user, created = User.objects.get_or_create(
    username='PantherMode',
    defaults={
        'email': 'admin@panthermode.isats.com',
        'is_staff': True,
        'is_superuser': True,
        'first_name': 'PantherMode',
        'last_name': 'Platform Owner'
    }
)
if created or not admin_user.check_password('PantherMode@2026!'):
    admin_user.set_password('PantherMode@2026!')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()

profile, _ = UserProfile.objects.get_or_create(
    user=admin_user,
    defaults={'role': 'SuperAdmin', 'is_active': True}
)
profile.role = 'SuperAdmin'
profile.save()
print("PantherMode Platform Admin verified.")

print("4. Ensuring Default Organization exists...")
default_org, org_created = Organization.objects.get_or_create(
    slug='isats-default-corp',
    defaults={
        'name': 'ISATS Primary Enterprise',
        'legal_name': 'ISATS Primary Enterprise Ltd',
        'organization_code': 'ORG-ISATS-HQ',
        'organization_type': 'PRIVATE_COMPANY',
        'industry': 'Information Technology',
        'country': 'Tanzania',
        'status': 'ACTIVE',
        'employee_count': 120
    }
)
SubscriptionService.activate_subscription(default_org, plan)
print(f"Default organization verified: {default_org.name}")

print("5. Seeding default departments...")
departments = ['ICT Support', 'Systems & Infrastructure', 'Software Engineering', 'Operations', 'Finance & Procurement', 'Human Resources']
for dept_name in departments:
    Department.objects.get_or_create(name=dept_name)
print("Default departments verified.")

print("Platform seed complete!")
