from django.urls import path, re_path
from . import views
from . import views_api

app_name = 'core'

urlpatterns = [
    # =====================================================
    # BACKEND JSON REST API ENDPOINTS
    # =====================================================
    path('api/auth/login/', views_api.login_api, name='api_login'),
    path('api/auth/logout/', views_api.logout_api, name='api_logout'),
    path('api/auth/change-password/', views_api.change_password_api, name='api_change_password'),
    path('api/me/', views_api.me_view, name='api_me'),
    
    path('api/assets/', views_api.assets_api, name='api_assets'),
    path('api/assets/scan-lookup/', views_api.asset_scan_lookup_api, name='api_asset_scan_lookup'),
    path('api/assets/<str:pk>/', views_api.asset_detail_api, name='api_asset_detail'),
    
    path('api/tickets/', views_api.tickets_api, name='api_tickets'),
    path('api/tickets/<int:pk>/', views_api.ticket_detail_api, name='api_ticket_detail'),
    path('api/tickets/<int:pk>/close/', views_api.ticket_close_api, name='api_ticket_close'),
    path('api/tickets/<int:pk>/assign/', views_api.ticket_assign_api, name='api_ticket_assign'),
    
    path('api/departments/', views_api.departments_api, name='api_departments'),
    
    path('api/inventory/', views_api.inventory_api, name='api_inventory'),
    
    path('api/audit/', views_api.audit_logs_api, name='api_audit_logs'),
    path('api/dashboard/', views_api.dashboard_stats_api, name='api_dashboard_stats'),
    
    path('api/notifications/', views_api.notifications_api, name='api_notifications'),
    path('api/notifications/<int:pk>/', views_api.notification_detail_api, name='api_notification_detail'),
    path('api/notifications/mark-all-read/', views_api.notification_mark_all_read_api, name='api_notifications_mark_all_read'),

    # New Module APIs
    path('api/onboarding/', views_api.onboarding_api, name='api_onboarding'),
    path('api/subscription/', views_api.subscription_api, name='api_subscription'),
    path('api/platform/stats/', views_api.platform_stats_api, name='api_platform_stats'),
    path('api/platform/organizations/', views_api.platform_organizations_api, name='api_platform_organizations'),
    path('api/maintenance/predictive/', views_api.predictive_alerts_api, name='api_predictive_alerts'),
    path('api/maintenance/logs/', views_api.maintenance_logs_api, name='api_maintenance_logs'),
    path('api/requests/', views_api.requests_api, name='api_requests'),
    path('api/auth/forgot-password/', views_api.forgot_password_api, name='api_forgot_password'),

    # Existing custom AJAX APIs to preserve
    path('api/check-alerts/', views.check_alerts_api, name='check_alerts_api'),
    path('api/validate-promotion/<int:user_id>/', views.validate_promotion_request, name='validate_promotion'),
    path('api/user-role-info/<int:user_id>/', views.get_user_role_info, name='user_role_info'),
    path('api/get-user-roles/<int:user_id>/', views.get_user_role_info, name='get_user_role_info'),

    # =====================================================
    # REACT SPA ROUTING (CATCH-ALL)
    # =====================================================
    # Route all non-API paths to the React SPA index view
    re_path(r'^.*$', views.spa_entry_view, name='spa_entry'),
]

    
    
    
  








