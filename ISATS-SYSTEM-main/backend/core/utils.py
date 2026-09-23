# core/utils.py

from django.utils import timezone
from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from .models import LoginAttempt, AuditLog, RolePermission, UserProfile

# =========================
# Login Utilities
# =========================
def get_client_ip(request):
    """
    Returns the client's IP address from the request.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip

def log_login_attempt(user, request=None, success=True):
    """
    Logs a login attempt for a given user.
    """
    ip_address = get_client_ip(request) if request else 'unknown'
    LoginAttempt.objects.create(
        username=user.username if hasattr(user, 'username') else str(user),
        success=success,
        ip_address=ip_address,
        timestamp=timezone.now()
    )


from django.utils import timezone
from django.db.utils import ProgrammingError, OperationalError

from core.models import AuditLog


# =========================
# Audit Logging (SAFE)
# =========================
def log_audit(
    user,
    action,
    model_name='',
    object_id=None,
    old_value='',
    new_value='',
    ip_address='',
    details=None
):
    """
    Safely logs an audit action.
    Will NOT crash if database or table is not ready or if object_id is a UUID.
    """
    try:
        int_obj_id = None
        if object_id is not None:
            if isinstance(object_id, int) or (isinstance(object_id, str) and str(object_id).isdigit()):
                int_obj_id = int(object_id)

        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=str(model_name),
            object_id=int_obj_id,
            old_value=str(old_value),
            new_value=str(new_value),
            ip_address=ip_address,
            details=str(details) if details else (f"Target Object: {object_id}" if object_id and int_obj_id is None else None),
            timestamp=timezone.now()
        )
    except Exception:
        pass


# =========================
# Role-based Permission Utilities
# =========================
def has_permission(user, permission_name):
    """
    Checks if a user has a specific permission.
    """
    if not user.is_authenticated:
        return False
    if hasattr(user, 'userprofile') and user.userprofile.role == 'SuperAdmin':
        return True
    try:
        rp = RolePermission.objects.get(role=user.userprofile.role, permission=permission_name)
        return rp.allowed
    except RolePermission.DoesNotExist:
        return False

def role_required(roles):
    """
    Decorator to restrict view access to specific roles.
    Usage:
        @role_required(['Admin', 'SuperAdmin'])
    """
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if hasattr(request.user, 'userprofile') and request.user.userprofile.role in roles:
                return view_func(request, *args, **kwargs)
            raise PermissionDenied
        return _wrapped_view
    return decorator
from .models import UserProfile

def get_user_role(user):
    """
    Return the role of a user.
    - Django superusers are treated as 'SuperAdmin'.
    - Regular users get role from UserProfile.
    - Returns None if no profile exists.
    """
    if user.is_superuser:
        return 'SuperAdmin'
    try:
        return user.userprofile.role
    except (UserProfile.DoesNotExist, AttributeError):
        return None