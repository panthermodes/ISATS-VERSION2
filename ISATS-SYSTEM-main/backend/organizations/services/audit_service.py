from django.utils import timezone
from core.models import AuditLog


class AuditService:
    @staticmethod
    def log_event(
        user=None,
        action: str = '',
        model_name: str = '',
        object_id: int = None,
        old_value: str = '',
        new_value: str = '',
        ip_address: str = '',
        details: str = None
    ) -> AuditLog:
        """
        Creates an audit trail record for sensitive security or SaaS administration events.
        """
        return AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=object_id,
            old_value=str(old_value) if old_value else '',
            new_value=str(new_value) if new_value else '',
            ip_address=ip_address or '',
            details=details,
            timestamp=timezone.now()
        )

    log_action = log_event
