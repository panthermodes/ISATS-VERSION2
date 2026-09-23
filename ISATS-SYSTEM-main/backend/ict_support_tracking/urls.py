# ict_support_tracking/urls.py
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import spa_entry_view

# =============================================================
# API ROUTES — registered BEFORE the SPA catch-all
# All /api/* routes must be exhausted here before the catch-all
# =============================================================
api_patterns = [
    # Core REST API (auth, assets, tickets, users, etc.)
    path('', include('core.urls_api')),

    # Organizations API — accessible at both:
    #   /api/organizations/* (frontend standard)
    #   /api/*               (existing backend routes)
    path('organizations/', include('organizations.urls')),
    path('', include('organizations.urls')),
]

from django.http import HttpResponse

urlpatterns = [
    path('favicon.ico', lambda request: HttpResponse(status=204)),
    path('admin/', admin.site.urls),

    # All API routes under /api/
    path('api/', include(api_patterns)),

    # SPA catch-all — serves React for ALL other paths (must be LAST)
    re_path(r'^(?!api/).*$', spa_entry_view, name='spa_entry'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
