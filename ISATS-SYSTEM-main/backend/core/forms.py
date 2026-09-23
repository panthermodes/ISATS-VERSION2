from django import forms
from django.forms import modelform_factory
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import (
    Department, Category, UserProfile, RolePermission, LoginAttempt,
    Asset, AssetRequest, AssetMovement, AssetUsageLog,
    PredictiveMaintenanceProfile, MaintenanceLog, PredictiveAlert,
    Ticket, InventoryItem, ProcurementRequest,
    TemporaryAccessRequest, AssetTransferRequest, UserAssetHistory,
    SystemSetting, UserNotification, ICTNotification, PhoneOTP
)


# =========================================================
# ASSET MOVEMENT FORMS
# =========================================================
class AssetMovementForm(forms.ModelForm):
    class Meta:
        model = AssetMovement
        fields = ['asset', 'to_location', 'notes']


# =========================================================
# ASSET USAGE LOG FORM
# =========================================================
class AssetUsageLogForm(forms.ModelForm):
    class Meta:
        model = AssetUsageLog
        fields = ['asset', 'activity_type', 'duration_minutes']


# =========================================================
# MAINTENANCE LOG FORM
# =========================================================
class MaintenanceLogForm(forms.ModelForm):
    class Meta:
        model = MaintenanceLog
        fields = ['asset', 'maintenance_type', 'notes']


# =========================================================
# PREDICTIVE MAINTENANCE ALERT FORM
# (Usually handled in views; no explicit input needed)
# =========================================================


# =========================================================
# TICKETING SYSTEM FORMS
# =========================================================
class TicketCreateForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ['asset', 'priority', 'description', 'image']

class TicketUpdateForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ['priority', 'description']

class TicketAssignForm(forms.Form):
    officer_id = forms.IntegerField()


# =========================================================
# INVENTORY FORMS
# =========================================================
class InventoryItemForm(forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = ['name', 'quantity', 'reorder_level']

class InventoryItemUpdateForm(forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = ['quantity', 'reorder_level']


# =========================================================
# PROCUREMENT FORMS
# =========================================================
class ProcurementRequestForm(forms.ModelForm):
    class Meta:
        model = ProcurementRequest
        fields = ['item', 'quantity']


# =========================================================
# TEMPORARY ACCESS FORM
# =========================================================
class TemporaryAccessRequestForm(forms.ModelForm):
    class Meta:
        model = TemporaryAccessRequest
        fields = ['access_type', 'duration', 'reason']


# =========================================================
# ASSET TRANSFER FORM
# =========================================================
class AssetTransferRequestForm(forms.ModelForm):
    class Meta:
        model = AssetTransferRequest
        fields = ['asset', 'to_user', 'reason', 'clearance_confirmation']


# =========================================================
# ASSET RETURN FORM
# =========================================================
class AssetReturnForm(forms.ModelForm):
    class Meta:
        model = Asset
        fields = []


# =========================================================
# USER REGISTRATION AND AUTH FORMS
# =========================================================
class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(max_length=15, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email is already in use.")
        return email

    def clean_phone_number(self):
        phone = self.cleaned_data['phone_number']
        if UserProfile.objects.filter(phone_number=phone).exists():
            raise ValidationError("Phone number is already registered.")
        return phone

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
            UserProfile.objects.create(
                user=user,
                phone_number=self.cleaned_data['phone_number'],
                role='User'
            )
        return user


class UserLoginForm(AuthenticationForm):
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={'autofocus': True, 'placeholder': 'Username'})
    )
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
    )


class PhoneOTPForm(forms.ModelForm):
    otp = forms.CharField(max_length=6, required=True, label="OTP Code")

    class Meta:
        model = PhoneOTP
        fields = ['phone_number', 'otp']

    def clean_otp(self):
        otp = self.cleaned_data['otp']
        if not otp.isdigit() or len(otp) != 6:
            raise ValidationError("Invalid OTP format.")
        return otp


# =========================================================
# SYSTEM SETTINGS FORM
# =========================================================
SystemSettingForm = modelform_factory(SystemSetting, fields=['value'])


# =========================================================
# ROLE PERMISSIONS FORM
# =========================================================
class RolePermissionForm(forms.ModelForm):
    class Meta:
        model = RolePermission
        fields = ['allowed']


# =========================================================
# POLICY ACKNOWLEDGEMENT FORM
# =========================================================
class PolicyAcknowledgeForm(forms.Form):
    acknowledge = forms.BooleanField(required=True)


# =========================================================
# BATCH APPROVAL FORMS
# =========================================================
class BatchApprovalForm(forms.Form):
    request_ids = forms.CharField(widget=forms.HiddenInput())  # comma-separated ids


# =========================================================
# REPORT FILTER FORMS
# (Optional advanced: to filter asset/maintenance/usage reports)
# =========================================================
class DateRangeFilterForm(forms.Form):
    start_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    end_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))


# =========================================================
# NOTIFICATIONS FORM
# (Mark as read)
# =========================================================
class NotificationReadForm(forms.Form):
    notification_id = forms.IntegerField()


# =========================================================
# LOGIN ATTEMPT FILTER FORM
# =========================================================
class LoginAttemptFilterForm(forms.Form):
    username = forms.CharField(required=False)
    ip_address = forms.GenericIPAddressField(required=False)
    from_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    to_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))


from .models import UserProfile
from .utils import get_available_roles_for_promotion  

class RoleChangeForm(forms.Form):
    """
    Form for promoting/demoting a user to a new role.
    Role choices are dynamically filtered based on the requester's role
    and the target user's current role.
    """
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
        # Dynamically populate choices using the helper from utils.py
        all_choices = get_available_roles_for_promotion(requester_role)
        # Exclude the user's current role
        choices = [(code, label) for code, label in all_choices if code != current_role]
        if not choices:
            choices = [('', '--- No promotion options available ---')]
        self.fields['new_role'].choices = choices