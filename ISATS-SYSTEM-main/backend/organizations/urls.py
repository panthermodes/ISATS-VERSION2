from django.urls import path
from organizations import views_api

urlpatterns = [
    # Progressive Onboarding
    path('onboarding/step/', views_api.onboarding_save_step_api, name='org_onboarding_save_step'),
    path('onboarding/resume/', views_api.onboarding_resume_api, name='org_onboarding_resume'),
    path('onboarding/finalize/', views_api.onboarding_finalize_api, name='org_onboarding_finalize'),
    path('onboarding/ict-environment/', views_api.onboarding_ict_environment_api, name='org_onboarding_ict_env'),
    path('onboarding/status/', views_api.onboarding_status_api, name='org_onboarding_status'),

    # ICT Device Catalogue (Platform-level)
    path('device-catalogue/', views_api.device_catalogue_list_api, name='device_catalogue_list'),
    path('device-catalog/', views_api.device_catalogue_list_api, name='device_catalog_list'),
    path('device-catalog/categories/', views_api.device_categories_list_api, name='device_categories_list'),
    path('device-catalog/types/', views_api.device_types_list_api, name='device_types_list'),

    # Tenant Organization Device Types
    path('organization/device-types/', views_api.organization_device_types_api, name='organization_device_types'),
    path('organization/device-types/custom/', views_api.organization_custom_device_create_api, name='organization_custom_device_create'),
    path('organization/device-types/<int:pk>/', views_api.organization_device_type_detail_api, name='organization_device_type_detail'),
    path('organization/device-types/<int:pk>/toggle/', views_api.organization_device_type_toggle_api, name='organization_device_type_toggle'),
    path('organization/device-types/<int:pk>/disable/', views_api.organization_device_type_toggle_api, name='organization_device_type_disable'),
    path('organization/device-catalog/summary/', views_api.organization_device_summary_api, name='organization_device_summary'),

    # Subscription & Invoices
    path('subscription/', views_api.subscription_overview_api, name='org_subscription_overview'),
    path('subscription/invoices/', views_api.subscription_invoices_api, name='org_subscription_invoices'),
    path('subscription/status/', views_api.subscription_overview_api, name='org_subscription_status'),

    # Payments & Webhooks
    path('payments/initiate/', views_api.payment_initiate_api, name='payment_initiate'),
    path('payments/webhook/<str:provider>/', views_api.payment_webhook_api, name='payment_webhook'),

    # PantherMode Platform Admin
    path('platform/stats/', views_api.platform_stats_api, name='org_platform_stats'),
    path('platform/organizations/', views_api.platform_organizations_api, name='org_platform_organizations'),
    path('platform/organizations/<uuid:org_id>/suspend/', views_api.platform_organization_suspend_api, name='platform_org_suspend'),
    path('platform/organizations/<uuid:org_id>/reactivate/', views_api.platform_organization_reactivate_api, name='platform_org_reactivate'),
    path('platform/plans/', views_api.platform_plans_api, name='platform_plans'),
    path('platform/payments/', views_api.platform_payments_api, name='platform_payments'),
    path('platform/payments/<uuid:payment_id>/confirm/', views_api.platform_payment_confirm_api, name='platform_payment_confirm'),
]
