from django.urls import path
from . import views_api
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views_api.login_api),
    path('auth/register/', views_api.register_api),
    path('auth/logout/', views_api.logout_api),
    path('auth/change-password/', views_api.change_password_api),
    path('auth/forgot-password/', views_api.forgot_password_api),
    path('me/', views_api.me_view),

    # Users & RBAC
    path('users/', views_api.users_api),
    path('users/<int:pk>/', views_api.user_detail_api),
    path('users/<int:pk>/promote/', views_api.user_promote_api),
    path('users/<int:pk>/demote/', views_api.user_demote_api),
    path('roles/permissions/', views_api.role_permissions_api),

    # Hardware Assets
    path('assets/', views_api.assets_api),
    path('assets/scan-lookup/', views_api.asset_scan_lookup_api),
    path('assets/<str:pk>/', views_api.asset_detail_api),

    # Tickets
    path('tickets/', views_api.tickets_api),
    path('tickets/<int:pk>/', views_api.ticket_detail_api),
    path('tickets/<int:pk>/close/', views_api.ticket_close_api),
    path('tickets/<int:pk>/assign/', views_api.ticket_assign_api),
    path('tickets/<int:pk>/comments/', views_api.ticket_comments_api),

    # Categories & Departments
    path('categories/', views_api.categories_api),
    path('categories/<int:pk>/', views_api.category_detail_api),
    path('departments/', views_api.departments_api),
    path('departments/<int:pk>/', views_api.department_detail_api),

    # Inventory, Auditing & Telemetry
    path('inventory/', views_api.inventory_api),
    path('audit/', views_api.audit_logs_api),
    path('dashboard/', views_api.dashboard_stats_api),
    path('dashboard/stats/', views_api.dashboard_stats_api),
    path('notifications/', views_api.notifications_api),
    path('notifications/<int:pk>/', views_api.notification_detail_api),
    path('notifications/mark-all-read/', views_api.notification_mark_all_read_api),

    # Reports
    path('reports/summary/', views_api.reports_summary_api),
    path('reports/asset/', views_api.reports_asset_api),
    path('reports/export/csv/', views_api.reports_export_csv_api),
    path('reports/export/pdf/', views_api.reports_export_pdf_api),

    # Onboarding & Subscriptions
    path('onboarding/', views_api.onboarding_api),
    path('subscription/', views_api.subscription_api),

    # Maintenance & Requisitions
    path('maintenance/predictive/', views_api.predictive_alerts_api),
    path('maintenance/logs/', views_api.maintenance_logs_api),
    path('requests/', views_api.requests_api),
    path('requests/<int:pk>/approve/', views_api.request_approve_api),
    path('requests/<int:pk>/reject/', views_api.request_reject_api),

    # PantherMode Platform Master
    path('platform/stats/', views_api.platform_stats_api),
    path('platform/organizations/', views_api.platform_organizations_api),

    # Validation legacy
    path('check-alerts/', views.check_alerts_api),
    path('validate-promotion/<int:user_id>/', views.validate_promotion_request),
    path('user-role-info/<int:user_id>/', views.get_user_role_info),
]

