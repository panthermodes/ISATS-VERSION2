#core/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse, HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from django.urls import reverse_lazy
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Max, Min, Q, F, ExpressionWrapper, DurationField
from django.contrib import messages, auth
from django.db.models import Count, Avg, Sum, Q, F, ExpressionWrapper, DurationField
from functools import wraps
from django.core.cache import cache
from django_filters.views import FilterView
import django_filters

from .models import UserProfile, RolePermission, LoginAttempt
from django.db.models.functions import Now
from django.core.management import call_command
import qrcode
import base64
from io import BytesIO
from barcode import Code128
from barcode.writer import ImageWriter
from django.contrib.auth.models import User
from django.forms.models import modelform_factory

# =========================================================
# MODELS & UTILS
# =========================================================
from .models import (
    UserProfile,
    RolePermission,
    LoginAttempt,
    Asset,
    AssetRequest,
    AssetUsageLog,
    Ticket,
    AuditLog,
    SystemSetting,
    PredictiveMaintenanceProfile,
    AssetMovement,
    MaintenanceLog,
    InventoryItem,
    ProcurementRequest,
    UserNotification,
    UserAssetHistory,
    KnowledgeArticle,
    TemporaryAccessRequest,
    AssetTransferRequest,
    ICTNotification,
    AssetMovementRequest,
    PredictiveAlert,
)
from .utils import log_login_attempt


# =========================================================
# RBAC & PERMISSION HELPERS
# =========================================================
from functools import wraps
from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from .models import UserProfile, RolePermission
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
def has_permission(user, permission):
    """
    Check if user has permission, with special handling for:
    1. Django superusers (is_superuser=True) have all permissions
    2. SuperAdmin role from UserProfile
    3. Regular role-based permissions
    """
    # Django superusers have all permissions
    if user.is_superuser:
        return True
    
    # Check UserProfile role permissions
    try:
        role = user.userprofile.role
        return RolePermission.objects.filter(
            role=role,
            permission=permission,
            allowed=True
        ).exists()
    except UserProfile.DoesNotExist:
        return False

def get_user_role(user):
    """
    Get user's role, prioritizing Django superuser status
    """
    if user.is_superuser:
        return 'SuperAdmin'
    try:
        return user.userprofile.role
    except UserProfile.DoesNotExist:
        return None

