from django.utils import timezone
from core.models import Asset, Ticket, MaintenanceLog, UserProfile
from django.db.models import Count, Q


class ReportService:
    @classmethod
    def generate_asset_summary(cls) -> dict:
        total = Asset.objects.filter(is_deleted=False).count()
        by_status = list(Asset.objects.filter(is_deleted=False).values('status').annotate(count=Count('asset_id')))
        by_dept = list(Asset.objects.filter(is_deleted=False, department__isnull=False).values('department__name').annotate(count=Count('asset_id')))

        return {
            'total_assets': total,
            'status_breakdown': by_status,
            'department_distribution': by_dept,
            'generated_at': timezone.now().isoformat()
        }

    @classmethod
    def generate_ticket_sla_summary(cls) -> dict:
        total = Ticket.objects.count()
        open_count = Ticket.objects.filter(status='Open').count()
        in_progress = Ticket.objects.filter(status='In Progress').count()
        resolved = Ticket.objects.filter(status='Resolved').count()
        closed = Ticket.objects.filter(status='Closed').count()
        by_priority = list(Ticket.objects.values('priority').annotate(count=Count('id')))

        return {
            'total_tickets': total,
            'open': open_count,
            'in_progress': in_progress,
            'resolved': resolved,
            'closed': closed,
            'priority_breakdown': by_priority,
            'generated_at': timezone.now().isoformat()
        }
