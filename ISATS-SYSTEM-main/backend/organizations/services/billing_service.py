import uuid
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from django.db import transaction
from organizations.models import Organization, Subscription, Invoice
from organizations.services.subscription_service import SubscriptionService


class BillingService:
    @staticmethod
    def generate_invoice_number(organization: Organization) -> str:
        prefix = f"INV-{timezone.now().strftime('%Y%m')}"
        random_suffix = uuid.uuid4().hex[:6].upper()
        return f"{prefix}-{organization.organization_code[:4].upper()}-{random_suffix}"

    @classmethod
    def create_subscription_invoice(cls, organization: Organization, subscription: Subscription = None) -> Invoice:
        """
        Creates a formal invoice using the 250-user billing engine.
        """
        if not subscription:
            subscription = getattr(organization, 'subscription', None)

        breakdown = SubscriptionService.calculate_billing_breakdown(organization, subscription.plan if subscription else None)
        
        today = timezone.now().date()
        period_end = today + timedelta(days=30)
        due_date = today + timedelta(days=7)

        invoice_number = cls.generate_invoice_number(organization)

        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            organization=organization,
            subscription=subscription,
            billing_period_start=today,
            billing_period_end=period_end,
            base_price=Decimal(str(breakdown['base_price'])),
            included_users=breakdown['included_users'],
            active_users=breakdown['active_users'],
            additional_users=breakdown['additional_users'],
            additional_user_rate=Decimal(str(breakdown['additional_user_rate'])),
            additional_charges=Decimal(str(breakdown['additional_charges'])),
            subtotal=Decimal(str(breakdown['subtotal'])),
            tax_amount=Decimal(str(breakdown['tax_amount'])),
            total_amount=Decimal(str(breakdown['total_amount'])),
            currency=breakdown['currency'],
            status='PENDING',
            due_date=due_date,
        )

        return invoice

    @classmethod
    def mark_invoice_paid(cls, invoice: Invoice, payment_transaction=None) -> Invoice:
        """
        Marks an invoice as PAID, activates/renews the subscription in a single atomic transaction.
        """
        with transaction.atomic():
            invoice.status = 'PAID'
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=['status', 'paid_at'])

            # Automatically renew or activate organization subscription
            SubscriptionService.activate_subscription(
                organization=invoice.organization,
                plan=invoice.subscription.plan if invoice.subscription else None
            )

        return invoice