def role_required(allowed_roles):
    """
    Decorator to check if user has required role.
    Django superusers are treated as SuperAdmin.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('core:login')
            
            user_role = get_user_role(request.user)
            
            if not user_role:
                raise PermissionDenied("User profile missing")
            
            # SuperAdmin (either Django superuser or SuperAdmin role) can access any SuperAdmin view
            if 'SuperAdmin' in allowed_roles and user_role == 'SuperAdmin':
                return view_func(request, *args, **kwargs)
            
            if user_role not in allowed_roles:
                raise PermissionDenied(f"Access denied. Required roles: {allowed_roles}")
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

# =========================================================
# BASE MIXINS (PHASE ONE FOUNDATION)
# =========================================================
class RoleRequiredMixin(LoginRequiredMixin):
    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):
        try:
            role = request.user.userprofile.role
        except UserProfile.DoesNotExist:
            raise PermissionDenied
        if role not in self.allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)


class PermissionRequiredMixin(LoginRequiredMixin):
    permission_required = None

    def dispatch(self, request, *args, **kwargs):
        if not has_permission(request.user, self.permission_required):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .utils import log_audit 
from django.db import IntegrityError

def register_view(request):
    """
    Handles user registration, creates User and UserProfile
    Stores username, first_name, last_name, email, and password
    """
    if request.method == 'POST':
        username = request.POST.get('username').strip()
        first_name = request.POST.get('first_name').strip()
        last_name = request.POST.get('last_name').strip()
        email = request.POST.get('email').strip()
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        # Basic validation
        if not all([username, first_name, last_name, email, password1, password2]):
            messages.error(request, "All fields are required.")
            return redirect('core:register')

        if password1 != password2:
            messages.error(request, "Passwords do not match.")
            return redirect('core:register')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return redirect('core:register')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered.")
            return redirect('core:register')

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password1
            )
            # Create UserProfile with default role
            UserProfile.objects.create(user=user, role='User')

            log_audit(user, 'user_registered', 'User')
            messages.success(request, "Registration successful. Please log in.")
            return redirect('core:login')
        except IntegrityError:
            messages.error(request, "An error occurred. Please try again.")
            return redirect('core:register')

    return render(request, 'auth/register.html')

def login_view(request):
    """
    Handles user login with audit logging (without IP)
    """
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            log_audit(user, 'login_success', 'User')
            return redirect('core:dashboard')
        messages.error(request, 'Invalid username or password')
        return redirect('core:login')
    return render(request, 'auth/login.html')


@login_required
def logout_view(request):
    """
    Logs out user and records audit
    """
    log_audit(request.user, 'logout', 'User')
    logout(request)
    return redirect('core:login')


# =========================================================
# ENHANCED DASHBOARD ROUTER
# =========================================================
@login_required
def dashboard(request):
    """
    Redirects user to dashboard based on role.
    Handles both Django superusers and custom roles.
    """
    user_role = get_user_role(request.user)
    
    if not user_role:
        # Create UserProfile for Django superuser if it doesn't exist
        if request.user.is_superuser:
            UserProfile.objects.get_or_create(
                user=request.user,
                defaults={'role': 'SuperAdmin'}
            )
            user_role = 'SuperAdmin'
        else:
            return redirect('core:login')
    
    role_map = {
        'User': 'core:user_dashboard_view',
        'ICT Officer': 'core:officer_dashboard_view',
        'Manager': 'core:manager_dashboard_view',
        'Admin': 'core:admin_dashboard_view',
        'SuperAdmin': 'core:superadmin_dashboard_view',
    }
    
    return redirect(role_map.get(user_role, 'core:login'))
# =========================================================
# ROLE PERMISSIONS & SECURITY
# =========================================================
class RolePermissionListView(LoginRequiredMixin, ListView):
    model = RolePermission
    template_name = 'auth/role_permission_list.html'
    def dispatch(self, request, *args, **kwargs):
        if request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

class RolePermissionUpdateView(LoginRequiredMixin, UpdateView):
    model = RolePermission
    fields = ['allowed']
    template_name = 'auth/role_permission_form.html'
    success_url = reverse_lazy('core:rolepermission_list')
    def dispatch(self, request, *args, **kwargs):
        if request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
    def form_valid(self, form):
        old = str(self.get_object().allowed)
        perm = form.save()
        log_audit(self.request.user, 'update_permission', 'RolePermission', perm.id, old, str(perm.allowed))
        messages.success(self.request, 'Permission updated.')
        return super().form_valid(form)

# =========================================================
# DASHBOARD VIEWS (ENHANCED WITH CACHING AND ROLE-SPECIFIC WIDGETS)
# =========================================================
@login_required
@role_required(['User'])
def user_dashboard_view(request):
    cache_key = f'user_dashboard_{request.user.id}'
    context = cache.get(cache_key)
    if not context:
        # My Assigned Assets (Enhanced)
        my_assets = Asset.objects.filter(assigned_to=request.user, is_deleted=False).select_related('category')
        for asset in my_assets:
            asset.condition = 'Good' if asset.last_maintenance_date > timezone.now() - timezone.timedelta(days=180) else 'Warning' if asset.last_maintenance_date > timezone.now() - timezone.timedelta(days=365) else 'Critical'  # Logic for condition
            asset.warranty_status = 'Active' if asset.warranty_expiry > timezone.now() else 'Expired'

        # Assume usage_policy_link and qr_code are fields in Asset model
        # Smart Dashboard Cards
        active_assets_count = my_assets.count()
        open_tickets_count = Ticket.objects.filter(user=request.user, status='Open').count()
        pending_requests_count = AssetRequest.objects.filter(user=request.user, status='Pending').count()
        warnings = Asset.objects.filter(assigned_to=request.user, warranty_expiry__lt=timezone.now() + timezone.timedelta(days=30)).count()  # Overdue maintenance example

        # Notifications Center
        notifications = UserNotification.objects.filter(user=request.user, is_read=False).order_by('-created_at')[:10]

        # Personal Usage & History Log
        usage_history = UserAssetHistory.objects.filter(user=request.user).order_by('-end_date')

        # Self-Service Knowledge Base
        knowledge_articles = KnowledgeArticle.objects.filter(is_public=True).order_by('-relevance_score')[:5]  # Assume relevance_score field

        # Compliance & Acknowledgement (Check if acknowledged)
        has_acknowledged_policy = UserAssetHistory.objects.filter(user=request.user, acknowledged_policy=True).exists()  # Or dedicated field/model
        context = {
            'my_assets': my_assets,
            'my_open_tickets': Ticket.objects.filter(user=request.user, status='Open'),
            'asset_usage_summary': AssetUsageLog.objects.filter(user=request.user).aggregate(
                total_duration=Sum('duration_minutes'),
                avg_duration=Avg('duration_minutes')
            ),
            'active_assets_count': active_assets_count,
            'open_tickets_count': open_tickets_count,
            'pending_requests_count': pending_requests_count,
            'warnings': warnings,
            'notifications': notifications,
            'usage_history': usage_history,
            'knowledge_articles': knowledge_articles,
            'has_acknowledged_policy': has_acknowledged_policy,
            # Quick Actions: Handled in template with HTMX for no-reload
        }
        cache.set(cache_key, context, 60)  # Cache for 60 seconds
    return render(request, 'dashboard/user.html', context)

@login_required
@role_required(['ICT Officer'])
def officer_dashboard_view(request):
    cache_key = 'ict_officer_dashboard'
    context = cache.get(cache_key)
    if not context:
        officer_dept = request.user.userprofile.department  # Assume department filter

        # Asset Management Panel
        all_assets = Asset.objects.filter(is_deleted=False, department=officer_dept).select_related('category', 'assigned_to')
        overdue_maintenance = all_assets.filter(last_maintenance_date__lt=timezone.now() - timezone.timedelta(days=180))
        near_warranty_expiry = all_assets.filter(warranty_expiry__lte=timezone.now() + timezone.timedelta(days=30))
        unassigned_assets = all_assets.filter(assigned_to=None)

        # Asset Requests Queue
        pending_requests = AssetRequest.objects.filter(status='Pending', user__userprofile__department=officer_dept).order_by('priority', 'request_date')

        # Maintenance & Predictive Panel
        predictive_alerts = PredictiveAlert.objects.filter(risk_level__gt=50, asset__department=officer_dept).order_by('-risk_level')  # Assume risk_level field

        # Ticket & Incident Management
        open_tickets = Ticket.objects.filter(status__in=['Open', 'In Progress', 'Awaiting User'], asset__department=officer_dept).order_by('priority', '-created_at')
        avg_resolution_time = Ticket.objects.filter(status='Closed', asset__department=officer_dept).annotate(
            resolution_time=ExpressionWrapper(F('closed_at') - F('created_at'), output_field=DurationField())
        ).aggregate(avg=Avg('resolution_time'))

        # Notifications & Alerts
        notifications = ICTNotification.objects.filter(user=request.user, is_read=False).order_by('-created_at')

        # Reporting & Analytics
        asset_utilization = AssetUsageLog.objects.filter(asset__department=officer_dept).values('asset__department__name').annotate(total=Sum('duration_minutes'))
        high_risk_assets = predictive_alerts.filter(risk_level__gt=80).count()

        # Asset Movement & Tracking
        movement_requests = AssetMovementRequest.objects.filter(status='Pending', asset__department=officer_dept)

        # Inventory & Procurement
        low_inventory = InventoryItem.objects.filter(quantity__lt=F('reorder_level'))
        pending_procurements = ProcurementRequest.objects.filter(status='Pending')

        # Access & Permissions
        temp_access_requests = TemporaryAccessRequest.objects.filter(status='Pending')
        context = {
            'all_assets': all_assets,
            'overdue_maintenance': overdue_maintenance,
            'near_warranty_expiry': near_warranty_expiry,
            'unassigned_assets': unassigned_assets,
            'pending_requests': pending_requests,
            'predictive_alerts': predictive_alerts,
            'open_tickets': open_tickets,
            'avg_resolution_time': avg_resolution_time,
            'notifications': notifications,
            'asset_utilization': asset_utilization,
            'high_risk_assets': high_risk_assets,
            'movement_requests': movement_requests,
            'low_inventory': low_inventory,
            'pending_procurements': pending_procurements,
            'temp_access_requests': temp_access_requests,
            # Cards & Stats
            'open_tickets_count': open_tickets.count(),
            'pending_requests_count': pending_requests.count(),
            'assets_at_risk': predictive_alerts.count(),
            # Quick Actions: Handled in template with HTMX
        }
        cache.set(cache_key, context, 30)  # Cache for 30 seconds
    return render(request, 'dashboard/ict_officer.html', context)


@login_required
@role_required(['Manager'])
def manager_dashboard_view(request):
    cache_key = 'manager_dashboard'
    context = cache.get(cache_key)
    if not context:
        # Asset Oversight
        all_assets = Asset.objects.filter(is_deleted=False)
        assets_at_risk = PredictiveMaintenanceProfile.objects.filter(predicted_failure_risk__gt=80).count()  # Assume threshold
        needing_maintenance = all_assets.filter(last_maintenance_date__lt=timezone.now() - timezone.timedelta(days=180))
        unassigned_assets = all_assets.filter(assigned_to=None)
        expired_warranties = all_assets.filter(warranty_expiry__lt=timezone.now())

        # Asset Requests Management
        pending_asset_requests = AssetRequest.objects.filter(status='Pending')

        # Procurement & Inventory
        pending_procurements = ProcurementRequest.objects.filter(status='Pending')
        low_inventory = InventoryItem.objects.filter(quantity__lt=F('reorder_level'))

        # Ticket & Incident Reports
        all_tickets = Ticket.objects.all()
        avg_resolution_time = all_tickets.filter(status='Closed').annotate(
            resolution_time=ExpressionWrapper(F('closed_at') - F('created_at'), output_field=DurationField())
        ).aggregate(avg=Avg('resolution_time'))
        tickets_per_dept = all_tickets.values('asset__department__name').annotate(count=Count('id'))

        # Predictive & Maintenance Reports
        predictive_alerts = PredictiveMaintenanceProfile.objects.filter(predicted_failure_risk__gt=50).order_by('-predicted_failure_risk')
        maintenance_logs = MaintenanceLog.objects.order_by('-date')[:10]

        # Reporting & Analytics
        asset_utilization = AssetUsageLog.objects.values('asset__department__name').annotate(total=Sum('duration_minutes'))
        maintenance_efficiency = MaintenanceLog.objects.values('maintenance_type').annotate(count=Count('id'))

        # Notifications (assume ManagerNotification model or reuse ICTNotification)
        notifications = ICTNotification.objects.filter(user=request.user, is_read=False).order_by('-created_at')  # Reuse for simplicity
        context = {
            'all_assets': all_assets,
            'assets_at_risk': assets_at_risk,
            'needing_maintenance': needing_maintenance,
            'unassigned_assets': unassigned_assets,
            'expired_warranties': expired_warranties,
            'pending_asset_requests': pending_asset_requests,
            'pending_procurements': pending_procurements,
            'low_inventory': low_inventory,
            'all_tickets': all_tickets,
            'avg_resolution_time': avg_resolution_time,
            'tickets_per_dept': tickets_per_dept,
            'predictive_alerts': predictive_alerts,
            'maintenance_logs': maintenance_logs,
            'asset_utilization': asset_utilization,
            'maintenance_efficiency': maintenance_efficiency,
            'notifications': notifications,
            # KPI Cards
            'open_requests_count': pending_asset_requests.count(),
            'pending_procurement_count': pending_procurements.count(),
            'high_risk_assets_count': assets_at_risk,
            # Graphs: Pass data to template for rendering
        }
        cache.set(cache_key, context, 120)  # Cache for 120 seconds
    return render(request, 'dashboard/manager.html', context)
class UserTicketListView(LoginRequiredMixin, ListView):
    model = Ticket
    template_name = 'tickets/user_ticket_list.html'
    context_object_name = 'tickets'
    paginate_by = 10

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).order_by('-created_at')

@login_required
@role_required(['Admin'])
def admin_dashboard_view(request):
    cache_key = 'admin_dashboard'
    context = cache.get(cache_key)
    if not context:
        # User & Role Management
        users = UserProfile.objects.all()
        login_activity = LoginAttempt.objects.order_by('-timestamp')[:20]

        # Asset & Maintenance Oversight
        all_assets = Asset.objects.filter(is_deleted=False)
        predictive_alerts = PredictiveMaintenanceProfile.objects.filter(predicted_failure_risk__gt=50)

        # Tickets & Requests
        all_tickets = Ticket.objects.all()
        pending_requests = AssetRequest.objects.filter(status='Pending')

        # Inventory & Procurement
        low_inventory = InventoryItem.objects.filter(quantity__lt=F('reorder_level'))
        pending_procurements = ProcurementRequest.objects.filter(status='Pending')

        # Reporting & Analytics
        all_reports = {
            'asset': all_assets.values('status').annotate(count=Count('pk')),  #  use pk for Asset
            'maintenance': MaintenanceLog.objects.values('maintenance_type').annotate(count=Count('id')),
            'usage': AssetUsageLog.objects.values('activity_type').annotate(total=Sum('duration_minutes')),
            'risk': PredictiveMaintenanceProfile.objects.order_by('-predicted_failure_risk'),
        }

        # Audit Access (Partial)
        recent_audits = AuditLog.objects.order_by('-timestamp')[:50]

        context = {
            'users': users,
            'login_activity': login_activity,
            'all_assets': all_assets,
            'predictive_alerts': predictive_alerts,
            'all_tickets': all_tickets,
            'pending_requests': pending_requests,
            'low_inventory': low_inventory,
            'pending_procurements': pending_procurements,
            'all_reports': all_reports,
            'recent_audits': recent_audits,
            # Dashboard Cards
            'asset_allocation': all_assets.values('department__name').annotate(count=Count('pk')),  
            'maintenance_alerts': predictive_alerts.count(),
            'pending_requests_count': pending_requests.count(),
        }
        cache.set(cache_key, context, 60)

    return render(request, 'dashboard/admin.html', context)



# =========================================================
#  SUPERADMIN DASHBOARD VIEW
# =========================================================
@login_required
@role_required(['SuperAdmin'])
def superadmin_dashboard_view(request):
    cache_key = f'superadmin_dashboard_{request.user.id}'
    context = cache.get(cache_key)
    
    if not context:
        # Check if user is Django superuser
        is_django_superuser = request.user.is_superuser
        
        # User Management (exclude current user from promote list)
        users = UserProfile.objects.exclude(user=request.user)
        
        # Get all Admins for demotion
        admin_users = UserProfile.objects.filter(role='Admin')
        
        # System Settings Management
        system_settings = SystemSetting.objects.all()

        # Audit & Logs
        all_audits = AuditLog.objects.all()

        # Role & Permission Control
        roles = RolePermission.objects.values('role').distinct()
        permissions = RolePermission.objects.all()

        # Full Asset & Maintenance Oversight
        all_assets = Asset.objects.filter(is_deleted=False)
        all_maintenance = MaintenanceLog.objects.all()
        all_movements = AssetMovement.objects.all()
        all_usage_logs = AssetUsageLog.objects.all()
        predictive_alerts = PredictiveMaintenanceProfile.objects.all()

        # Tickets & Requests
        all_tickets = Ticket.objects.all()
        all_requests = AssetRequest.objects.all()

        # Reporting & Analytics - FIXED: Use asset_id instead of id
        custom_analytics = {
            'asset_distribution': all_assets.values('department__name').annotate(count=Count('asset_id')),
            'maintenance_trends': MaintenanceLog.objects.values('date__month').annotate(count=Count('id')),
        }

        # Notifications - FIXED: Remove priority filter since ICTNotification doesn't have that field
        critical_alerts = ICTNotification.objects.filter(is_read=False)
        
        context = {
            'is_django_superuser': is_django_superuser,
            'users': users,
            'admin_users': admin_users,
            'system_settings': system_settings,
            'all_audits': all_audits,
            'roles': roles,
            'permissions': permissions,
            'all_assets': all_assets,
            'all_maintenance': all_maintenance,
            'all_movements': all_movements,
            'all_usage_logs': all_usage_logs,
            'predictive_alerts': predictive_alerts,
            'all_tickets': all_tickets,
            'all_requests': all_requests,
            'custom_analytics': custom_analytics,
            'critical_alerts': critical_alerts,
            'role_choices': UserProfile.ROLE_CHOICES,
        }
        cache.set(cache_key, context, 60)
    
    return render(request, 'dashboard/superadmin.html', context)
# =========================================================
# USER MANAGEMENT VIEWS
# =========================================================
class UserProfileListView(LoginRequiredMixin, ListView):
    model = UserProfile
    template_name = 'auth/user_list.html'
    context_object_name = 'users'

    def dispatch(self, *args, **kwargs):
        if not has_permission(self.request.user, 'user.view'):
            raise PermissionDenied
        return super().dispatch(*args, **kwargs)

    def get_queryset(self):
        return UserProfile.objects.filter(is_active=True)


class UserProfileDetailView(LoginRequiredMixin, DetailView):
    model = UserProfile
    template_name = 'auth/user_detail.html'

    def dispatch(self, *args, **kwargs):
        if not has_permission(self.request.user, 'user.view'):
            raise PermissionDenied
        return super().dispatch(*args, **kwargs)


class UserProfileCreateView(LoginRequiredMixin, CreateView):
    model = UserProfile
    fields = ['user', 'role', 'department']
    template_name = 'auth/user_form.html'
    success_url = reverse_lazy('core:userprofile_list')

    def dispatch(self, *args, **kwargs):
        if not has_permission(self.request.user, 'user.create'):
            raise PermissionDenied
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        instance = form.save()
        log_audit(self.request.user, 'create_user', 'UserProfile', instance.id)
        return super().form_valid(form)


class UserProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = UserProfile
    fields = ['role', 'department', 'is_active']
    template_name = 'auth/user_form.html'
    success_url = reverse_lazy('core:userprofile_list')

    def dispatch(self, *args, **kwargs):
        if not has_permission(self.request.user, 'user.update'):
            raise PermissionDenied
        if self.get_object().role == 'SuperAdmin' and self.request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(*args, **kwargs)

    def form_valid(self, form):
        old_value = str(self.get_object())
        instance = form.save()
        log_audit(self.request.user, 'update_user', 'UserProfile', instance.id, old_value, str(instance))
        UserNotification.objects.create(
            user=instance.user,
            message=f'Your profile has been updated to role: {instance.role}'
        )
        return super().form_valid(form)

# ==================================================================
# PROMOTIONS VIEWS WITH WORKFLOW CONTROL – CONSOLIDATED & SECURE
# ==================================================================

# ------------------------------------------------------------------
# HELPER FUNCTIONS (unchanged – keep as they are)
# ------------------------------------------------------------------
def can_promote_to(requester_role, target_role):
    """Check if requester can promote to target role based on hierarchy."""
    hierarchy = {'SuperAdmin':5, 'Admin':4, 'Manager':3, 'ICT Officer':2, 'User':1}
    if requester_role == 'SuperAdmin':
        return True
    return hierarchy.get(target_role, 0) < hierarchy.get(requester_role, 0)

def can_demote_from(requester_role, target_current_role):
    """Check if requester can demote from target's current role."""
    hierarchy = {'SuperAdmin':5, 'Admin':4, 'Manager':3, 'ICT Officer':2, 'User':1}
    if requester_role == 'SuperAdmin':
        return True
    return hierarchy.get(target_current_role, 0) < hierarchy.get(requester_role, 0)

def get_available_roles_for_promotion(requester_role):
    """Return list of (value, label) roles the requester can promote to."""
    all_roles = UserProfile.ROLE_CHOICES
    if requester_role == 'SuperAdmin':
        return all_roles
    elif requester_role == 'Admin':
        return [c for c in all_roles if c[0] in ('Manager', 'ICT Officer', 'User')]
    elif requester_role == 'Manager':
        return [c for c in all_roles if c[0] in ('ICT Officer', 'User')]
    elif requester_role == 'ICT Officer':
        return [c for c in all_roles if c[0] == 'User']
    return []

