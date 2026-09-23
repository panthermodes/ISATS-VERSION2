import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ict_support_tracking.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from core.models import (
    UserProfile, Department, Category, Asset, Ticket,
    MaintenanceLog, PredictiveAlert, AssetRequest,
    RolePermission, InventoryItem, AuditLog
)
from organizations.models import (
    Organization, SubscriptionPlan, Feature, PlanFeature,
    Subscription, DeviceCategory, DeviceType, OrganizationDeviceType
)

print("Starting ISATS comprehensive database seeding...")

org = Organization.objects.first()
if not org:
    org = Organization.objects.create(
        name='Kigamboni District Hospital',
        legal_name='Kigamboni District Hospital Authority',
        slug='kigamboni-hospital',
        organization_code='KDH-2026',
        industry='Healthcare & Medical Systems',
        country='Tanzania',
        status='active'
    )
print(f"Organization: {org.name}")

# 2. Departments
departments_data = [
    ('ICT & Infrastructure', 'Core network, cloud infrastructure, and end-user hardware support'),
    ('Finance & Accounting', 'Payroll, general ledger, and asset procurement budgeting'),
    ('Human Resources', 'Staff onboarding, access policies, and compliance'),
    ('Operations & Logistics', 'Supply chain, warehouse inventory, and fleet management'),
    ('Clinical & Medical Services', 'Diagnostic equipment, wards, and patient information systems'),
    ('Executive Management', 'Strategic leadership and administrative oversight'),
]
dept_map = {}
for name, desc in departments_data:
    d, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
    dept_map[name] = d
print(f"Seeded {len(dept_map)} Departments")

# 3. Superuser & Platform Admin: Shebby Panther
admin_user, _ = User.objects.get_or_create(username='admin')
admin_user.set_password('ISATS@2026')
admin_user.first_name = 'Shebby'
admin_user.last_name = 'Panther'
admin_user.email = 'shebbyrasheed@gmail.com'
admin_user.is_superuser = True
admin_user.is_staff = True
admin_user.is_active = True
admin_user.save()

admin_profile, _ = UserProfile.objects.get_or_create(user=admin_user)
admin_profile.role = 'PlatformAdmin'
admin_profile.department = dept_map['ICT & Infrastructure']
admin_profile.organization = org
admin_profile.phone_number = '+255688961487'
admin_profile.is_active = True
admin_profile.promoted_at = timezone.now()
admin_profile.save()
print("Configured Superuser/PlatformAdmin: Shebby Panther (admin / ISATS@2026)")

# Also create shebby username alias
shebby_user, _ = User.objects.get_or_create(username='shebby')
shebby_user.set_password('ISATS@2026')
shebby_user.first_name = 'Shebby'
shebby_user.last_name = 'Panther'
shebby_user.email = 'shebbyrasheed@gmail.com'
shebby_user.is_superuser = True
shebby_user.is_staff = True
shebby_user.is_active = True
shebby_user.save()

shebby_profile, _ = UserProfile.objects.get_or_create(user=shebby_user)
shebby_profile.role = 'SuperAdmin'
shebby_profile.department = dept_map['Executive Management']
shebby_profile.organization = org
shebby_profile.phone_number = '+255688961487'
shebby_profile.is_active = True
shebby_profile.promoted_at = timezone.now()
shebby_profile.save()

# 4. Role Accounts for Testing All 9 Dashboards
role_accounts = [
    ('admin_user', 'Admin', 'Khamis', 'Bakari', 'admin.org@isats.co.tz', 'Executive Management'),
    ('manager_user', 'Manager', 'Amina', 'Salum', 'manager@isats.co.tz', 'ICT & Infrastructure'),
    ('hod_user', 'HOD', 'Dr. Grace', 'Massawe', 'hod.finance@isats.co.tz', 'Finance & Accounting'),
    ('supervisor_user', 'Supervisor', 'Juma', 'Kondo', 'supervisor@isats.co.tz', 'ICT & Infrastructure'),
    ('officer_user', 'ICT Officer', 'Baraka', 'Mwamba', 'officer@isats.co.tz', 'ICT & Infrastructure'),
    ('tech_user', 'Technician', 'Kelvin', 'Mushi', 'tech@isats.co.tz', 'ICT & Infrastructure'),
    ('employee_user', 'User', 'Neema', 'Tarimo', 'employee@isats.co.tz', 'Operations & Logistics'),
]

