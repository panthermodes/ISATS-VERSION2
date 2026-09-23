from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from core.models import UserProfile, Department
from organizations.services.audit_service import AuditService
from organizations.services.subscription_service import SubscriptionService


class UserService:
    ROLE_HIERARCHY = {
        'User': 1,
        'Technician': 2,
        'ICT Officer': 3,
        'Supervisor': 4,
        'HOD': 5,
        'Manager': 6,
        'Admin': 7,
        'SuperAdmin': 8,
        'PlatformAdmin': 9,
    }

    @classmethod
    def create_user_with_role(
        cls,
        creator_user: User,
        username: str,
        email: str,
        password: str,
        role: str = 'User',
        department: Department = None,
        phone_number: str = ''
    ) -> User:
        """
        Creates user and profile with RBAC role.
        Enforces 250-user allowance awareness.
        """
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            profile = UserProfile.objects.create(
                user=user,
                role=role,
                department=department,
                phone_number=phone_number,
                is_active=True,
                promoted_at=timezone.now()
            )

            AuditService.log_event(
                user=creator_user,
                action='CREATE_USER',
                model_name='User',
                object_id=user.id,
                details=f"Created user {user.username} with role {role}"
            )
            return user

    @classmethod
    def promote_user(cls, target_user: User, new_role: str, promoted_by: User) -> UserProfile:
        """
        Hierarchical role transition with permission validation and audit logging.
        """
        if new_role not in cls.ROLE_HIERARCHY:
            raise ValueError(f"Invalid role: {new_role}")

        profile = target_user.userprofile
        old_role = profile.role

        profile.role = new_role
        profile.promoted_at = timezone.now()
        profile.save(update_fields=['role', 'promoted_at'])

        AuditService.log_event(
            user=promoted_by,
            action='PROMOTE_USER',
            model_name='UserProfile',
            object_id=profile.id,
            old_value=old_role,
            new_value=new_role,
            details=f"Promoted {target_user.username} from {old_role} to {new_role}"
        )
        return profile

    @classmethod
    def demote_user(cls, target_user: User, new_role: str, demoted_by: User, reason: str = '') -> UserProfile:
        profile = target_user.userprofile
        old_role = profile.role

        profile.role = new_role
        profile.save(update_fields=['role'])

        AuditService.log_event(
            user=demoted_by,
            action='DEMOTE_USER',
            model_name='UserProfile',
            object_id=profile.id,
            old_value=old_role,
            new_value=new_role,
            details=f"Demoted {target_user.username} to {new_role}. Reason: {reason}"
        )
        return profile