def get_available_roles_for_demotion(requester_role, target_current_role):
    """Return list of (value, label) roles the requester can demote to."""
    hierarchy = {'SuperAdmin':5, 'Admin':4, 'Manager':3, 'ICT Officer':2, 'User':1}
    all_roles = UserProfile.ROLE_CHOICES
    target_level = hierarchy.get(target_current_role, 0)
    if requester_role == 'SuperAdmin':
        return [c for c in all_roles if c[0] != 'SuperAdmin' and hierarchy.get(c[0],0) < target_level]
    elif requester_role == 'Admin':
        if target_current_role in ('SuperAdmin','Admin'):
            return []
        return [c for c in all_roles if c[0] not in ('SuperAdmin','Admin') and hierarchy.get(c[0],0) < target_level]
    elif requester_role == 'Manager':
        if target_current_role in ('SuperAdmin','Admin','Manager'):
            return []
        return [c for c in all_roles if c[0] not in ('SuperAdmin','Admin','Manager') and hierarchy.get(c[0],0) < target_level]
    elif requester_role == 'ICT Officer':
        if target_current_role != 'User':
            return []
        return []  # No lower role than User
    return []

def validate_promotion_request_func(request, target_user, new_role):
    """Reusable promotion validation logic."""
    requester_role = get_user_role(request.user)
    try:
        target_profile = target_user.userprofile
        current_role = target_profile.role
    except UserProfile.DoesNotExist:
        return False, "Target user profile not found."
    if current_role == new_role:
        return False, f"User is already a {new_role}."
    if not can_promote_to(requester_role, new_role):
        return False, f"You don't have permission to promote users to {new_role}."
    if new_role == 'SuperAdmin' and requester_role != 'SuperAdmin':
        return False, "Only SuperAdmin can promote to SuperAdmin."
    if new_role == 'Admin' and requester_role != 'SuperAdmin':
        return False, "Only SuperAdmin can promote to Admin."
    hierarchy = {'SuperAdmin':5, 'Admin':4, 'Manager':3, 'ICT Officer':2, 'User':1}
    if hierarchy.get(new_role,0) > hierarchy.get(requester_role,0):
        return False, f"You cannot promote to a role higher than your own ({requester_role})."
    return True, ""

def validate_promotion_request(request, target_user, new_role):
    """Wrapper for validation (kept for compatibility)."""
    return validate_promotion_request_func(request, target_user, new_role)

def log_role_change(performed_by, user, old_role, new_role, reason=None):
    """Specialised audit logging for role changes."""
    AuditLog.objects.create(
        user=performed_by,
        action='role_change',
        model_name='UserProfile',
        object_id=user.id,
        old_value=old_role,
        new_value=new_role,
        additional_info={
            'target_user': user.username,
            'performed_by': performed_by.username,
            'reason': reason,
            'timestamp': timezone.now().isoformat()
        }
    )

# ------------------------------------------------------------------
# INLINE DJANGO FORM – no external forms.py required
# ------------------------------------------------------------------
from django import forms

