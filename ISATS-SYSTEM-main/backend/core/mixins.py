# core/mixins.py
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden

class AllRolesRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to be logged in (allows all roles).
    """
    pass  # Essentially just LoginRequiredMixin

class ICTOfficerRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to have 'ICT Officer' or 'ICTS Officer' role.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        role_name = request.user.role.name if request.user.role else ''
        if role_name not in ['ICT Officer', 'ICTS Officer']:
            return HttpResponseForbidden("You do not have permission to access this page.")
        return super().dispatch(request, *args, **kwargs)

class TechnicianRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to have 'Technician' role.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        role_name = request.user.role.name if request.user.role else ''
        if role_name != 'Technician':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return super().dispatch(request, *args, **kwargs)

class ManagementRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to have 'Management' role.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        role_name = request.user.role.name if request.user.role else ''
        if role_name != 'Management':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return super().dispatch(request, *args, **kwargs)

class AuditorRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to have 'Auditor' role.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        role_name = request.user.role.name if request.user.role else ''
        if role_name != 'Auditor':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return super().dispatch(request, *args, **kwargs)

class AdminRequiredMixin(LoginRequiredMixin):
    """
    Mixin that requires the user to have 'Admin' role.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        role_name = request.user.role.name if request.user.role else ''
        if role_name != 'Admin':
            return HttpResponseForbidden("You do not have permission to access this page.")
        return super().dispatch(request, *args, **kwargs)