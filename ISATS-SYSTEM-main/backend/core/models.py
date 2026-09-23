from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Asset(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Maintenance', 'Maintenance'),
        ('Disposed', 'Disposed'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    asset_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey('organizations.Organization', on_delete=models.SET_NULL, null=True, blank=True, related_name='assets')
    device_type = models.ForeignKey('organizations.OrganizationDeviceType', on_delete=models.SET_NULL, null=True, blank=True, related_name='registered_assets')
    asset_tag = models.CharField(max_length=255, unique=True)
    serial_number = models.CharField(max_length=255, unique=True)
    asset_name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=255)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    model = models.CharField(max_length=255)
    last_maintenance_date = models.DateField(null=True, blank=True)
    manufacturer = models.CharField(max_length=255)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    vendor_name = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    qr_code_image = models.TextField(blank=True)  # Base64 encoded image
    barcode_image = models.TextField(blank=True)  # Base64 encoded image
    risk_score = models.IntegerField(default=0)
    usage_index = models.IntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # --- NEW FIELDS ---
    last_movement_date = models.DateTimeField(null=True, blank=True)
    last_usage_date = models.DateField(null=True, blank=True)
    condition_status = models.CharField(max_length=255, default='Good')
    priority_level = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Low')

    class Meta:
        unique_together = ('asset_tag', 'serial_number')

    def __str__(self):
        return f"{self.asset_tag} - {self.asset_name}"


# =========================================================
# CATEGORY AND DEPARTMENT
# =========================================================
class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

# =========================================================
# ASSET REQUESTS
# =========================================================
class AssetRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Assigned', 'Assigned'),
        ('Rejected', 'Rejected'),
    ]

    URGENCY_CHOICES = [                     # ← NEW
        ('normal', 'Normal (1-2 weeks)'),
        ('high', 'High (3-7 days)'),
        ('urgent', 'Urgent (1-3 days)'),
    ]

    request_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)   # ← unchanged
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    assigned_asset = models.ForeignKey('Asset', on_delete=models.SET_NULL, null=True, blank=True, related_name='fulfilled_requests')
    request_date = models.DateTimeField(default=timezone.now)

    # Existing optional fields (keep as is)
    priority = models.CharField(max_length=50, default='Medium')
    justification = models.TextField(blank=True)
    expected_duration = models.IntegerField(null=True, blank=True)

    # ========== NEW FIELDS (from the multi‑step form) ==========
    selected_asset = models.ForeignKey(
        'Asset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='selected_in_requests'   # avoids clash with assigned_asset
    )
    replacement_for = models.ForeignKey(
        'Asset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replaced_by_requests'
    )
    additional_requirements = models.TextField(blank=True)
    intended_use = models.TextField(blank=True)      # may be required; adjust blank=False if needed
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
    hours_per_day = models.CharField(max_length=10, blank=True, default='4-8')
    days_per_week = models.CharField(max_length=10, blank=True, default='3-5')
    required_by_date = models.DateField(null=True, blank=True)
    supporting_docs = models.FileField(upload_to='asset_requests/', blank=True, null=True)
    specifications = models.JSONField(default=dict, blank=True)   # stores dynamic specs

    def __str__(self):
        return f"Request {self.request_id} by {self.user.username}"
# =========================================================
# ASSET MOVEMENT
# =========================================================
class AssetMovement(models.Model):
    asset = models.ForeignKey('Asset', on_delete=models.CASCADE)
    from_location = models.CharField(max_length=255)
    to_location = models.CharField(max_length=255)
    moved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    movement_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Movement for {self.asset.asset_tag} on {self.movement_date}"

# =========================================================
# ASSET USAGE LOG
# =========================================================
class AssetUsageLog(models.Model):
    asset = models.ForeignKey('Asset', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=255)
    duration_minutes = models.IntegerField()
    activity_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"Usage for {self.asset.asset_tag} by {self.user.username}"

# =========================================================
# NOTIFICATIONS
# =========================================================
class UserNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Notification for {self.user.username}"

class ICTNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"ICT Notification for {self.user.username}"


class InventoryItem(models.Model):
    name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name




class UserAssetHistory(models.Model):
    ACTION_CHOICES = [
        ('Assigned', 'Assigned'),
        ('Returned', 'Returned'),
        ('Maintenance', 'Maintenance'),
        ('Updated', 'Updated'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    acknowledged_policy = models.BooleanField(default=False) 

    def __str__(self):
        return f"{self.user.username} - {self.asset.asset_tag} - {self.action}"
    
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# =========================================================
# USER PROFILE (WITH ROLE MANAGEMENT)
# =========================================================
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('User', 'User'),
        ('Technician', 'Technician'),
        ('ICT Officer', 'ICT Officer'),
        ('Supervisor', 'Supervisor'),
        ('HOD', 'HOD'),
        ('Manager', 'Manager'),
        ('Admin', 'Admin'),
        ('SuperAdmin', 'SuperAdmin'),
        ('PlatformAdmin', 'PlatformAdmin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey('organizations.Organization', on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='User')
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)  # optional, could rely on User.is_active
    last_password_change = models.DateTimeField(null=True, blank=True)
    promoted_at = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)  # optional for contact only
    email_confirmed = models.BooleanField(default=False)       # optional security flag

    class Meta:
        indexes = [models.Index(fields=['role'])]

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# =========================================================
# LOGIN ATTEMPTS FOR AUDIT / SECURITY
# =========================================================
class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=255)
    success = models.BooleanField()
    ip_address = models.CharField(max_length=45, blank=True, default='')
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Attempt for {self.username} at {self.timestamp}"


