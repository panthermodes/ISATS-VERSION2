from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from organizations.models import Subscription, Invoice
from organizations.services.billing_service import BillingService
from organizations.services.subscription_service import SubscriptionService

class Command(BaseCommand):
    help = 'Processes recurring billing and generates monthly renewal invoices for subscriptions approaching renewal.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Checking subscriptions due for monthly renewal...'))

        now = timezone.now()
        renewal_window = now + timedelta(days=3)

        # Find active subscriptions expiring within 3 days
        subs_due = Subscription.objects.filter(
            status='ACTIVE',
            auto_renew=True,
            current_period_end__lte=renewal_window
        )

        invoices_generated = 0
        for sub in subs_due:
            # Check if pending invoice already generated for this period
            existing_invoice = Invoice.objects.filter(
                organization=sub.organization,
                status='PENDING',
                created_at__gte=now - timedelta(days=7)
            ).exists()

            if not existing_invoice:
                invoice = BillingService.create_subscription_invoice(sub.organization)
                invoices_generated += 1
                self.stdout.write(self.style.SUCCESS(
                    f"[OK] Generated renewal invoice {invoice.invoice_number} for {sub.organization.name} - TZS {invoice.total_amount:,.0f}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"Recurring billing cycle finished. Generated {invoices_generated} new invoices."
        ))