class _RoleChangeForm(forms.Form):
    """Internal form for role changes (defined here to avoid circular imports)."""
    new_role = forms.ChoiceField(
        label="New Role",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    reason = forms.CharField(
        label="Reason for change",
        required=False,
        widget=forms.Textarea(attrs={'rows': 3, 'class': 'form-control'})
    )
    effective_date = forms.DateField(
        label="Effective date (optional)",
        required=False,
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
    notify_user = forms.BooleanField(
        label="Send notification to user",
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    email_copy = forms.BooleanField(
        label="Send me an email copy",
        required=False,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )

    def __init__(self, requester_role, current_role, *args, **kwargs):
        super().__init__(*args, **kwargs)
        all_choices = get_available_roles_for_promotion(requester_role)
        choices = [(code, label) for code, label in all_choices if code != current_role]
        if not choices:
            choices = [('', '--- No promotion options available ---')]
        self.fields['new_role'].choices = choices

# ------------------------------------------------------------------
# UNIFIED PROMOTION / DEMOTION VIEW (Admin & SuperAdmin)
# ------------------------------------------------------------------
@role_required(['Admin', 'SuperAdmin'])
@login_required
def promote_user(request, pk):
    """
    Single view for both promotion and demotion.
    - SuperAdmin: can assign any role.
    - Admin: can only assign Manager, ICT Officer, User (cannot modify other Admins).
    Uses _RoleChangeForm for validation and role filtering.
    """
    profile = get_object_or_404(UserProfile, pk=pk)
    current_user_role = get_user_role(request.user)

    # Prevent self‑modification
    if profile.user == request.user:
        messages.error(request, 'You cannot change your own role.')
        return redirect('core:userprofile_list')

    if request.method == 'POST':
        form = _RoleChangeForm(current_user_role, profile.role, request.POST)
        if form.is_valid():
            new_role = form.cleaned_data['new_role']
            reason = form.cleaned_data['reason']
            effective_date = form.cleaned_data['effective_date']
            notify_user = form.cleaned_data['notify_user']
            email_copy = form.cleaned_data['email_copy']

            # Hierarchy levels
            hierarchy = {'SuperAdmin':5, 'Admin':4, 'Manager':3, 'ICT Officer':2, 'User':1}
            new_role_level = hierarchy.get(new_role, 0)
            current_user_level = hierarchy.get(current_user_role, 0)
            current_role_level = hierarchy.get(profile.role, 0)

            # Extra security checks (beyond form)
            if current_user_role != 'SuperAdmin':
                # Admin cannot promote to Admin/SuperAdmin
                if new_role in ['Admin', 'SuperAdmin']:
                    messages.error(request, 'Admin cannot promote to Admin or SuperAdmin.')
                    return redirect('core:promote_user', pk=pk)
                # Admin cannot modify other Admins
                if profile.role == 'Admin':
                    messages.error(request, 'Admin cannot change roles of other Admins.')
                    return redirect('core:promote_user', pk=pk)
                # Cannot promote to a role equal or higher than own
                if new_role_level >= current_user_level:
                    messages.error(request, f'You cannot promote to a role equal or higher than your own ({current_user_role}).')
                    return redirect('core:promote_user', pk=pk)

            # Perform the role change
            old_role = profile.role
            profile.role = new_role
            profile.save()

            # Determine action for audit log
            action = 'promote_user' if new_role_level > current_role_level else 'demote_user'

            # Log with full details
            log_audit(
                request.user,
                action,
                'UserProfile',
                profile.id,
                old_role,
                new_role,
                f'Reason: {reason}, Effective: {effective_date}, Notify: {notify_user}, EmailCopy: {email_copy}'
            )

            # Send notification if requested
            if notify_user:
                action_word = 'promoted' if new_role_level > current_role_level else 'demoted'
                UserNotification.objects.create(
                    user=profile.user,
                    message=f'You have been {action_word} from {old_role} to {new_role} by {request.user.username}. Reason: {reason}',
                    notification_type='role_change'
                )

            # Placeholder for email copy
            if email_copy:
                # TODO: send email to request.user
                pass

            messages.success(
                request,
                f'Successfully {"promoted" if new_role_level > current_role_level else "demoted"} '
                f'{profile.user.username} from {old_role} to {new_role}.'
            )
            return redirect('core:userprofile_list')
    else:
        form = _RoleChangeForm(current_user_role, profile.role)

    # GET request – prepare context
    recent_promotions = AuditLog.objects.filter(
        model_name='UserProfile',
        action__in=['promote_user', 'demote_user', 'promote_to_admin', 'admin_promote_user']
    ).order_by('-timestamp')[:5]

    formatted_promotions = []
    for audit in recent_promotions:
        try:
            target_profile = UserProfile.objects.get(id=audit.object_id)
            formatted_promotions.append({
                'user': target_profile.user,
                'old_role': audit.old_value,
                'new_role': audit.new_value,
                'date': audit.timestamp
            })
        except UserProfile.DoesNotExist:
            continue

    role_hierarchy = {
        'SuperAdmin': {'level': 5, 'icon': 'fas fa-crown', 'color': 'danger', 'description': 'Full system control'},
        'Admin': {'level': 4, 'icon': 'fas fa-user-tie', 'color': 'warning', 'description': 'System administration'},
        'Manager': {'level': 3, 'icon': 'fas fa-chart-line', 'color': 'info', 'description': 'Team management'},
        'ICT Officer': {'level': 2, 'icon': 'fas fa-desktop', 'color': 'primary', 'description': 'Asset management'},
        'User': {'level': 1, 'icon': 'fas fa-user', 'color': 'secondary', 'description': 'Basic access'}
    }

    context = {
        'profile': profile,
        'form': form,
        'recent_promotions': formatted_promotions,
        'today': timezone.now().date(),
        'current_user_role': current_user_role,
        'role_hierarchy': role_hierarchy,
        'can_promote_to_admin': current_user_role == 'SuperAdmin',
        'can_promote_to_superadmin': current_user_role == 'SuperAdmin',
        'is_self': False,
    }
    return render(request, 'auth/promote_form.html', context)

# ------------------------------------------------------------------
# SUPERADMIN: PROMOTE TO SUPERADMIN (special, with extra confirmation)
# ------------------------------------------------------------------
@role_required(['SuperAdmin'])
@login_required
def promote_to_superadmin(request, user_id):
    """Promote a user to SuperAdmin (also sets Django superuser)."""
    user_to_promote = get_object_or_404(User, id=user_id)
    try:
        user_profile = user_to_promote.userprofile
    except UserProfile.DoesNotExist:
        user_profile = UserProfile.objects.create(user=user_to_promote, role='User')

    if user_to_promote == request.user:
        messages.error(request, 'You are already a SuperAdmin.')
        return redirect('core:superadmin_dashboard_view')
    if user_profile.role == 'SuperAdmin':
        messages.warning(request, f'{user_to_promote.username} is already a SuperAdmin.')
        return redirect('core:superadmin_dashboard_view')

    if request.method == 'POST':
        reason = request.POST.get('reason', 'No reason provided')
        confirm = request.POST.get('confirm_understanding') == 'on'
        if not confirm:
            messages.error(request, 'You must confirm your understanding of SuperAdmin privileges.')
            return redirect('core:superadmin_dashboard_view')

        old_role = user_profile.role
        user_profile.role = 'SuperAdmin'
        user_profile.save()

        # Also grant Django superuser/staff
        user_to_promote.is_superuser = True
        user_to_promote.is_staff = True
        user_to_promote.save()

        log_audit(request.user, 'promote_to_superadmin', 'UserProfile',
                  user_profile.id, old_role, 'SuperAdmin',
                  f'Promoted by {request.user.username}: {reason}')

        messages.success(request, f'Successfully promoted {user_to_promote.username} to SuperAdmin.')
        return redirect('core:superadmin_dashboard_view')

    return render(request, 'auth/confirm_promote_superadmin.html', {
        'user_to_promote': user_to_promote,
        'user_profile': user_profile,
        'current_role': user_profile.role,
    })

# ------------------------------------------------------------------
# SUPERADMIN: DEMOTE FROM ADMIN
# ------------------------------------------------------------------
@role_required(['SuperAdmin'])
@login_required
def demote_from_admin(request, user_id):
    """SuperAdmin demotes an Admin to a lower role."""
    admin_user = get_object_or_404(User, id=user_id)
    try:
        admin_profile = admin_user.userprofile
        if admin_profile.role != 'Admin':
            messages.error(request, 'User is not an Admin.')
            return redirect('core:superadmin_dashboard_view')
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found.')
        return redirect('core:superadmin_dashboard_view')

    if admin_user == request.user:
        messages.error(request, 'You cannot demote yourself.')
        return redirect('core:superadmin_dashboard_view')

    if request.method == 'POST':
        new_role = request.POST.get('new_role')
        reason = request.POST.get('reason', 'No reason provided')
        notify_user = request.POST.get('notify_user') == 'on'

        if not new_role:
            messages.error(request, 'Please select a role.')
            return redirect('core:superadmin_dashboard_view')
        if new_role == 'SuperAdmin':
            messages.error(request, 'Cannot demote to SuperAdmin.')
            return redirect('core:superadmin_dashboard_view')

        old_role = admin_profile.role
        admin_profile.role = new_role
        admin_profile.save()

        log_audit(request.user, 'demote_from_admin', 'UserProfile',
                  admin_profile.id, old_role, new_role,
                  f'Demoted by {request.user.username}: {reason}')

        if notify_user:
            UserNotification.objects.create(
                user=admin_user,
                message=f'You have been demoted to {new_role} role by {request.user.username}. Reason: {reason}',
                notification_type='role_change'
            )

        messages.success(request, f'Successfully demoted {admin_user.username} from Admin to {new_role}.')
        return redirect('core:superadmin_dashboard_view')

    available_roles = get_available_roles_for_demotion('SuperAdmin', 'Admin')
    role_hierarchy = {
        'SuperAdmin': {'level':5,'icon':'fas fa-crown','color':'danger'},
        'Admin': {'level':4,'icon':'fas fa-user-tie','color':'warning'},
        'Manager': {'level':3,'icon':'fas fa-chart-line','color':'info'},
        'ICT Officer': {'level':2,'icon':'fas fa-desktop','color':'primary'},
        'User': {'level':1,'icon':'fas fa-user','color':'secondary'}
    }
    return render(request, 'auth/demote_admin.html', {
        'admin_user': admin_user,
        'admin_profile': admin_profile,
        'current_role': admin_profile.role,
        'available_roles': available_roles,
        'role_hierarchy': role_hierarchy,
        'today': timezone.now().date(),
    })

# ------------------------------------------------------------------
# ADMIN: DEMOTE USER (Admin can only demote to User, cannot touch Admins)
# ------------------------------------------------------------------
@role_required(['Admin', 'SuperAdmin'])
@login_required
def admin_demote_user(request, user_id):
    """Admin demotes a non‑Admin user (only to User role)."""
    user_to_demote = get_object_or_404(User, id=user_id)
    try:
        user_profile = user_to_demote.userprofile
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found.')
        return redirect('core:admin_dashboard_view')

    current_user_role = get_user_role(request.user)

    if current_user_role not in ['Admin', 'SuperAdmin']:
        messages.error(request, 'Only Admin or SuperAdmin can demote users.')
        return redirect('core:dashboard')
    if user_to_demote == request.user:
        messages.error(request, 'You cannot demote yourself.')
        return redirect('core:admin_dashboard_view')
    if user_profile.role in ['Admin', 'SuperAdmin'] and current_user_role == 'Admin':
        messages.error(request, 'Admin cannot demote other Admins or SuperAdmins.')
        return redirect('core:admin_dashboard_view')

    if request.method == 'POST':
        new_role = request.POST.get('new_role')
        reason = request.POST.get('reason', 'No reason provided')
        notify_user = request.POST.get('notify_user') == 'on'

        if not new_role:
            messages.error(request, 'Please select a role.')
            return redirect('core:admin_dashboard_view')

        if current_user_role == 'SuperAdmin':
            if new_role == 'SuperAdmin':
                messages.error(request, 'Cannot demote to SuperAdmin.')
                return redirect('core:admin_dashboard_view')
        else:
            if new_role != 'User':
                messages.error(request, 'Admin can only demote users to User role.')
                return redirect('core:admin_dashboard_view')

        old_role = user_profile.role
        user_profile.role = new_role
        user_profile.save()

        log_audit(request.user, 'admin_demote_user', 'UserProfile',
                  user_profile.id, old_role, new_role,
                  f'Demoted by {request.user.username} ({current_user_role}): {reason}')

        if notify_user:
            UserNotification.objects.create(
                user=user_to_demote,
                message=f'You have been demoted to {new_role} role by {request.user.username}',
                notification_type='role_change'
            )

        messages.success(request, f'Successfully demoted {user_to_demote.username} to {new_role}.')
        return redirect('core:admin_dashboard_view')

    # Available demotion roles
    if current_user_role == 'SuperAdmin':
        available_roles = [
            c for c in UserProfile.ROLE_CHOICES
            if c[0] != user_profile.role and c[0] != 'SuperAdmin'
        ]
    else:
        available_roles = [('User', 'User')]

    role_hierarchy = {
        'SuperAdmin': {'level':5,'icon':'fas fa-crown','color':'danger'},
        'Admin': {'level':4,'icon':'fas fa-user-tie','color':'warning'},
        'Manager': {'level':3,'icon':'fas fa-chart-line','color':'info'},
        'ICT Officer': {'level':2,'icon':'fas fa-desktop','color':'primary'},
        'User': {'level':1,'icon':'fas fa-user','color':'secondary'}
    }
    return render(request, 'auth/admin_demote_user.html', {
        'user_to_demote': user_to_demote,
        'user_profile': user_profile,
        'current_role': user_profile.role,
        'available_roles': available_roles,
        'is_superadmin': current_user_role == 'SuperAdmin',
        'role_hierarchy': role_hierarchy,
        'today': timezone.now().date(),
    })

# ------------------------------------------------------------------
# BULK PROMOTION (SuperAdmin only)
# ------------------------------------------------------------------
@role_required(['SuperAdmin'])
@login_required
def bulk_promote_users(request):
    """Bulk promote multiple users to a target role."""
    if request.method == 'POST':
        user_ids = request.POST.getlist('user_ids')
        target_role = request.POST.get('target_role')

        if not user_ids or not target_role:
            messages.error(request, 'Please select users and target role.')
            return redirect('core:superadmin_dashboard_view')

        valid_roles = [r[0] for r in UserProfile.ROLE_CHOICES]
        if target_role not in valid_roles:
            messages.error(request, 'Invalid role selected.')
            return redirect('core:superadmin_dashboard_view')

        promoted_count = 0
        for uid in user_ids:
            user = get_object_or_404(User, id=uid)
            if user == request.user and target_role == 'SuperAdmin':
                continue
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': target_role}
            )
            if not created:
                old_role = profile.role
                profile.role = target_role
                profile.save()
                log_audit(request.user, 'bulk_promote', 'UserProfile',
                          profile.id, old_role, target_role,
                          f'Bulk promotion by {request.user.username}')
            else:
                log_audit(request.user, 'bulk_promote_create', 'UserProfile',
                          profile.id, None, target_role,
                          f'Bulk promotion by {request.user.username}')
            promoted_count += 1
            UserNotification.objects.create(
                user=user,
                message=f'Your role has been changed to {target_role} by system administrator',
                notification_type='role_change'
            )

        messages.success(request, f'Successfully promoted {promoted_count} users to {target_role}.')
        return redirect('core:superadmin_dashboard_view')

    users = User.objects.exclude(id=request.user.id)
    current_user_role = get_user_role(request.user)
    available_roles = get_available_roles_for_promotion(current_user_role)
    role_hierarchy = {
        'SuperAdmin': {'level':5,'icon':'fas fa-crown','color':'danger'},
        'Admin': {'level':4,'icon':'fas fa-user-tie','color':'warning'},
        'Manager': {'level':3,'icon':'fas fa-chart-line','color':'info'},
        'ICT Officer': {'level':2,'icon':'fas fa-desktop','color':'primary'},
        'User': {'level':1,'icon':'fas fa-user','color':'secondary'}
    }
    return render(request, 'auth/bulk_promote.html', {
        'users': users,
        'role_choices': available_roles,
        'role_hierarchy': role_hierarchy,
    })

# ------------------------------------------------------------------
# USER ROLE HISTORY
# ------------------------------------------------------------------
@role_required(['SuperAdmin', 'Admin'])
@login_required
def user_role_history(request, user_id):
    """View complete role change history for a user."""
    user = get_object_or_404(User, id=user_id)
    role_changes = AuditLog.objects.filter(
        model_name='UserProfile',
        object_id=user.id,
        action__in=['role_change', 'promote_user', 'demote_user',
                    'promote_to_admin', 'demote_from_admin',
                    'admin_promote_user', 'admin_demote_user']
    ).order_by('-timestamp')

    try:
        current_role = user.userprofile.role
    except UserProfile.DoesNotExist:
        current_role = 'User'

    return render(request, 'auth/role_history.html', {
        'target_user': user,
        'role_changes': role_changes,
        'current_role': current_role,
        'can_promote': get_user_role(request.user) in ['SuperAdmin', 'Admin']
    })

# ------------------------------------------------------------------
# API ENDPOINTS (AJAX)
# ------------------------------------------------------------------
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
@login_required
def validate_promotion_request(request, user_id):
    """API: Check if a promotion request is allowed."""
    user_to_promote = get_object_or_404(User, id=user_id)
    requested_role = request.GET.get('role', '')
    if not requested_role:
        return JsonResponse({'valid': False, 'message': 'No role specified'})
    is_valid, message = validate_promotion_request_func(request, user_to_promote, requested_role)
    return JsonResponse({
        'valid': is_valid,
        'message': message,
        'user_id': user_id,
        'requested_role': requested_role
    })

@require_http_methods(["GET"])
@login_required
@role_required(['SuperAdmin', 'Admin'])
def get_user_role_info(request, user_id):
    """API: Get user's current role and available promotion options."""
    user = get_object_or_404(User, id=user_id)
    try:
        current_role = user.userprofile.role
    except UserProfile.DoesNotExist:
        current_role = 'User'
    requester_role = get_user_role(request.user)
    available_roles_list = get_available_roles_for_promotion(requester_role)
    available_roles = [r[0] for r in available_roles_list]
    return JsonResponse({
        'user_id': user_id,
        'username': user.username,
        'current_role': current_role,
        'available_roles': available_roles,
        'requester_role': requester_role,
        'can_promote': requester_role in ['SuperAdmin', 'Admin']
    })
# ==================================================================
# END OF PROMOTIONS SECTION
# ==================================================================

# =========================================================
# ASSET MANAGEMENT VIEWS (UPDATED FOR CURRENT MODELS)
# =========================================================
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django_filters.views import FilterView
import django_filters
from io import BytesIO
import base64
import qrcode
from barcode import Code128
from barcode.writer import ImageWriter

from .models import Asset, AssetRequest, AssetMovement, AssetUsageLog, PredictiveMaintenanceProfile, UserProfile, UserNotification, ICTNotification
from .utils import log_audit, has_permission, role_required  

# =========================================================
# ASSET FILTER
# =========================================================
class AssetFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Asset.STATUS_CHOICES)
    department = django_filters.ModelChoiceFilter(
        queryset=UserProfile.objects.exclude(department=None).values_list('department', flat=True).distinct()
    )
    assigned_to = django_filters.ModelChoiceFilter(queryset=User.objects.all())

    class Meta:
        model = Asset
        fields = ['status', 'department', 'assigned_to']

# =========================================================
# ASSET LIST VIEW
# =========================================================
class AssetListView(LoginRequiredMixin, FilterView, ListView):
    model = Asset
    template_name = 'assets/list.html'
    context_object_name = 'assets'
    paginate_by = 20
    filterset_class = AssetFilter

    def get_queryset(self):
        return (
            Asset.objects.filter(is_deleted=False)
            .select_related('department', 'category', 'assigned_to')
            .order_by('-created_at')
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        overdue_threshold = timezone.now() + timezone.timedelta(days=30)
        context['near_warranty_expiry'] = self.get_queryset().filter(warranty_expiry__lt=overdue_threshold)
        return context

# =========================================================
# SEARCH ASSETS
# =========================================================
@login_required
def asset_search(request):
    q = request.GET.get('q', '')
    assets = Asset.objects.filter(is_deleted=False).filter(
        Q(asset_tag__icontains=q) | Q(serial_number__icontains=q) | Q(asset_name__icontains=q)
    )
    return render(request, 'assets/search.html', {'assets': assets, 'query': q})

# =========================================================
# ASSET DETAIL
# =========================================================
class AssetDetailView(LoginRequiredMixin, DetailView):
    model = Asset
    template_name = 'assets/detail.html'

# =========================================================
# CREATE ASSET (Admin, SuperAdmin, ICT Officer)
# =========================================================
class AssetCreateView(LoginRequiredMixin, CreateView):
    model = Asset
    template_name = 'assets/form.html'
    fields = '__all__'
    success_url = reverse_lazy('core:asset_list')

    def dispatch(self, request, *args, **kwargs):
        user_role = get_user_role(request.user)
        allowed_roles = ['Admin', 'SuperAdmin', 'ICT Officer']
        if user_role not in allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        asset = form.save()
        # Auto-create predictive maintenance profile
        PredictiveMaintenanceProfile.objects.create(asset=asset)
        log_audit(self.request.user, 'create_asset', 'Asset', asset.asset_id)
        messages.success(self.request, 'Asset created successfully.')
        return super().form_valid(form)
    
    
    
# =========================================================
# UPDATE ASSET (Admin, SuperAdmin, ICT Officer)
# =========================================================
class AssetUpdateView(LoginRequiredMixin, UpdateView):
    model = Asset
    template_name = 'assets/form.html'
    fields = '__all__'
    success_url = reverse_lazy('core:asset_list')

    def dispatch(self, request, *args, **kwargs):
        user_role = get_user_role(request.user)
        allowed_roles = ['Admin', 'SuperAdmin', 'ICT Officer']
        if user_role not in allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        old = str(self.get_object())
        asset = form.save()
        log_audit(self.request.user, 'update_asset', 'Asset', asset.asset_id, old, str(asset))
        messages.success(self.request, 'Asset updated.')
        return super().form_valid(form)
    
# =========================================================
# DELETE ASSET (SOFT DELETE) – Admin, SuperAdmin, ICT Officer
# =========================================================
class AssetDeleteView(LoginRequiredMixin, DeleteView):
    model = Asset
    template_name = 'assets/confirm_delete.html'
    success_url = reverse_lazy('core:asset_list')

    def dispatch(self, request, *args, **kwargs):
        user_role = get_user_role(request.user)
        allowed_roles = ['Admin', 'SuperAdmin', 'ICT Officer']
        if user_role not in allowed_roles:
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        asset = self.get_object()
        asset.is_deleted = True
        asset.save()
        log_audit(request.user, 'delete_asset', 'Asset', asset.asset_id)
        messages.success(request, 'Asset deleted.')
        return redirect(self.success_url)
    
# =========================================================
# QR & BARCODE GENERATION (ICT Officer, Admin, SuperAdmin)
# =========================================================
@role_required(['ICT Officer', 'Admin', 'SuperAdmin'])
def generate_asset_qr(request, pk):
    asset = get_object_or_404(Asset, pk=pk)
    payload = f"TAG:{asset.asset_tag}\nSERIAL:{asset.serial_number}\nNAME:{asset.asset_name}\nLOCATION:{asset.location}"
    qr = qrcode.make(payload)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    asset.qr_code_image = 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode()
    asset.save()
    log_audit(request.user, 'generate_qr', 'Asset', asset.asset_id)
    messages.success(request, 'QR code generated.')
    return redirect('core:asset_detail', pk=pk)

@role_required(['ICT Officer', 'Admin', 'SuperAdmin'])
def generate_asset_barcode(request, pk):
    asset = get_object_or_404(Asset, pk=pk)
    buffer = BytesIO()
    Code128(asset.asset_tag, writer=ImageWriter()).write(buffer)
    asset.barcode_image = 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode()
    asset.save()
    log_audit(request.user, 'generate_barcode', 'Asset', asset.asset_id)
    messages.success(request, 'Barcode generated.')
    return redirect('core:asset_detail', pk=pk)            

# =========================================================
# ASSET REQUEST
# =========================================================
# =========================================================
# ASSET REQUEST CREATE VIEW (FIXED)
# =========================================================
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.generic import CreateView
from .models import AssetRequest, Asset, Category, UserNotification, User  # ← IMPORT Category
from .utils import log_audit, has_permission

class AssetRequestCreateView(LoginRequiredMixin, CreateView):
    model = AssetRequest
    fields = [
        'selected_asset',
        'additional_requirements',
        'intended_use',
        'replacement_for',
        'urgency',
        'justification',
        'hours_per_day',
        'days_per_week',
        'required_by_date',
        'supporting_docs',
    ]
    template_name = 'assets/request_form.html'
    success_url = reverse_lazy('core:assetrequest_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user_dept = self.request.user.userprofile.department

        context['recommended_assets'] = Asset.objects.filter(
            department=user_dept,
            assigned_to=None,
            is_deleted=False
        ).select_related('category')[:5]

        context['user_assets'] = Asset.objects.filter(
            assigned_to=self.request.user,
            is_deleted=False
        )

        context['today'] = timezone.now().date()
        return context

    def form_valid(self, form):
        request_obj = form.save(commit=False)

        # --- Convert category string from form to Category object ---
        category_name = self.request.POST.get('category')
        if category_name:
            try:
                # Adjust the lookup to match your Category model's name field
                category = Category.objects.get(name__iexact=category_name)
                request_obj.category = category
            except Category.DoesNotExist:
                # If category not found, set to None and warn user
                request_obj.category = None
                messages.warning(
                    self.request,
                    f"Category '{category_name}' not found. Please contact ICT."
                )
        # ------------------------------------------------------------

        # Set user and status
        request_obj.user = self.request.user
        request_obj.status = 'Pending'
        request_obj.request_date = timezone.now()

        # --- Collect dynamic specifications into JSON ---
        specs = {}
        spec_fields = [
            'processor', 'ram', 'storage', 'screen_size', 'os',
            'graphics', 'size', 'resolution', 'panel_type',
            'printer_type', 'color', 'monthly_volume', 'description', 'brand'
        ]
        for key in spec_fields:
            if key in self.request.POST and self.request.POST[key]:
                value = self.request.POST[key].strip()
                unit_key = f"{key}_unit"
                if unit_key in self.request.POST and self.request.POST[unit_key]:
                    value = f"{value} {self.request.POST[unit_key]}"
                specs[key] = value
        request_obj.specifications = specs
        # ------------------------------------------------

        request_obj.save()
        form.save_m2m()   # safe even without many-to-many fields

        # Audit log
        log_audit(
            self.request.user,
            'create_request',
            'AssetRequest',
            request_obj.request_id
        )

        # Notify first ICT Officer
        ict_user = User.objects.filter(
            userprofile__role='ICT Officer'
        ).first()
        if ict_user:
            UserNotification.objects.create(
                user=ict_user,
                message=f'New asset request from {request_obj.user.get_full_name() or request_obj.user.username}'
            )

        messages.success(self.request, 'Asset request submitted successfully.')
        return super().form_valid(form)
    
    
class AssetRequestListView(LoginRequiredMixin, ListView):
    model = AssetRequest
    template_name = 'assets/request_list.html'

    def get_queryset(self):
        qs = AssetRequest.objects.all().order_by('status', 'request_date')
        if has_permission(self.request.user, 'asset.assign'):
            return qs
        return qs.filter(user=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        overdue_threshold = timezone.now() - timezone.timedelta(days=3)
        context['overdue_requests'] = self.get_queryset().filter(status='Pending', request_date__lt=overdue_threshold)
        return context

# =========================================================
# ASSET ASSIGNMENT
# =========================================================
@role_required(['ICT Officer'])
def asset_assignment_view(request, request_id=None):
    asset_request = get_object_or_404(AssetRequest, request_id=request_id) if request_id else None

    if request.method == 'POST':
        asset_ids = request.POST.getlist('asset_ids')
        user_id = request.POST.get('user_id')
        user = get_object_or_404(User, id=user_id)
        for asset_id in asset_ids:
            asset = get_object_or_404(Asset, id=asset_id)
            asset.assigned_to = user
            asset.save()
            log_audit(request.user, 'assign_asset', 'Asset', asset.asset_id)

        if asset_request:
            asset_request.status = 'Assigned'
            asset_request.save()
            ICTNotification.objects.create(user=asset_request.user, message='Your asset request has been assigned.')

        messages.success(request, 'Assets assigned.')
        return redirect('core:officer_dashboard_view')

    suggested_assets = Asset.objects.filter(assigned_to=None, department=request.user.userprofile.department)[:10]
    users = User.objects.filter(userprofile__department=request.user.userprofile.department)
    return render(request, 'assets/assignment_form.html', {'suggested_assets': suggested_assets, 'users': users, 'asset_request': asset_request})

@role_required(['ICT Officer'])
def reject_asset_request(request, pk):
    req = get_object_or_404(AssetRequest, pk=pk)
    req.status = 'Rejected'
    req.save()
    log_audit(request.user, 'reject_asset', 'AssetRequest', pk)
    UserNotification.objects.create(user=req.user, message='Your asset request has been rejected.')
    messages.success(request, 'Request rejected.')
    return redirect('core:assetrequest_list')

# =========================================================
# ASSET MOVEMENT
# =========================================================
class AssetMovementCreateView(LoginRequiredMixin, CreateView):
    model = AssetMovement
    fields = ['asset', 'to_location', 'notes']
    template_name = 'assets/movement_form.html'
    success_url = reverse_lazy('core:assetmovement_list')

    def dispatch(self, request, *args, **kwargs):
        if not has_permission(request.user, 'asset.move'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        move = form.save(commit=False)
        move.from_location = move.asset.location
        move.moved_by = self.request.user
        move.movement_date = timezone.now()
        move.asset.location = move.to_location
        move.asset.save()
        move.save()
        log_audit(self.request.user, 'move_asset', 'AssetMovement', move.id)
        if move.asset.assigned_to:
            UserNotification.objects.create(user=move.asset.assigned_to, message=f'Your asset {move.asset.asset_tag} has been moved to {move.to_location}')
        return super().form_valid(form)

class AssetMovementListView(LoginRequiredMixin, ListView):
    model = AssetMovement
    template_name = 'assets/movement_list.html'

@login_required
def asset_movement_history(request, asset_pk):
    asset = get_object_or_404(Asset, pk=asset_pk)
    movements = AssetMovement.objects.filter(asset=asset).order_by('-movement_date')
    return render(request, 'assets/movement_history.html', {'asset': asset, 'movements': movements})

# =========================================================
# USAGE LOGS
# =========================================================
class AssetUsageLogCreateView(LoginRequiredMixin, CreateView):
    model = AssetUsageLog
    fields = ['asset', 'activity_type', 'duration_minutes']
    template_name = 'assets/usage_form.html'
    success_url = reverse_lazy('core:assetusage_list')

    def form_valid(self, form):
        log = form.save(commit=False)
        log.user = self.request.user
        log.activity_date = timezone.now().date()
        log.save()
        log_audit(self.request.user, 'log_usage', 'AssetUsageLog', log.id)
        return super().form_valid(form)

class AssetUsageLogListView(LoginRequiredMixin, ListView):
    model = AssetUsageLog
    template_name = 'assets/usage_list.html'

@login_required
def asset_usage_summary(request, asset_pk):
    asset = get_object_or_404(Asset, pk=asset_pk)
    summary = AssetUsageLog.objects.filter(asset=asset).aggregate(
        total=Sum('duration_minutes'),
        average=Avg('duration_minutes')
    )
    return render(request, 'assets/usage_summary.html', {'asset': asset, 'summary': summary})

# =========================================================
# PREDICTIVE MAINTENANCE (IMPROVED ALERTS VIEW)
# =========================================================
class PredictiveAlertView(LoginRequiredMixin, ListView):
    model = PredictiveAlert
    template_name = 'maintenance/predictive_alerts_officer.html'
    context_object_name = 'alerts'
    def get_queryset(self):
        return PredictiveAlert.objects.filter(asset__department=self.request.user.userprofile.department).order_by('-risk_level')
    def post(self, request, *args, **kwargs):
        alert_id = request.POST.get('alert_id')
        alert = get_object_or_404(PredictiveAlert, id=alert_id)
        # Action: Create maintenance log
        MaintenanceLog.objects.create(asset=alert.asset, maintenance_type='Predictive', performed_by=request.user, date=timezone.now())
        alert.resolved = True
        alert.save()
        log_audit(request.user, 'resolve_predictive_alert', 'PredictiveAlert', alert.id)
        messages.success(request, 'Alert resolved with maintenance log.')
        return redirect('core:predictive_alert_view')

@role_required(['ICT Officer'])
def evaluate_predictive_maintenance(request):
    call_command('evaluate_predictive')
    log_audit(request.user, 'evaluate_predictive')
    messages.success(request, 'Predictive evaluation complete.')
    new_alerts = PredictiveAlert.objects.filter(resolved=False)  # Notify on new
    for alert in new_alerts:
        ICTNotification.objects.create(user=request.user, message=f'New predictive alert for asset {alert.asset.asset_tag}')
    return redirect('core:predictivemaintenance_list')


from django.views.generic import ListView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.core.exceptions import PermissionDenied
from django.urls import reverse_lazy
from django.utils import timezone
from .models import MaintenanceLog, Asset, ICTNotification
from .utils import log_audit
import csv
from django.contrib.auth.decorators import login_required

# =========================================================
# Maintenance Log Views
# =========================================================

class MaintenanceLogListView(LoginRequiredMixin, ListView):
    model = MaintenanceLog
    template_name = 'maintenance/log_list.html'
    context_object_name = 'logs'
    paginate_by = 25  # number of logs per page
    ordering = ['-date']  # newest logs first

    def get_queryset(self):
        """
        Restrict logs to assets in user's department (unless SuperAdmin).
        Supports optional filtering by asset or maintenance_type via GET params.
        """
        qs = super().get_queryset()
        
        # SuperAdmin sees all logs
        if hasattr(self.request.user, 'userprofile') and self.request.user.userprofile.role != 'SuperAdmin':
            qs = qs.filter(asset__department=self.request.user.userprofile.department)

        # Optional GET filters
        asset_id = self.request.GET.get('asset')
        maintenance_type = self.request.GET.get('type')
        if asset_id:
            qs = qs.filter(asset__asset_id=asset_id)
        if maintenance_type:
            qs = qs.filter(maintenance_type=maintenance_type)

        return qs

    def dispatch(self, request, *args, **kwargs):
        # Only allow users with the right permission
        if not has_permission(request.user, 'maintenance.view'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
    
    
from django.views.generic import ListView, CreateView
from .models import MaintenanceLog, Asset, ICTNotification
from .utils import log_audit

class MaintenanceLogView(LoginRequiredMixin, CreateView):
    model = MaintenanceLog
    fields = ['asset', 'maintenance_type', 'notes']
    template_name = 'maintenance/officer_log_form.html'
    success_url = reverse_lazy('core:officer_dashboard_view')

    def dispatch(self, request, *args, **kwargs):
        if not has_permission(request.user, 'maintenance.create'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Filter high-risk assets in user's department
        if hasattr(self.request.user, 'userprofile'):
            context['high_risk_assets'] = Asset.objects.filter(
                department=self.request.user.userprofile.department,
                predictive_maintenance__risk_level__gt=50
            )
        else:
            context['high_risk_assets'] = Asset.objects.none()
        return context

    def form_valid(self, form):
        log = form.save(commit=False)
        log.performed_by = self.request.user
        log.date = timezone.now().date()
        # Auto set Preventive if warranty expires within 30 days
        if log.asset.warranty_expiry and log.asset.warranty_expiry < timezone.now().date() + timezone.timedelta(days=30):
            log.maintenance_type = 'Preventive'
        log.save()
        log_audit(self.request.user, 'log_maintenance', 'MaintenanceLog', log.id)
        # Notify assigned user
        if log.asset.assigned_to:
            ICTNotification.objects.create(
                user=log.asset.assigned_to,
                message=f'Maintenance logged for your asset {log.asset.asset_tag}'
            )
        return super().form_valid(form)

@login_required
def maintenance_history(request, asset_pk):
    asset = get_object_or_404(Asset, pk=asset_pk)
    logs = MaintenanceLog.objects.filter(asset=asset).order_by('-date')
    return render(request, 'maintenance/history.html', {'asset': asset, 'logs': logs})

# =========================================================
# TICKETING SYSTEM (IMPROVED ORDERING, SLA INDICATORS)
# =========================================================
class IncidentReportView(LoginRequiredMixin, CreateView):
    model = Ticket
    fields = ['asset', 'priority', 'description', 'image']  # Assume image field added to Ticket
    template_name = 'tickets/incident_form.html'
    success_url = reverse_lazy('core:ticket_list')
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['asset'].queryset = Asset.objects.filter(assigned_to=self.request.user)  # Only user's assets
        return form
    def form_valid(self, form):
        ticket = form.save(commit=False)
        ticket.user = self.request.user
        ticket.status = 'Open'
        ticket.created_at = timezone.now()
        # Auto-fill asset details in description if needed
        if ticket.asset:
            ticket.description += f'\nAsset Details: {ticket.asset.asset_tag}, {ticket.asset.serial_number}'
        # Smart default priority
        if ticket.asset.category in ['Critical', 'HighValue']:
            ticket.priority = 'Urgent'
        ticket.save()
        log_audit(self.request.user, 'report_incident', 'Ticket', ticket.id)
        messages.success(self.request, 'Incident reported.')
        # Notification to ICT
        UserNotification.objects.create(user=User.objects.filter(userprofile__role='ICT Officer').first(), message=f'New incident from {ticket.user.username}')
        return super().form_valid(form)

class TicketQueueView(LoginRequiredMixin, ListView):
    model = Ticket
    template_name = 'tickets/officer_queue.html'
    context_object_name = 'tickets'
    def get_queryset(self):
        return Ticket.objects.filter(asset__department=self.request.user.userprofile.department).order_by('status', 'priority', '-created_at')
    def post(self, request, *args, **kwargs):
        ticket_id = request.POST.get('ticket_id')
        new_status = request.POST.get('new_status')
        ticket = get_object_or_404(Ticket, id=ticket_id)
        old_status = ticket.status
        ticket.status = new_status
        if new_status == 'Closed':
            ticket.closed_at = timezone.now()
        ticket.save()
        log_audit(request.user, 'update_ticket_status', 'Ticket', ticket.id, old_status, new_status)
        messages.success(request, 'Ticket status updated.')
        # Notify user
        ICTNotification.objects.create(user=ticket.user, message=f'Your ticket {ticket.id} status changed to {new_status}')
        return redirect('core:ticket_queue_view')

class TicketDetailView(LoginRequiredMixin, DetailView):
    model = Ticket
    template_name = 'tickets/detail.html'
    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.user != self.request.user:
            raise PermissionDenied
        return obj
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Track progress: Add history or status changes (assume Ticket has status_history field as list)
        context['status_progress'] = ['Open', 'In Progress', 'Awaiting User', 'Resolved']  # Visual statuses
        return context


class UserTicketListView(LoginRequiredMixin, ListView):
    model = Ticket
    template_name = 'tickets/user_ticket_list.html'
    context_object_name = 'tickets'
    paginate_by = 10

    def get_queryset(self):
        # Show only tickets created by the logged-in user
        return Ticket.objects.filter(user=self.request.user).order_by('-created_at')


class TicketUpdateView(LoginRequiredMixin, UpdateView):
    model = Ticket
    fields = ['priority', 'description']
    template_name = 'tickets/form.html'
    success_url = reverse_lazy('core:ticket_list')
    def dispatch(self, request, *args, **kwargs):
        ticket = self.get_object()
        if ticket.user != request.user and not has_permission(request.user, 'ticket.update_all'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
    def form_valid(self, form):
        old = str(self.get_object())
        ticket = form.save()
        log_audit(self.request.user, 'update_ticket', 'Ticket', ticket.id, old, str(ticket))
        messages.success(self.request, 'Ticket updated.')
        return super().form_valid(form)

@role_required(['ICT Officer'])
def close_ticket(request, pk):
    ticket = get_object_or_404(Ticket, pk=pk)
    ticket.status = 'Closed'
    ticket.closed_at = timezone.now()
    ticket.save()
    log_audit(request.user, 'close_ticket', 'Ticket', pk)
    UserNotification.objects.create(user=ticket.user, message=f'Your ticket {ticket.id} has been closed.')
    messages.success(request, 'Ticket closed.')
    return redirect('core:ticket_list')

@role_required(['Admin'])
def assign_ticket_to_officer(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    if request.method == 'POST':
        officer_id = request.POST.get('officer_id')
        officer = get_object_or_404(User, id=officer_id, userprofile__role='ICT Officer')
        ticket.assigned_to = officer  # Assume assigned_to field in Ticket
        ticket.save()
        log_audit(request.user, 'assign_ticket', 'Ticket', ticket.id)
        ICTNotification.objects.create(user=officer, message=f'Ticket {ticket.id} assigned to you.')
        messages.success(request, 'Ticket assigned.')
        return redirect('core:admin_dashboard_view')
    officers = User.objects.filter(userprofile__role='ICT Officer')
    return render(request, 'tickets/assign_form.html', {'ticket': ticket, 'officers': officers})

# =========================================================
# INVENTORY MANAGEMENT
# =========================================================
class InventoryItemListView(LoginRequiredMixin, ListView):
    model = InventoryItem
    template_name = 'inventory/item_list.html'

class InventoryItemCreateView(LoginRequiredMixin, CreateView):
    model = InventoryItem
    fields = ['name', 'quantity', 'reorder_level']
    template_name = 'inventory/item_form.html'
    success_url = reverse_lazy('core:inventoryitem_list')
    def dispatch(self, request, *args, **kwargs):
        if not has_permission(request.user, 'inventory.create'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
    def form_valid(self, form):
        item = form.save()
        log_audit(self.request.user, 'create_inventory', 'InventoryItem', item.id)
        messages.success(self.request, 'Inventory item added.')
        return super().form_valid(form)

class InventoryItemUpdateView(LoginRequiredMixin, UpdateView):
    model = InventoryItem
    fields = ['quantity', 'reorder_level']
    template_name = 'inventory/item_form.html'
    success_url = reverse_lazy('core:inventoryitem_list')
    def dispatch(self, request, *args, **kwargs):
        if not has_permission(request.user, 'inventory.update'):
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
    def form_valid(self, form):
        old = str(self.get_object())
        item = form.save()
        log_audit(self.request.user, 'update_inventory', 'InventoryItem', item.id, old, str(item))
        messages.success(self.request, 'Inventory updated.')
        return super().form_valid(form)

@role_required(['ICT Officer'])
def inventory_management_view(request):
    low_inventory = InventoryItem.objects.filter(quantity__lt=F('reorder_level'))
    pending_procurements = ProcurementRequest.objects.filter(status='Pending')
    if request.method == 'POST':
        proc_id = request.POST.get('proc_id')
        action = request.POST.get('action')
        proc = get_object_or_404(ProcurementRequest, id=proc_id)
        if action == 'approve':
            proc.status = 'Approved'
            proc.item.quantity += proc.quantity
            proc.item.save()
            log_audit(request.user, 'approve_procurement', 'ProcurementRequest', proc.id)
            messages.success(request, 'Procurement approved.')
        elif action == 'reject':
            proc.status = 'Rejected'
            log_audit(request.user, 'reject_procurement', 'ProcurementRequest', proc.id)
            messages.success(request, 'Procurement rejected.')
        proc.save()
        # Notify requester
        ICTNotification.objects.create(user=proc.requested_by, message=f'Your procurement request {proc.id} has been {proc.status}')
        return redirect('core:inventory_management_view')
    return render(request, 'inventory/officer_management.html', {'low_inventory': low_inventory, 'pending_procurements': pending_procurements})

# =========================================================
# PROCUREMENT REQUESTS
# =========================================================
class ProcurementRequestCreateView(LoginRequiredMixin, CreateView):
    model = ProcurementRequest
    fields = ['item', 'quantity']
    template_name = 'inventory/procurement_form.html'
    success_url = reverse_lazy('core:procurementrequest_list')
    def form_valid(self, form):
        req = form.save(commit=False)
        req.requested_by = self.request.user
        req.status = 'Pending'
        req.save()
        log_audit(self.request.user, 'create_procurement', 'ProcurementRequest', req.id)
        messages.success(self.request, 'Procurement request submitted.')
        return super().form_valid(form)

class ProcurementRequestListView(LoginRequiredMixin, ListView):
    model = ProcurementRequest
    template_name = 'inventory/procurement_list.html'
    def get_queryset(self):
        if has_permission(self.request.user, 'procurement.view_all'):
            return ProcurementRequest.objects.all()
        return ProcurementRequest.objects.filter(requested_by=self.request.user)

@role_required(['Manager'])
def batch_approve_requests(request):
    if request.method == 'POST':
        request_ids = request.POST.getlist('request_ids')
        for req_id in request_ids:
            req = get_object_or_404(AssetRequest, id=req_id)
            req.status = 'Approved'
            req.save()
            log_audit(request.user, 'approve_asset_request', 'AssetRequest', req.id)
            # Notify ICT for assignment
            ICTNotification.objects.create(user=User.objects.filter(userprofile__role='ICT Officer').first(), message=f'Asset request {req.id} approved by manager.')
        messages.success(request, 'Requests approved.')
        return redirect('core:manager_dashboard_view')
    return HttpResponseForbidden()

@role_required(['Manager'])
def approve_procurement(request, pk):
    req = get_object_or_404(ProcurementRequest, pk=pk)
    req.status = 'Approved'
    req.save()
    req.item.quantity += req.quantity
    req.item.save()
    log_audit(request.user, 'approve_procurement', 'ProcurementRequest', pk)
    ICTNotification.objects.create(user=req.requested_by, message=f'Your procurement request {req.id} has been approved.')
    messages.success(request, 'Procurement approved.')
    return redirect('core:procurementrequest_list')

@role_required(['Manager'])
def reject_procurement(request, pk):
    req = get_object_or_404(ProcurementRequest, pk=pk)
    req.status = 'Rejected'
    req.save()
    log_audit(request.user, 'reject_procurement', 'ProcurementRequest', pk)
    ICTNotification.objects.create(user=req.requested_by, message=f'Your procurement request {req.id} has been rejected.')
    messages.success(request, 'Procurement rejected.')
    return redirect('core:procurementrequest_list')

# =========================================================
# REPORTING – ENTERPRISE GRADE WITH PDF SUPPORT
# =========================================================
from django.utils.timezone import now
from datetime import datetime, timedelta

@role_required(['Manager', 'Admin', 'SuperAdmin'])
def asset_report(request):
    """
    Comprehensive asset report: summary by status, department, type,
    plus full asset list with all fields. Accepts date filters.
    """
    # --- Date filtering (optional) ---
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    assets_qs = Asset.objects.filter(is_deleted=False).select_related('department', 'category', 'assigned_to')
    
    if start_date:
        assets_qs = assets_qs.filter(purchase_date__gte=start_date)
    if end_date:
        assets_qs = assets_qs.filter(purchase_date__lte=end_date)

    # --- Summary aggregations ---
    by_status = assets_qs.values('status').annotate(count=Count('asset_id')).order_by('status')
    by_department = assets_qs.values('department__name').annotate(count=Count('asset_id')).order_by('-count')
    by_category = assets_qs.values('category__name').annotate(count=Count('asset_id')).order_by('-count')
    by_condition = assets_qs.values('condition_status').annotate(count=Count('asset_id')).order_by('condition_status')

    total_assets = assets_qs.count()
    active_assets = assets_qs.filter(status='Active').count()
    in_maintenance = assets_qs.filter(status='Maintenance').count()
    disposed = assets_qs.filter(status='Disposed').count()
    warranty_expiring_soon = assets_qs.filter(
        warranty_expiry__lte=now().date() + timedelta(days=30),
        warranty_expiry__gte=now().date()
    ).count()
    warranty_expired = assets_qs.filter(warranty_expiry__lt=now().date()).count()

    # --- Full asset list for detailed table ---
    assets = assets_qs.order_by('-created_at')[:500]  # limit for performance, or remove for PDF

    context = {
        # Metadata
        'report_title': 'Asset Status Report',
        'generated_at': now(),
        'generated_by': request.user,
        'date_range': f"{start_date or 'All'} to {end_date or 'All'}",
        'filters_applied': bool(start_date or end_date),

        # Summary charts
        'by_status': by_status,
        'by_department': by_department,
        'by_category': by_category,
        'by_condition': by_condition,

        # KPI cards
        'total_assets': total_assets,
        'active_assets': active_assets,
        'in_maintenance': in_maintenance,
        'disposed': disposed,
        'warranty_expiring_soon': warranty_expiring_soon,
        'warranty_expired': warranty_expired,

        # Detailed table
        'assets': assets,
    }
    return render(request, 'reports/asset.html', context)


@role_required(['Manager', 'Admin', 'SuperAdmin'])
def maintenance_report(request):
    """
    Comprehensive maintenance report: summary by type, by asset,
    detailed logs with asset and technician info.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    logs_qs = MaintenanceLog.objects.select_related('asset', 'performed_by')
    if start_date:
        logs_qs = logs_qs.filter(date__gte=start_date)
    if end_date:
        logs_qs = logs_qs.filter(date__lte=end_date)

    # --- Summaries ---
    by_type = logs_qs.values('maintenance_type').annotate(count=Count('id')).order_by('maintenance_type')
    by_asset = logs_qs.values('asset__asset_tag', 'asset__asset_name').annotate(
        count=Count('id'),
        last_date=Max('date')
    ).order_by('-count')[:20]  # top 20

    total_logs = logs_qs.count()
    preventive = logs_qs.filter(maintenance_type='Preventive').count()
    corrective = logs_qs.filter(maintenance_type='Corrective').count()
    predictive = logs_qs.filter(maintenance_type='Predictive').count()

    # --- Detailed logs (latest 500 for performance) ---
    logs = logs_qs.order_by('-date')[:500]

    context = {
        'report_title': 'Maintenance History Report',
        'generated_at': now(),
        'generated_by': request.user,
        'date_range': f"{start_date or 'All'} to {end_date or 'All'}",
        'filters_applied': bool(start_date or end_date),

        'by_type': by_type,
        'by_asset': by_asset,
        'total_logs': total_logs,
        'preventive': preventive,
        'corrective': corrective,
        'predictive': predictive,
        'logs': logs,
    }
    return render(request, 'reports/maintenance.html', context)


@role_required(['Manager', 'Admin', 'SuperAdmin'])
def usage_report(request):
    """
    Comprehensive asset usage report: total minutes by activity, by user, by asset,
    plus detailed usage logs.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    logs_qs = AssetUsageLog.objects.select_related('asset', 'user')
    if start_date:
        logs_qs = logs_qs.filter(activity_date__gte=start_date)
    if end_date:
        logs_qs = logs_qs.filter(activity_date__lte=end_date)

    # --- Summaries ---
    by_activity = logs_qs.values('activity_type').annotate(
        total=Sum('duration_minutes'),
        avg=Avg('duration_minutes')
    ).order_by('-total')

    by_user = logs_qs.values('user__username').annotate(
        total=Sum('duration_minutes')
    ).order_by('-total')[:20]

    by_asset = logs_qs.values('asset__asset_tag', 'asset__asset_name').annotate(
        total=Sum('duration_minutes')
    ).order_by('-total')[:20]

    total_minutes = logs_qs.aggregate(total=Sum('duration_minutes'))['total'] or 0
    total_logs = logs_qs.count()
    avg_duration = logs_qs.aggregate(avg=Avg('duration_minutes'))['avg'] or 0

    # --- Detailed logs ---
    logs = logs_qs.order_by('-activity_date')[:500]

    context = {
        'report_title': 'Asset Usage Report',
        'generated_at': now(),
        'generated_by': request.user,
        'date_range': f"{start_date or 'All'} to {end_date or 'All'}",
        'filters_applied': bool(start_date or end_date),

        'by_activity': by_activity,
        'by_user': by_user,
        'by_asset': by_asset,
        'total_minutes': total_minutes,
        'total_hours': total_minutes / 60,
        'total_logs': total_logs,
        'avg_duration': avg_duration,
        'logs': logs,
    }
    return render(request, 'reports/usage.html', context)


@role_required(['Manager', 'Admin', 'SuperAdmin'])
def risk_report(request):
    """
    Comprehensive predictive risk report: assets sorted by risk,
    summary statistics, and full list with all risk indicators.
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    profiles = PredictiveMaintenanceProfile.objects.select_related(
        'asset', 'asset__department'
    ).order_by('-predicted_failure_risk')

    # Optional date filter on last_evaluated
    if start_date:
        profiles = profiles.filter(last_evaluated__gte=start_date)
    if end_date:
        profiles = profiles.filter(last_evaluated__lte=end_date)

    # --- Summary stats ---
    total_profiled = profiles.count()
    high_risk = profiles.filter(predicted_failure_risk__gte=80).count()
    medium_risk = profiles.filter(predicted_failure_risk__gte=50, predicted_failure_risk__lt=80).count()
    low_risk = profiles.filter(predicted_failure_risk__lt=50).count()
    avg_risk = profiles.aggregate(avg=Avg('predicted_failure_risk'))['avg'] or 0

    by_priority = profiles.values('maintenance_priority').annotate(count=Count('id'))

    # --- Full list (no limit for risk report, usually not huge) ---
    risk_profiles = profiles.all()

    context = {
        'report_title': 'Predictive Maintenance Risk Report',
        'generated_at': now(),
        'generated_by': request.user,
        'date_range': f"{start_date or 'All'} to {end_date or 'All'}",
        'filters_applied': bool(start_date or end_date),

        'total_profiled': total_profiled,
        'high_risk': high_risk,
        'medium_risk': medium_risk,
        'low_risk': low_risk,
        'avg_risk': round(avg_risk, 1),
        'by_priority': by_priority,

        'data': risk_profiles,  # matches existing template variable
    }
    return render(request, 'reports/risk.html', context)

# =========================================================
# AUDIT LOGS (SAFE, FILTERED, PAGINATED)
# =========================================================
import django_filters
from django.core.exceptions import PermissionDenied
from django.contrib.auth.mixins import LoginRequiredMixin
from django_filters.views import FilterView
from django.views.generic import ListView, DetailView
from django.http import HttpResponse
from django.utils import timezone

from .models import AuditLog


class AuditLogFilter(django_filters.FilterSet):
    timestamp = django_filters.DateFromToRangeFilter()
    model_name = django_filters.CharFilter(
        field_name='model_name',
        lookup_expr='icontains',
        label='Model Name'
    )

    class Meta:
        model = AuditLog
        fields = ['timestamp', 'model_name']


class AuditLogListView(LoginRequiredMixin, FilterView, ListView):
    model = AuditLog
    template_name = 'audit/list.html'
    paginate_by = 50
    filterset_class = AuditLogFilter
    ordering = ['-timestamp']

    def dispatch(self, request, *args, **kwargs):
        if not hasattr(request.user, 'userprofile') or request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)


class AuditLogDetailView(LoginRequiredMixin, DetailView):
    model = AuditLog
    template_name = 'audit/detail.html'

    def dispatch(self, request, *args, **kwargs):
        if not hasattr(request.user, 'userprofile') or request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)


# =========================================================
# AUDIT EXPORT
# =========================================================
@role_required(['SuperAdmin'])
def export_audit(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="audit_log.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'User', 'Action', 'Model', 'Object ID',
        'Old Value', 'New Value', 'IP Address', 'Timestamp'
    ])

    for log in AuditLog.objects.all().order_by('-timestamp'):
        writer.writerow([
            log.user.username if log.user else 'System',
            log.action,
            log.model_name,
            log.object_id,
            log.old_value,
            log.new_value,
            log.ip_address,
            log.timestamp
        ])

    return response


# =========================================================
# AUDIT LOGGER (CENTRAL & SAFE)
# =========================================================
def log_audit(user, action, model=None, object_id=None, old=None, new=None, ip=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model or '',
        object_id=object_id,
        old_value=old or '',
        new_value=new or '',
        ip_address=ip or '',
        timestamp=timezone.now()
    )


# =========================================================
# SYSTEM SETTINGS
# =========================================================
class SystemSettingListView(LoginRequiredMixin, ListView):
    model = SystemSetting
    template_name = 'settings/list.html'
    def dispatch(self, request, *args, **kwargs):
        if request.user.userprofile.role != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

class SystemSettingDetailView(LoginRequiredMixin, DetailView):
    model = SystemSetting
    template_name = 'settings/detail.html'

@role_required(['SuperAdmin'])
def update_system_setting(request, pk):
    setting = get_object_or_404(SystemSetting, pk=pk)
    Form = modelform_factory(SystemSetting, fields=['value'])
    if request.method == 'POST':
        form = Form(request.POST, instance=setting)
        if form.is_valid():
            old = setting.value
            form.save()
            log_audit(request.user, 'update_setting', 'SystemSetting', pk, old, setting.value)
            messages.success(request, 'Setting updated.')
            return redirect('core:systemsetting_list')
    else:
        form = Form(instance=setting)
    return render(request, 'settings/form.html', {'form': form, 'setting': setting})

# =========================================================
# LOGIN ATTEMPT LOGS
# =========================================================
@role_required(['SuperAdmin'])
def login_attempt_logs(request):
    logs = LoginAttempt.objects.order_by('-timestamp')
    return render(request, 'auth/login_attempts.html', {'logs': logs})


# =========================================================
# MY ASSETS VIEW (DETAILED LIST WITH ENHANCEMENTS)
# =========================================================
class MyAssetsView(LoginRequiredMixin, ListView):
    model = Asset
    template_name = 'assets/my_assets.html'
    context_object_name = 'my_assets'
    def get_queryset(self):
        qs = Asset.objects.filter(assigned_to=self.request.user, is_deleted=False).select_related('category', 'department')
        for asset in qs:
            asset.condition = 'Good' if asset.last_maintenance_date > timezone.now() - timezone.timedelta(days=180) else 'Warning' if asset.last_maintenance_date > timezone.now() - timezone.timedelta(days=365) else 'Critical'
            asset.warranty_status = 'Active' if asset.warranty_expiry > timezone.now() else 'Expired'
        return qs

# =========================================================
# NOTIFICATIONS VIEW (NEW FOR NOTIFICATIONS CENTER)
# =========================================================
@login_required
@role_required(['User'])
def notifications_view(request):
    notifications = UserNotification.objects.filter(user=request.user).order_by('-created_at')
    if request.method == 'POST':
        notification_id = request.POST.get('notification_id')
        if notification_id:
            notif = get_object_or_404(UserNotification, id=notification_id, user=request.user)
            notif.is_read = True
            notif.save()
            messages.success(request, 'Notification marked as read.')
        return redirect('core:notifications_view')
    return render(request, 'notifications/list.html', {'notifications': notifications})

@login_required
@role_required(['ICT Officer'])
def officer_notifications_view(request):
    notifications = ICTNotification.objects.filter(user=request.user).order_by('-created_at')
    if request.method == 'POST':
        notification_id = request.POST.get('notification_id')
        if notification_id:
            notif = get_object_or_404(ICTNotification, id=notification_id, user=request.user)
            notif.is_read = True
            notif.save()
            messages.success(request, 'Notification marked as read.')
        return redirect('core:officer_notifications_view')
    return render(request, 'notifications/officer_list.html', {'notifications': notifications})

# =========================================================
# ACKNOWLEDGE POLICY VIEW (NEW FOR COMPLIANCE)
# =========================================================
@login_required
@role_required(['User'])
def acknowledge_policy_view(request, asset_id):
    asset = get_object_or_404(Asset, id=asset_id, assigned_to=request.user)
    if request.method == 'POST':
        # Assume form with checkbox
        if request.POST.get('acknowledge') == 'true':
            # Store acknowledgement (e.g., in UserAssetHistory)
            history = UserAssetHistory.objects.create(
                user=request.user,
                asset=asset,
                acknowledged_policy=True,
                acknowledgement_date=timezone.now()
            )
            log_audit(request.user, 'acknowledge_policy', 'UserAssetHistory', history.id)
            messages.success(request, 'Policy acknowledged.')
            return redirect('core:user_dashboard_view')
    return render(request, 'assets/acknowledge_policy.html', {'asset': asset})

# =========================================================
# ADDITIONAL VIEWS FOR ENTERPRISE FEATURES (Temporary Access, Asset Return/Transfer)
# =========================================================
class TemporaryAccessRequestCreateView(LoginRequiredMixin, CreateView):
    model = TemporaryAccessRequest
    fields = ['access_type', 'duration', 'reason']  # Assume fields: access_type (software/network/admin), duration, reason
    template_name = 'requests/temporary_access_form.html'
    success_url = reverse_lazy('core:dashboard')
    def form_valid(self, form):
        req = form.save(commit=False)
        req.user = self.request.user
        req.status = 'Pending'
        req.request_date = timezone.now()
        req.expiry_date = timezone.now() + timezone.timedelta(days=form.cleaned_data['duration'])
        req.save()
        # Approval flow: Notify manager
        UserNotification.objects.create(user=User.objects.filter(userprofile__role='Manager').first(), message=f'New temporary access request from {req.user.username}')
        log_audit(self.request.user, 'create_temp_access', 'TemporaryAccessRequest', req.id)
        return super().form_valid(form)

class AssetTransferRequestCreateView(LoginRequiredMixin, CreateView):
    model = AssetTransferRequest
    fields = ['asset', 'to_user', 'reason', 'clearance_confirmation']  # Assume clearance_confirmation as file/image field
    template_name = 'assets/transfer_form.html'
    success_url = reverse_lazy('core:dashboard')
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['asset'].queryset = Asset.objects.filter(assigned_to=self.request.user)
        return form
    def form_valid(self, form):
        req = form.save(commit=False)
        req.from_user = self.request.user
        req.status = 'Pending'
        req.request_date = timezone.now()
        req.save()
        # Notify ICT/Manager
        UserNotification.objects.create(user=User.objects.filter(userprofile__role='ICT Officer').first(), message=f'New asset transfer request from {req.from_user.username} to {req.to_user.username}')
        log_audit(self.request.user, 'create_transfer', 'AssetTransferRequest', req.id)
        return super().form_valid(form)

class AssetReturnRequestView(LoginRequiredMixin, UpdateView):
    model = Asset
    fields = []  # No fields, just update
    template_name = 'assets/return_form.html'
    success_url = reverse_lazy('core:dashboard')
    def get_queryset(self):
        return Asset.objects.filter(assigned_to=self.request.user)
    def form_valid(self, form):
        asset = form.save(commit=False)
        asset.assigned_to = None
        asset.status = 'Available'  # Assume status field
        asset.save()
        # Create history
        UserAssetHistory.objects.create(user=self.request.user, asset=asset, end_date=timezone.now())
        log_audit(self.request.user, 'return_asset', 'Asset', asset.id)
        messages.success(self.request, 'Asset return requested.')
        return super().form_valid(form)

# =========================================================
# SUPERADMIN OVERRIDE VIEWS (E.G., OVERRIDE ASSIGNMENTS)
# =========================================================
@role_required(['SuperAdmin'])
def override_assignment(request, asset_id):
    asset = get_object_or_404(Asset, id=asset_id)
    if request.method == 'POST':
        new_user_id = request.POST.get('new_user_id')
        new_user = get_object_or_404(User, id=new_user_id)
        old_assigned = asset.assigned_to
        asset.assigned_to = new_user
        asset.save()
        log_audit(request.user, 'override_assignment', 'Asset', asset.id, str(old_assigned), str(new_user))
        messages.success(request, 'Assignment overridden.')
        return redirect('core:superadmin_dashboard_view')
    users = User.objects.all()
    return render(request, 'assets/override_form.html', {'asset': asset, 'users': users})


from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from .models import PredictiveAlert, ICTNotification
from .utils import has_permission

@login_required
@require_GET
def check_alerts_api(request):
    """
    API endpoint for ICT Officer dashboard.
    Returns the number of new unresolved predictive alerts and unread notifications.
    """
    if not has_permission(request.user, 'predictive.view') and not request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied'}, status=403)

    dept = getattr(request.user.userprofile, 'department', None)
    new_alerts = 0
    if dept:
        new_alerts = PredictiveAlert.objects.filter(
            asset__department=dept,
            resolved=False
        ).count()

    unread_notifications = ICTNotification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return JsonResponse({
        'new_alerts': new_alerts,
        'unread_notifications': unread_notifications,
        'timestamp': timezone.now().isoformat()
    })
    
    
    
    
    
    
    
    
# =========================================================
# DEPARTMENT MANAGEMENT (SUPERADMIN ONLY)
# =========================================================
from .models import Department

class DepartmentListView(LoginRequiredMixin, ListView):
    model = Department
    template_name = 'departments/list.html'
    context_object_name = 'departments'
    paginate_by = 20

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        # Simple alphabetical order – no Meta.ordering needed
        return Department.objects.all().order_by('name')


class DepartmentCreateView(LoginRequiredMixin, CreateView):
    model = Department
    fields = ['name', 'description']
    template_name = 'departments/form.html'
    success_url = reverse_lazy('core:department_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        dept = form.save()
        log_audit(
            self.request.user,
            'create_department',
            'Department',
            dept.id,
            None,
            f"Name: {dept.name}"
        )
        messages.success(self.request, f'Department "{dept.name}" created.')
        return super().form_valid(form)


class DepartmentUpdateView(LoginRequiredMixin, UpdateView):
    model = Department
    fields = ['name', 'description']
    template_name = 'departments/form.html'
    success_url = reverse_lazy('core:department_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        old_name = self.get_object().name
        dept = form.save()
        log_audit(
            self.request.user,
            'update_department',
            'Department',
            dept.id,
            old_name,
            dept.name
        )
        messages.success(self.request, f'Department updated to "{dept.name}".')
        return super().form_valid(form)


class DepartmentDeleteView(LoginRequiredMixin, DeleteView):
    model = Department
    template_name = 'departments/confirm_delete.html'
    success_url = reverse_lazy('core:department_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        dept = self.get_object()
        # Prevent deletion if users or assets are still assigned
        if UserProfile.objects.filter(department=dept).exists():
            messages.error(request, f'Cannot delete: {dept.name} still has assigned users.')
            return redirect('core:department_list')
        if Asset.objects.filter(department=dept).exists():
            messages.error(request, f'Cannot delete: {dept.name} still has assets.')
            return redirect('core:department_list')
        log_audit(request.user, 'delete_department', 'Department', dept.id, dept.name, None)
        return super().post(request, *args, **kwargs)    
    
    
    
    
@login_required
@role_required(['SuperAdmin'])
def assign_user_department(request, user_id):
    """Assign a department to a specific user."""
    user = get_object_or_404(User, id=user_id)
    profile, created = UserProfile.objects.get_or_create(user=user)

    if request.method == 'POST':
        department_id = request.POST.get('department')
        if department_id:
            department = get_object_or_404(Department, id=department_id)
            old_dept = profile.department.name if profile.department else None
            profile.department = department
            profile.save()
            log_audit(
                request.user,
                'assign_department',
                'UserProfile',
                profile.id,
                old_dept,
                department.name
            )
            messages.success(request, f'{user.username} assigned to {department.name}.')
        else:
            # Clear department
            old_dept = profile.department.name if profile.department else None
            profile.department = None
            profile.save()
            log_audit(
                request.user,
                'clear_department',
                'UserProfile',
                profile.id,
                old_dept,
                None
            )
            messages.info(request, f'{user.username} department cleared.')
        return redirect('core:userprofile_list')

    departments = Department.objects.all().order_by('name')
    return render(request, 'departments/assign_user.html', {
        'target_user': user,
        'profile': profile,
        'departments': departments,
        'current_dept': profile.department
    })
    
    
    
    
@login_required
@role_required(['SuperAdmin'])
def bulk_assign_department(request):
    """Assign a department to multiple selected users."""
    if request.method == 'POST':
        user_ids = request.POST.getlist('user_ids')
        department_id = request.POST.get('department')
        if not user_ids:
            messages.error(request, 'No users selected.')
            return redirect('core:bulk_assign_department')
        if not department_id:
            messages.error(request, 'No department selected.')
            return redirect('core:bulk_assign_department')

        department = get_object_or_404(Department, id=department_id)
        updated_count = 0
        for uid in user_ids:
            user = get_object_or_404(User, id=uid)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if profile.department != department:
                old = profile.department.name if profile.department else None
                profile.department = department
                profile.save()
                log_audit(
                    request.user,
                    'bulk_assign_department',
                    'UserProfile',
                    profile.id,
                    old,
                    department.name
                )
                updated_count += 1
        messages.success(request, f'Assigned {updated_count} users to {department.name}.')
        return redirect('core:userprofile_list')

    users = User.objects.exclude(id=request.user.id).select_related('userprofile')
    departments = Department.objects.all().order_by('name')
    return render(request, 'departments/bulk_assign.html', {
        'users': users,
        'departments': departments
    })        
    
    
    
# =========================================================
# CATEGORY MANAGEMENT (SUPERADMIN ONLY)
# =========================================================
from .models import Category, Asset
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from .utils import log_audit, get_user_role

class CategoryListView(LoginRequiredMixin, ListView):
    model = Category
    template_name = 'categories/list.html'
    context_object_name = 'categories'
    paginate_by = 20

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Category.objects.all().order_by('name')


class CategoryCreateView(LoginRequiredMixin, CreateView):
    model = Category
    fields = ['name', 'description']
    template_name = 'categories/form.html'
    success_url = reverse_lazy('core:category_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        category = form.save(commit=False)
        category.is_default = False  # new categories are never system defaults
        category.save()
        log_audit(
            self.request.user,
            'create_category',
            'Category',
            category.id,
            None,
            f"Name: {category.name}"
        )
        messages.success(self.request, f'Category "{category.name}" created.')
        return super().form_valid(form)


class CategoryUpdateView(LoginRequiredMixin, UpdateView):
    model = Category
    fields = ['name', 'description']
    template_name = 'categories/form.html'
    success_url = reverse_lazy('core:category_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        
        category = self.get_object()
        # Prevent editing of system‑default categories
        if category.is_default:
            messages.error(request, f'"{category.name}" is a system‑default category and cannot be edited.')
            return redirect('core:category_list')
        
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        old_name = self.get_object().name
        category = form.save()
        log_audit(
            self.request.user,
            'update_category',
            'Category',
            category.id,
            old_name,
            category.name
        )
        messages.success(self.request, f'Category updated to "{category.name}".')
        return super().form_valid(form)


class CategoryDeleteView(LoginRequiredMixin, DeleteView):
    model = Category
    template_name = 'categories/confirm_delete.html'
    success_url = reverse_lazy('core:category_list')

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser and get_user_role(request.user) != 'SuperAdmin':
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        category = self.get_object()
        
        # Prevent deletion of system‑default categories
        if category.is_default:
            messages.error(request, f'Cannot delete "{category.name}" – it is a system‑default category.')
            return redirect('core:category_list')
        
        #  Prevent deletion if assets are still assigned
        if Asset.objects.filter(category=category).exists():
            messages.error(request, f'Cannot delete: {category.name} is still used by assets.')
            return redirect('core:category_list')
            
        log_audit(request.user, 'delete_category', 'Category', category.id, category.name, None)
        return super().post(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Category deleted.')
        return super().delete(request, *args, **kwargs)


def spa_entry_view(request, *args, **kwargs):
    """
    Catch-all view to render the main React single page application.
    """
    return render(request, 'react_spa.html')
    