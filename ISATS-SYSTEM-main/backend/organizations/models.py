from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


# ==============================================================================
# 1. MULTI-TENANCY / ORGANIZATION MODEL
# ==============================================================================

class Organization(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('TRIAL', 'Trial'),
        ('SUSPENDED', 'Suspended'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
    ]

    ORGANIZATION_TYPE_CHOICES = [
        ('PRIVATE_COMPANY', 'Private Company'),
        ('GOVERNMENT', 'Government Entity'),
        ('NGO', 'Non-Governmental Organization (NGO)'),
        ('UNIVERSITY', 'University / Higher Education'),
        ('SCHOOL', 'School / K-12'),
        ('HOSPITAL', 'Hospital / Healthcare Provider'),
        ('BANK', 'Bank / Financial Institution'),
        ('MANUFACTURING', 'Manufacturing Plant'),
        ('RETAIL', 'Retail Business'),
        ('TECH', 'Technology Company'),
        ('SME', 'Small & Medium Enterprise'),
        ('OTHER', 'Other Organization'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    legal_name = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    organization_code = models.CharField(max_length=50, unique=True, db_index=True)
    organization_type = models.CharField(max_length=50, choices=ORGANIZATION_TYPE_CHOICES, default='PRIVATE_COMPANY')
    industry = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    tax_identification_number = models.CharField(max_length=100, blank=True)
    
    # Location & Contact
    country = models.CharField(max_length=100, default='Tanzania')
    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    postal_address = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    website = models.URLField(max_length=255, blank=True)
    logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)
    description = models.TextField(blank=True)

    # Size & Capacity
    employee_count = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TRIAL', db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['organization_code']),
        ]

    def __str__(self):
        return f"{self.name} ({self.organization_code})"

    @property
    def is_active(self):
        return self.status in ['ACTIVE', 'TRIAL']


# ==============================================================================
# 2. PERSISTENT PROGRESSIVE ONBOARDING / REGISTRATION DRAFT
# ==============================================================================

class OrganizationRegistration(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('IN_PROGRESS', 'In Progress'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration_reference = models.CharField(max_length=64, unique=True, db_index=True)
    current_step = models.IntegerField(default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='DRAFT', db_index=True)
    
    # JSON payload stores all progressive step data (Steps 1 to 8)
    step_data = models.JSONField(default=dict, blank=True)
    
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='registrations')
    contact_email = models.EmailField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    otp_code = models.CharField(max_length=10, blank=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Organization Registration'
        verbose_name_plural = 'Organization Registrations'

    def __str__(self):
        return f"Registration {self.registration_reference} (Step {self.current_step} - {self.status})"


# ==============================================================================
# 3. ICT DEVICE CATALOGUE (PLATFORM GLOBAL & TENANT ESTIMATES)
# ==============================================================================

class DeviceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='laptop')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = 'Device Category'
        verbose_name_plural = 'Device Categories'

    def __str__(self):
        return self.name


class DeviceType(models.Model):
    category = models.ForeignKey(DeviceCategory, on_delete=models.CASCADE, related_name='device_types')
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'category__name', 'name']
        unique_together = ('category', 'name')
        verbose_name = 'Device Type'
        verbose_name_plural = 'Device Types'

    def __str__(self):
        return f"{self.category.name} -> {self.name}"


class OrganizationDeviceType(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='organization_device_types')
    platform_device_type = models.ForeignKey(DeviceType, on_delete=models.SET_NULL, null=True, blank=True, related_name='org_instances')
    custom_name = models.CharField(max_length=150, blank=True)
    custom_category = models.ForeignKey(DeviceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='custom_device_types')
    custom_description = models.TextField(blank=True)
    manufacturer = models.CharField(max_length=150, blank=True)
    model_family = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)
    is_custom = models.BooleanField(default=False, db_index=True)
    is_enabled = models.BooleanField(default=True, db_index=True)
    default_quantity = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_device_types')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_custom', 'platform_device_type__category__name', 'custom_name', 'platform_device_type__name']
        verbose_name = 'Organization Device Type'
        verbose_name_plural = 'Organization Device Types'

    @property
    def name(self):
        if self.is_custom or not self.platform_device_type:
            return self.custom_name or "Custom Device"
        return self.platform_device_type.name

    @property
    def category_name(self):
        if self.is_custom:
            return self.custom_category.name if self.custom_category else "Other ICT Equipment"
        return self.platform_device_type.category.name if self.platform_device_type and self.platform_device_type.category else "Uncategorized"

    @property
    def category_slug(self):
        if self.is_custom:
            return self.custom_category.slug if self.custom_category else "other"
        return self.platform_device_type.category.slug if self.platform_device_type and self.platform_device_type.category else "other"

    @property
    def icon(self):
        if self.is_custom:
            return self.custom_category.icon if self.custom_category else "cpu"
        return self.platform_device_type.category.icon if self.platform_device_type and self.platform_device_type.category else "laptop"

    @property
    def description(self):
        if self.is_custom or not self.platform_device_type:
            return self.custom_description
        return self.platform_device_type.description

    @property
    def code(self):
        if self.is_custom or not self.platform_device_type:
            return f"CUSTOM_{self.id}"
        return self.platform_device_type.code

    @property
    def registered_assets_count(self):
        return self.registered_assets.filter(is_deleted=False).count()

    def __str__(self):
        tag = "[CUSTOM]" if self.is_custom else "[STANDARD]"
        return f"{self.organization.name} - {tag} {self.name} (Declared: {self.default_quantity})"


