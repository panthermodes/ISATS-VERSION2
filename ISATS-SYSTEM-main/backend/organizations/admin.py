from django.contrib import admin
from organizations.models import (
    Organization, OrganizationRegistration, DeviceCategory, DeviceType,
    OrganizationDeviceEstimate, SubscriptionPlan, Feature, PlanFeature,
    Subscription, Invoice, PaymentTransaction, OrganizationUsage
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization_code', 'organization_type', 'status', 'employee_count', 'created_at')
    search_fields = ('name', 'organization_code', 'email', 'phone')
    list_filter = ('status', 'organization_type', 'country')


@admin.register(OrganizationRegistration)
class OrganizationRegistrationAdmin(admin.ModelAdmin):
    list_display = ('registration_reference', 'current_step', 'status', 'contact_email', 'created_at')
    search_fields = ('registration_reference', 'contact_email', 'contact_phone')
    list_filter = ('status', 'current_step')


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_base_price', 'included_users', 'additional_user_monthly_price', 'is_active', 'is_default')
    list_editable = ('monthly_base_price', 'included_users', 'additional_user_monthly_price', 'is_active')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('organization', 'plan', 'status', 'current_period_start', 'current_period_end', 'auto_renew')
    list_filter = ('status', 'plan')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'organization', 'base_price', 'included_users', 'active_users', 'additional_users', 'total_amount', 'status', 'due_date')
    list_filter = ('status',)
    search_fields = ('invoice_number', 'organization__name')


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_reference', 'organization', 'provider', 'amount', 'currency', 'status', 'initiated_at')
    list_filter = ('provider', 'status')
    search_fields = ('transaction_reference', 'provider_transaction_id', 'organization__name')


@admin.register(DeviceCategory)
class DeviceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')


@admin.register(DeviceType)
class DeviceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'code', 'is_active')
    list_filter = ('category',)
    search_fields = ('name', 'code')


@admin.register(OrganizationDeviceEstimate)
class OrganizationDeviceEstimateAdmin(admin.ModelAdmin):
    list_display = ('organization', 'device_type', 'estimated_quantity')
    list_filter = ('organization', 'device_type__category')


@admin.register(OrganizationUsage)
class OrganizationUsageAdmin(admin.ModelAdmin):
    list_display = ('organization', 'active_users_count', 'total_assets_count', 'open_tickets_count', 'last_calculated_at')
