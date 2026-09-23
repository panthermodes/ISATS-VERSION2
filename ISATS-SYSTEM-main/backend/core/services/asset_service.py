import uuid
from django.utils import timezone
from django.db import transaction
from core.models import Asset, UserAssetHistory, AssetMovement, MaintenanceLog, Department, Category
from django.contrib.auth.models import User
from organizations.services.audit_service import AuditService


class AssetService:
    @classmethod
    def register_asset(cls, creator_user: User, asset_data: dict) -> Asset:
        asset_tag = asset_data.get('asset_tag') or f"AST-{uuid.uuid4().hex[:6].upper()}"
        serial_num = asset_data.get('serial_number') or f"SN-{uuid.uuid4().hex[:8].upper()}"

        dept = None
        if asset_data.get('department_id'):
            dept = Department.objects.filter(id=asset_data['department_id']).first()

        cat = None
        if asset_data.get('category_id'):
            cat = Category.objects.filter(id=asset_data['category_id']).first()

        asset = Asset.objects.create(
            asset_tag=asset_tag,
            serial_number=serial_num,
            asset_name=asset_data.get('asset_name', 'ICT Asset'),
            asset_type=asset_data.get('asset_type', 'Hardware'),
            category=cat,
            department=dept,
            model=asset_data.get('model', ''),
            manufacturer=asset_data.get('manufacturer', ''),
            status=asset_data.get('status', 'Active'),
            location=asset_data.get('location', 'Headquarters'),
            condition_status=asset_data.get('condition_status', 'Good'),
            priority_level=asset_data.get('priority_level', 'Low'),
        )

        AuditService.log_event(
            user=creator_user,
            action='CREATE_ASSET',
            model_name='Asset',
            object_id=0,
            details=f"Registered asset {asset.asset_tag} ({asset.asset_name})"
        )
        return asset

    @classmethod
    def assign_asset_to_user(cls, asset: Asset, target_user: User, assigned_by: User, notes: str = '') -> UserAssetHistory:
        with transaction.atomic():
            old_assigned = asset.assigned_to
            asset.assigned_to = target_user
            asset.save(update_fields=['assigned_to'])

            history = UserAssetHistory.objects.create(
                user=target_user,
                asset=asset,
                action='Assigned',
                notes=notes,
                timestamp=timezone.now(),
                acknowledged_policy=False
            )

            AuditService.log_event(
                user=assigned_by,
                action='ASSIGN_ASSET',
                model_name='Asset',
                object_id=0,
                old_value=old_assigned.username if old_assigned else 'Unassigned',
                new_value=target_user.username,
                details=f"Assigned asset {asset.asset_tag} to {target_user.username}"
            )
            return history

    @classmethod
    def log_maintenance(cls, asset: Asset, performed_by: User, maintenance_type: str, notes: str) -> MaintenanceLog:
        log = MaintenanceLog.objects.create(
            asset=asset,
            performed_by=performed_by,
            maintenance_type=maintenance_type,
            date=timezone.now().date(),
            notes=notes
        )
        asset.last_maintenance_date = timezone.now().date()
        asset.save(update_fields=['last_maintenance_date'])

        AuditService.log_event(
            user=performed_by,
            action='MAINTENANCE_LOG',
            model_name='Asset',
            object_id=0,
            details=f"Recorded {maintenance_type} maintenance on asset {asset.asset_tag}"
        )
        return log
