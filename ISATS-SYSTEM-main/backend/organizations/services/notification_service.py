from django.utils import timezone
from core.models import UserNotification, ICTNotification
from django.contrib.auth.models import User


class NotificationService:
    @staticmethod
    def send_user_notification(user: User, message: str) -> UserNotification:
        return UserNotification.objects.create(
            user=user,
            message=message,
            is_read=False,
            created_at=timezone.now()
        )

    @staticmethod
    def broadcast_ict_notification(message: str, specific_user: User = None):
        if specific_user:
            return ICTNotification.objects.create(
                user=specific_user,
                message=message,
                is_read=False,
                created_at=timezone.now()
            )
        else:
            # Broadcast to all ICT staff / Admins
            officers = User.objects.filter(userprofile__role__in=['ICT Officer', 'Manager', 'Admin', 'SuperAdmin'])
            for officer in officers:
                ICTNotification.objects.create(
                    user=officer,
                    message=message,
                    is_read=False,
                    created_at=timezone.now()
                )
