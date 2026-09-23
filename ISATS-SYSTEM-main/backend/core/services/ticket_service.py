from django.utils import timezone
from django.db import transaction
from core.models import Ticket, Asset, UserProfile
from django.contrib.auth.models import User
from organizations.services.audit_service import AuditService
from organizations.services.notification_service import NotificationService


class TicketService:
    @classmethod
    def create_ticket(cls, user: User, description: str, priority: str = 'Medium', asset: Asset = None, image = None) -> Ticket:
        ticket = Ticket.objects.create(
            user=user,
            asset=asset,
            priority=priority,
            description=description,
            image=image,
            status='Open',
            created_at=timezone.now()
        )
        AuditService.log_event(
            user=user,
            action='CREATE_TICKET',
            model_name='Ticket',
            object_id=ticket.id,
            details=f"Created ticket {ticket.id} ({priority}) for asset {asset.asset_tag if asset else 'N/A'}"
        )
        NotificationService.broadcast_ict_notification(
            message=f"New {priority} incident ticket #{ticket.id} opened by {user.username}."
        )
        return ticket

    @classmethod
    def assign_ticket(cls, ticket_id: int, assigned_to_user: User, assigned_by_user: User) -> Ticket:
        with transaction.atomic():
            ticket = Ticket.objects.select_for_update().get(id=ticket_id)
            old_assignee = ticket.assigned_to.username if ticket.assigned_to else 'Unassigned'
            ticket.assigned_to = assigned_to_user
            if ticket.status == 'Open':
                ticket.status = 'In Progress'
            ticket.save()

            AuditService.log_event(
                user=assigned_by_user,
                action='ASSIGN_TICKET',
                model_name='Ticket',
                object_id=ticket.id,
                old_value=old_assignee,
                new_value=assigned_to_user.username,
                details=f"Assigned ticket #{ticket.id} to {assigned_to_user.username}"
            )
            NotificationService.send_user_notification(
                user=assigned_to_user,
                message=f"Ticket #{ticket.id} has been assigned to you."
            )
        return ticket

    @classmethod
    def resolve_and_close_ticket(cls, ticket_id: int, closed_by_user: User, resolution_notes: str = '') -> Ticket:
        with transaction.atomic():
            ticket = Ticket.objects.select_for_update().get(id=ticket_id)
            ticket.status = 'Closed'
            ticket.closed_at = timezone.now()
            ticket.save()

            AuditService.log_event(
                user=closed_by_user,
                action='CLOSE_TICKET',
                model_name='Ticket',
                object_id=ticket.id,
                details=f"Ticket #{ticket.id} closed. Notes: {resolution_notes}"
            )
            NotificationService.send_user_notification(
                user=ticket.user,
                message=f"Your ticket #{ticket.id} has been resolved and closed."
            )
        return ticket
