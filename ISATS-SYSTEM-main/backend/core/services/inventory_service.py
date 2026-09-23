from core.models import InventoryItem, ProcurementRequest
from django.contrib.auth.models import User
from organizations.services.audit_service import AuditService


class InventoryService:
    @classmethod
    def adjust_stock(cls, item_id: int, quantity_delta: int, adjusted_by: User, reason: str = '') -> InventoryItem:
        item = InventoryItem.objects.get(id=item_id)
        old_qty = item.quantity
        item.quantity = max(0, item.quantity + quantity_delta)
        item.save(update_fields=['quantity'])

        AuditService.log_event(
            user=adjusted_by,
            action='INVENTORY_ADJUSTMENT',
            model_name='InventoryItem',
            object_id=item.id,
            old_value=str(old_qty),
            new_value=str(item.quantity),
            details=f"Stock adjusted by {quantity_delta}. Reason: {reason}"
        )
        return item

    @classmethod
    def request_procurement(cls, item: InventoryItem, quantity: int, requested_by: User) -> ProcurementRequest:
        req = ProcurementRequest.objects.create(
            item=item,
            quantity=quantity,
            requested_by=requested_by,
            status='Pending'
        )
        AuditService.log_event(
            user=requested_by,
            action='PROCUREMENT_REQUEST',
            model_name='ProcurementRequest',
            object_id=req.id,
            details=f"Requested {quantity} units of {item.name}"
        )
        return req
