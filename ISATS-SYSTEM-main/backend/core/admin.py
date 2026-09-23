from django.contrib import admin
from .models import (
    Asset, Department, Category, AssetRequest, AssetMovement, AssetUsageLog,
    UserNotification, ICTNotification, InventoryItem, UserAssetHistory,
    UserProfile, LoginAttempt, RolePermission, AuditLog, PredictiveAlert,
    MaintenanceLog, Ticket, PredictiveMaintenanceProfile, TemporaryAccessRequest,
    AssetTransferRequest, SystemSetting, KnowledgeArticle, AssetMovementRequest,
    ProcurementRequest
)


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('asset_tag', 'asset_name', 'status', 'department', 'category', 'assigned_to', 'created_at')
    search_fields = ('asset_tag', 'serial_number', 'asset_name')
    list_filter = ('status', 'department', 'category')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(AssetRequest)
class AssetRequestAdmin(admin.ModelAdmin):
    list_display = ('request_id', 'user', 'category', 'status', 'request_date')
    search_fields = ('user__username',)
    list_filter = ('status', 'urgency')


@admin.register(AssetMovement)
class AssetMovementAdmin(admin.ModelAdmin):
    list_display = ('asset', 'from_location', 'to_location', 'moved_by', 'movement_date')
    search_fields = ('asset__asset_tag', 'moved_by__username')


@admin.register(AssetUsageLog)
class AssetUsageLogAdmin(admin.ModelAdmin):
    list_display = ('asset', 'user', 'activity_type', 'duration_minutes', 'activity_date')
    search_fields = ('asset__asset_tag', 'user__username')


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    search_fields = ('user__username', 'message')
    list_filter = ('is_read',)


@admin.register(ICTNotification)
class ICTNotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    search_fields = ('user__username', 'message')
    list_filter = ('is_read',)


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'quantity', 'reorder_level')
    search_fields = ('name',)


@admin.register(UserAssetHistory)
class UserAssetHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'asset', 'action', 'timestamp')
    search_fields = ('user__username', 'asset__asset_tag')
    list_filter = ('action',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'department', 'is_active')
    search_fields = ('user__username',)
    list_filter = ('role', 'is_active')


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('username', 'success', 'timestamp')
    search_fields = ('username',)
    list_filter = ('success',)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission', 'allowed')
    search_fields = ('role', 'permission')
    list_filter = ('role', 'allowed')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'model_name', 'timestamp')
    search_fields = ('action', 'user__username')
    list_filter = ('action',)


@admin.register(PredictiveAlert)
class PredictiveAlertAdmin(admin.ModelAdmin):
    list_display = ('asset', 'risk_level', 'resolved', 'created_at')
    search_fields = ('asset__asset_tag',)
    list_filter = ('resolved',)


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('asset', 'maintenance_type', 'performed_by', 'date')
    search_fields = ('asset__asset_tag',)
    list_filter = ('maintenance_type',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'asset', 'user', 'priority', 'status', 'created_at')
    search_fields = ('user__username', 'description')
    list_filter = ('status', 'priority')


@admin.register(PredictiveMaintenanceProfile)
class PredictiveMaintenanceProfileAdmin(admin.ModelAdmin):
    list_display = ('asset', 'predicted_failure_risk', 'maintenance_priority', 'last_evaluated')
    search_fields = ('asset__asset_tag',)
    list_filter = ('maintenance_priority',)


@admin.register(TemporaryAccessRequest)
class TemporaryAccessRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'access_type', 'duration', 'status', 'request_date')
    search_fields = ('user__username',)
    list_filter = ('status', 'access_type')


@admin.register(AssetTransferRequest)
class AssetTransferRequestAdmin(admin.ModelAdmin):
    list_display = ('asset', 'from_user', 'to_user', 'status', 'request_date')
    search_fields = ('asset__asset_tag', 'from_user__username', 'to_user__username')
    list_filter = ('status',)


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
    search_fields = ('key',)


@admin.register(KnowledgeArticle)
class KnowledgeArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'is_published', 'created_at')
    search_fields = ('title', 'content')
    list_filter = ('category', 'is_published')


@admin.register(AssetMovementRequest)
class AssetMovementRequestAdmin(admin.ModelAdmin):
    list_display = ('asset', 'from_user', 'to_user', 'status', 'request_date')
    search_fields = ('asset__asset_tag', 'from_user__username', 'to_user__username')
    list_filter = ('status',)


@admin.register(ProcurementRequest)
class ProcurementRequestAdmin(admin.ModelAdmin):
    list_display = ('item', 'quantity', 'requested_by', 'status', 'request_date')
    search_fields = ('item__name', 'requested_by__username')
    list_filter = ('status',)