class PhoneOTP(models.Model):
    phone_number = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.phone_number}"



# =========================================================
# ROLE PERMISSIONS (OPTIONAL EXTENSION)
# =========================================================
class RolePermission(models.Model):
    role = models.CharField(max_length=50)
    permission = models.CharField(max_length=255)
    allowed = models.BooleanField(default=False)
    description = models.TextField(blank=True)  # optional for clarity

    class Meta:
        unique_together = ('role', 'permission')

    def __str__(self):
        return f"{self.role} - {self.permission}: {self.allowed}"

# =========================================================
# AUDIT LOGS (USED FOR ALL PROMOTIONS / DEMOTIONS)
# =========================================================
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)  # e.g., create_user, promote_user
    model_name = models.CharField(max_length=255, blank=True)
    object_id = models.IntegerField(null=True, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    ip_address = models.CharField(max_length=45, blank=True)
    details = models.TextField(blank=True, null=True)  
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"

class PredictiveAlert(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='predictive_alerts')
    risk_level = models.IntegerField(default=0)
    message = models.TextField(blank=True)
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        status = "Resolved" if self.resolved else "Pending"
        return f"Alert for {self.asset.asset_tag} - {status} (Risk: {self.risk_level})"

class MaintenanceLog(models.Model):
    MAINTENANCE_TYPES = [
        ('Preventive', 'Preventive'),
        ('Corrective', 'Corrective'),
        ('Predictive', 'Predictive'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_type = models.CharField(max_length=50, choices=MAINTENANCE_TYPES, default='Corrective')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.maintenance_type} on {self.asset.asset_tag} at {self.date}"

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Awaiting User', 'Awaiting User'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    description = models.TextField()
    image = models.ImageField(upload_to='ticket_images/', blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(default=timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ticket {self.id} ({self.status}) for {self.asset.asset_tag if self.asset else 'N/A'}"


class PredictiveMaintenanceProfile(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE)
    predicted_failure_risk = models.IntegerField(default=0)
    maintenance_priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Low')
    recommended_action = models.TextField(blank=True)
    last_evaluated = models.DateField(default=timezone.now)

    def __str__(self):
        return f"Profile for {self.asset.asset_tag}"

class TemporaryAccessRequest(models.Model):
    ACCESS_CHOICES = [
        ('Software', 'Software'),
        ('Network', 'Network'),
        ('Admin', 'Admin'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_type = models.CharField(max_length=50, choices=ACCESS_CHOICES)
    duration = models.IntegerField()  # days
    reason = models.TextField()
    request_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField()
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], default='Pending')

    def __str__(self):
        return f"{self.access_type} request by {self.user.username}"

class AssetTransferRequest(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transfer_from')
    to_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transfer_to')
    reason = models.TextField()
    clearance_confirmation = models.FileField(upload_to='clearances/', null=True, blank=True)
    request_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], default='Pending')

    def __str__(self):
        return f"Transfer {self.asset.asset_tag} from {self.from_user} to {self.to_user}"



# =========================================================
# SYSTEM SETTINGS
# =========================================================
class SystemSetting(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.TextField()

    def __str__(self):
        return self.key


# =========================================================
# KNOWLEDGE BASE / ARTICLES
# =========================================================
class KnowledgeArticle(models.Model):
    CATEGORY_CHOICES = [
        ('Asset', 'Asset'),
        ('Maintenance', 'Maintenance'),
        ('IT Policy', 'IT Policy'),
        ('General', 'General'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='knowledge_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    relevance_score = models.FloatField(default=0.0)

    def __str__(self):
        return self.title


# =========================================================
# ASSET MOVEMENT / TRANSFER REQUEST
# =========================================================
class AssetMovementRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
    ]

    asset = models.ForeignKey('Asset', on_delete=models.CASCADE, related_name='movement_requests')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asset_requests_sent')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asset_requests_received')
    reason = models.TextField()
    clearance_confirmation = models.FileField(upload_to='asset_clearances/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    request_date = models.DateTimeField(auto_now_add=True)
    approval_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.asset.asset_tag} movement from {self.from_user.username} to {self.to_user.username}'


class ProcurementRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    request_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"Procurement {self.id} - {self.item.name}"