users_map = {'admin': admin_user, 'shebby': shebby_user}
for username, role, fn, ln, em, dept_n in role_accounts:
    u, _ = User.objects.get_or_create(username=username)
    u.set_password('ISATS@2026')
    u.first_name = fn
    u.last_name = ln
    u.email = em
    u.is_active = True
    u.is_staff = (role in ['Admin', 'Manager', 'SuperAdmin', 'PlatformAdmin'])
    u.save()

    p, _ = UserProfile.objects.get_or_create(user=u)
    p.role = role
    p.department = dept_map.get(dept_n)
    p.organization = org
    p.phone_number = '+255688961487'
    p.is_active = True
    p.promoted_at = timezone.now()
    p.save()
    users_map[username] = u
print(f"Seeded {len(role_accounts)} RBAC role users")

# 5. Role Permissions Matrix
RolePermission.objects.all().delete()
matrix = [
    ('Hardware Assets', 'Register New Asset', {'User': False, 'Technician': True, 'ICT Officer': True, 'Supervisor': True, 'HOD': False, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Hardware Assets', 'Scan QR & Barcodes', {'User': True, 'Technician': True, 'ICT Officer': True, 'Supervisor': True, 'HOD': True, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Hardware Assets', 'Relocate / Move Asset', {'User': False, 'Technician': True, 'ICT Officer': True, 'Supervisor': True, 'HOD': False, 'Manager': False, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Ticketing', 'Open Support Incident', {'User': True, 'Technician': True, 'ICT Officer': True, 'Supervisor': True, 'HOD': True, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Ticketing', 'Assign Ticket to Tech', {'User': False, 'Technician': False, 'ICT Officer': True, 'Supervisor': True, 'HOD': False, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Ticketing', 'Close Resolved Ticket', {'User': True, 'Technician': True, 'ICT Officer': True, 'Supervisor': True, 'HOD': False, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Requisitions', 'Approve Hardware Request', {'User': False, 'Technician': False, 'ICT Officer': False, 'Supervisor': False, 'HOD': True, 'Manager': True, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('User Management', 'Promote / Demote Roles', {'User': False, 'Technician': False, 'ICT Officer': False, 'Supervisor': False, 'HOD': False, 'Manager': False, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
    ('Subscription', 'Manage Invoices & Payments', {'User': False, 'Technician': False, 'ICT Officer': False, 'Supervisor': False, 'HOD': False, 'Manager': False, 'Admin': True, 'SuperAdmin': True, 'PlatformAdmin': True}),
]

perm_count = 0
for module, capability, role_dict in matrix:
    for role, allowed in role_dict.items():
        RolePermission.objects.create(
            role=role,
            permission=f"{module}: {capability}",
            allowed=allowed,
            description=f"Permission for {role} to {capability} in {module}"
        )
        perm_count += 1
print(f"Seeded {perm_count} RolePermission rules")

# 6. Subscription Plans and Features
plan_std, _ = SubscriptionPlan.objects.get_or_create(
    slug='standard',
    defaults={
        'name': 'Standard Enterprise Tier',
        'description': 'Full asset lifecycle, 250 included users, predictive AI alerts',
        'monthly_base_price': 100000.00,
        'included_users': 250,
        'additional_user_monthly_price': 1500.00,
        'is_active': True,
        'is_default': True
    }
)

plan_free, _ = SubscriptionPlan.objects.get_or_create(
    slug='starter',
    defaults={
        'name': 'Starter Tier',
        'description': 'Essential tracking for small clinics and departments',
        'monthly_base_price': 0.00,
        'included_users': 25,
        'additional_user_monthly_price': 2000.00,
        'is_active': True,
        'is_default': False
    }
)

features = [
    ('ASSET_SCAN', 'QR & Barcode Scanning', 'Instant hardware lookup and mobile tracking'),
    ('PREDICTIVE_AI', 'Predictive Hardware Failure AI', 'Machine learning telemetry failure forecasting'),
    ('DISPATCH', 'Automated Ticket Dispatching', 'Smart assignment based on technician workload and specialty'),
    ('RBAC', 'Multi-Tier Role Hierarchy', 'Enforce 9-role authorization across all departments'),
    ('AUDIT_LOGS', 'Tamper-Evident Audit Trails', 'Comprehensive logging of all asset transfers and role promotions'),
]

for code, name, desc in features:
    f, _ = Feature.objects.get_or_create(code=code, defaults={'name': name, 'description': desc})
    PlanFeature.objects.get_or_create(plan=plan_std, feature=f, defaults={'is_enabled': True})

# 7. Hardware Assets
categories = list(Category.objects.all())
cat_computing = Category.objects.filter(name__icontains='Comput').first() or categories[0]
cat_network = Category.objects.filter(name__icontains='Network').first() or categories[1]
cat_printer = Category.objects.filter(name__icontains='Print').first() or categories[2]

sample_assets = [
    {
        'tag': 'AST-DELL-5420-01',
        'name': 'Dell Latitude 5420 Laptop',
        'model': 'Latitude 5420 (Intel i7 16GB RAM)',
        'mfr': 'Dell Technologies',
        'type': 'Laptop',
        'cat': cat_computing,
        'dept': dept_map['ICT & Infrastructure'],
        'user': users_map['officer_user'],
        'loc': 'ICT Department - Desk 04',
        'status': 'Active',
        'risk': 12
    },
    {
        'tag': 'AST-HP-800G6-02',
        'name': 'HP EliteDesk 800 G6 Workstation',
        'model': 'EliteDesk 800 G6 SFF',
        'mfr': 'HP Inc.',
        'type': 'Desktop',
        'cat': cat_computing,
        'dept': dept_map['Finance & Accounting'],
        'user': users_map['hod_user'],
        'loc': 'Finance Office - Desk 01',
        'status': 'Active',
        'risk': 18
    },
    {
        'tag': 'AST-CSCO-2960-03',
        'name': 'Cisco Catalyst 2960-X Switch',
        'model': 'WS-C2960X-48FPS-L',
        'mfr': 'Cisco Systems',
        'type': 'Network Switch',
        'cat': cat_network,
        'dept': dept_map['ICT & Infrastructure'],
        'user': None,
        'loc': 'Main Server Room - Rack 02',
        'status': 'Active',
        'risk': 35
    },
    {
        'tag': 'AST-EPSN-WF88-04',
        'name': 'Epson WorkForce Enterprise Printer',
        'model': 'WorkForce Enterprise WF-C20590',
        'mfr': 'Epson',
        'type': 'Printer',
        'cat': cat_printer,
        'dept': dept_map['Operations & Logistics'],
        'user': users_map['employee_user'],
        'loc': 'Logistics Administration Block',
        'status': 'Maintenance',
        'risk': 78
    },
    {
        'tag': 'AST-LNVO-X1C-05',
        'name': 'Lenovo ThinkPad X1 Carbon Gen 10',
        'model': 'ThinkPad X1 Carbon Gen 10',
        'mfr': 'Lenovo',
        'type': 'Laptop',
        'cat': cat_computing,
        'dept': dept_map['Executive Management'],
        'user': users_map['shebby'],
        'loc': 'Executive Suite - Boardroom',
        'status': 'Active',
        'risk': 5
    }
]

created_assets = []
for a_data in sample_assets:
    asset, created = Asset.objects.get_or_create(
        asset_tag=a_data['tag'],
        defaults={
            'serial_number': f"SN-{a_data['tag']}",
            'asset_name': a_data['name'],
            'asset_type': a_data['type'],
            'model': a_data['model'],
            'manufacturer': a_data['mfr'],
            'category': a_data['cat'],
            'department': a_data['dept'],
            'assigned_to': a_data['user'],
            'location': a_data['loc'],
            'organization': org,
            'status': a_data['status'],
            'risk_score': a_data['risk'],
            'purchase_date': timezone.now().date(),
            'warranty_expiry': timezone.now().date() + timezone.timedelta(days=730),
            'qr_code_image': f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='black'/><text x='10' y='50' fill='white'>{a_data['tag']}</text></svg>",
        }
    )
    created_assets.append(asset)
print(f"Seeded {len(created_assets)} Hardware Assets")

# 8. Support Tickets
sample_tickets = [
    (created_assets[3], users_map['employee_user'], users_map['tech_user'], 'High', 'Printhead alignment error and duplex feed jams', 'Open'),
    (created_assets[0], users_map['officer_user'], users_map['tech_user'], 'Medium', 'Flickering external HDMI display on docking station', 'In Progress'),
    (created_assets[2], users_map['manager_user'], users_map['supervisor_user'], 'Urgent', 'Port 14 packet loss affecting Clinical LAN', 'In Progress'),
    (created_assets[1], users_map['hod_user'], users_map['tech_user'], 'Low', 'RAM upgrade from 16GB to 32GB requested for audit month', 'Resolved'),
    (created_assets[4], users_map['shebby'], users_map['officer_user'], 'Low', 'Encrypted VPN configuration for international conference', 'Closed'),
]

for ast, requester, assignee, prio, desc, stat in sample_tickets:
    Ticket.objects.get_or_create(
        asset=ast,
        user=requester,
        description=desc,
        defaults={
            'assigned_to': assignee,
            'priority': prio,
            'status': stat,
            'created_at': timezone.now() - timezone.timedelta(hours=6)
        }
    )
print("Seeded 5 Support Tickets across all statuses")

# 9. Maintenance Logs & Predictive Alerts
MaintenanceLog.objects.all().delete()
MaintenanceLog.objects.create(
    asset=created_assets[3],
    maintenance_type='Corrective',
    performed_by=users_map['tech_user'],
    date=timezone.now().date(),
    notes='Replaced roller assembly and cleaned optical sensors on Epson printer.'
)
MaintenanceLog.objects.create(
    asset=created_assets[0],
    maintenance_type='Preventive',
    performed_by=users_map['tech_user'],
    date=timezone.now().date() - timezone.timedelta(days=14),
    notes='Routine fan cleaning, thermal compound re-application, and diagnostic testing.'
)

PredictiveAlert.objects.all().delete()
PredictiveAlert.objects.create(
    asset=created_assets[3],
    risk_level=78,
    message='Thermal stress exceeds 82°C. High probability of mechanical roller jam within 5 days.',
    resolved=False
)
PredictiveAlert.objects.create(
    asset=created_assets[2],
    risk_level=42,
    message='Fan speed irregularity on power supply module 2. Recommended preventive replacement.',
    resolved=False
)
print("Seeded MaintenanceLogs and PredictiveAlerts")

# 10. Hardware Requisitions (AssetRequest)
AssetRequest.objects.all().delete()
AssetRequest.objects.create(
    user=users_map['employee_user'],
    category=cat_computing,
    status='Pending',
    priority='Medium',
    urgency='normal',
    justification='Replacement field laptop for ongoing inventory audit in logistics wing.',
    intended_use='Accessing ISATS barcode scanning and inventory dispatching.',
    additional_requirements='Minimum 16GB RAM and rugged casing'
)
AssetRequest.objects.create(
    user=users_map['officer_user'],
    category=cat_network,
    status='Approved',
    priority='High',
    urgency='high',
    justification='SFP+ 10G optical transceivers for backbone link aggregation.',
    intended_use='Server room connection to clinical diagnostics laboratory.'
)
print("Seeded AssetRequisitions")

# 11. Audit Logs
AuditLog.objects.create(
    user=admin_user,
    action='SYSTEM_INITIALIZED',
    model_name='System',
    details='ISATS production database initialized with PostgreSQL and RBAC policies.'
)
AuditLog.objects.create(
    user=admin_user,
    action='ROLE_PROMOTED',
    model_name='UserProfile',
    details='Shebby Panther confirmed as PlatformAdmin & System SuperAdmin'
)
print("Seeded AuditLogs")
print("✅ ISATS Comprehensive PostgreSQL Seeding Finished Successfully!")
