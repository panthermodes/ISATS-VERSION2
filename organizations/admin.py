from django.contrib import admin
from .models import Organization

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "status", "created_at", "updated_at")
    search_fields = ("name", "slug")
    list_filter = ("status",)
    ordering = ("name",)