class OrganizationDeviceEstimate(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='device_estimates')
    device_type = models.ForeignKey(DeviceType, on_delete=models.CASCADE, related_name='estimates')
    estimated_quantity = models.IntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('organization', 'device_type')
        verbose_name = 'Organization Device Estimate'
        verbose_name_plural = 'Organization Device Estimates'

    def __str__(self):
        return f"{self.organization.name} - {self.device_type.name}: {self.estimated_quantity}"


# ==============================================================================
# 4. SUBSCRIPTION PLANS & FEATURES
# ==============================================================================

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # 250 included users & TZS 100,000 baseline price
    monthly_base_price = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    included_users = models.IntegerField(default=250)
    additional_user_monthly_price = models.DecimalField(max_digits=12, decimal_places=2, default=500.00)
    
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    features = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['monthly_base_price']
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'

    def __str__(self):
        return f"{self.name} (TZS {self.monthly_base_price:,.0f}/mo - {self.included_users} users)"


class Feature(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class PlanFeature(models.Model):
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='plan_features')
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='plan_features')
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ('plan', 'feature')

    def __str__(self):
        return f"{self.plan.name} - {self.feature.name}: {'Enabled' if self.is_enabled else 'Disabled'}"


# ==============================================================================
# 5. SUBSCRIPTION LIFECYCLE
# ==============================================================================

class Subscription(models.Model):
    STATUS_CHOICES = [
        ('TRIALING', 'Trialing'),
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('ACTIVE', 'Active'),
        ('PAYMENT_FAILED', 'Payment Failed'),
        ('PAST_DUE', 'Past Due'),
        ('GRACE_PERIOD', 'Grace Period'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
        ('SUSPENDED', 'Suspended'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_PAYMENT', db_index=True)
    
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    cancellation_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'current_period_end']),
        ]
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'

    def __str__(self):
        return f"{self.organization.name} - {self.plan.name} ({self.status})"

    @property
    def is_valid(self):
        return self.status in ['ACTIVE', 'TRIALING', 'GRACE_PERIOD'] and self.current_period_end >= timezone.now()


# ==============================================================================
# 6. INVOICES & RECURRING BILLING
# ==============================================================================

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('VOID', 'Void'),
        ('OVERDUE', 'Overdue'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=64, unique=True, db_index=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='invoices')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    
    # 250 included users math breakdown
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    included_users = models.IntegerField(default=250)
    active_users = models.IntegerField(default=1)
    additional_users = models.IntegerField(default=0)
    additional_user_rate = models.DecimalField(max_digits=12, decimal_places=2, default=500.00)
    additional_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)
    currency = models.CharField(max_length=10, default='TZS')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    due_date = models.DateField()
    paid_at = models.DateTimeField(null=True, blank=True)
    invoice_pdf = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['invoice_number']),
        ]
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"Invoice {self.invoice_number} ({self.organization.name}) - {self.currency} {self.total_amount:,.2f}"


# ==============================================================================
# 7. PAYMENT TRANSACTIONS & WEBHOOK LOGS
# ==============================================================================

class PaymentTransaction(models.Model):
    PROVIDER_CHOICES = [
        ('MPESA', 'M-Pesa (Vodacom)'),
        ('TIGO_PESA', 'Tigo Pesa (Mixx by Yas)'),
        ('AIRTEL_MONEY', 'Airtel Money'),
        ('HALOPESA', 'HaloPesa'),
        ('BANK_TRANSFER', 'Bank Wire Transfer / CRDB / NMB'),
        ('CARD', 'Debit / Credit Card (Visa / Mastercard)'),
        ('MANUAL', 'PantherMode Manual Verification'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    transaction_reference = models.CharField(max_length=100, unique=True, db_index=True)
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, default='MPESA')
    provider_transaction_id = models.CharField(max_length=150, blank=True, db_index=True)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='TZS')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    payment_method = models.CharField(max_length=50, blank=True)
    
    initiated_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    raw_metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['transaction_reference']),
            models.Index(fields=['status']),
        ]
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'

    def __str__(self):
        return f"{self.provider} - {self.transaction_reference} ({self.currency} {self.amount:,.2f}) [{self.status}]"


# ==============================================================================
# 8. REAL-TIME USAGE TRACKING
# ==============================================================================

class OrganizationUsage(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='usage')
    active_users_count = models.IntegerField(default=0)
    total_assets_count = models.IntegerField(default=0)
    open_tickets_count = models.IntegerField(default=0)
    storage_bytes_used = models.BigIntegerField(default=0)
    api_requests_count = models.BigIntegerField(default=0)
    notifications_count = models.IntegerField(default=0)
    last_calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Organization Usage'
        verbose_name_plural = 'Organization Usages'

    def __str__(self):
        return f"Usage for {self.organization.name}: {self.active_users_count} users, {self.total_assets_count} assets"
