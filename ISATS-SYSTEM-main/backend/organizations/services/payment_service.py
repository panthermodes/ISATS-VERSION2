import uuid
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from organizations.models import (
    Organization, Subscription, Invoice, PaymentTransaction
)
from organizations.services.billing_service import BillingService
from organizations.services.subscription_service import SubscriptionService


class PaymentProviderBase:
    code = 'GENERIC'
    name = 'Generic Provider'

    @classmethod
    def initiate(cls, transaction_obj: PaymentTransaction, payment_details: dict) -> dict:
        raise NotImplementedError

    @classmethod
    def verify(cls, transaction_obj: PaymentTransaction) -> bool:
        raise NotImplementedError


class MPesaPaymentProvider(PaymentProviderBase):
    code = 'MPESA'
    name = 'M-Pesa (Vodacom Tanzania)'

    @classmethod
    def initiate(cls, transaction_obj: PaymentTransaction, payment_details: dict) -> dict:
        phone = payment_details.get('phone', '')
        # Simulated USSD Push prompt dispatched to customer phone
        return {
            'status': 'PUSH_SENT',
            'message': f"M-Pesa payment prompt sent to {phone}. Please enter your M-Pesa PIN on your phone.",
            'reference': transaction_obj.transaction_reference,
            'provider': cls.code
        }

    @classmethod
    def verify(cls, transaction_obj: PaymentTransaction) -> bool:
        return True


class TigoPesaPaymentProvider(PaymentProviderBase):
    code = 'TIGO_PESA'
    name = 'Tigo Pesa (Mixx by Yas)'

    @classmethod
    def initiate(cls, transaction_obj: PaymentTransaction, payment_details: dict) -> dict:
        phone = payment_details.get('phone', '')
        return {
            'status': 'PUSH_SENT',
            'message': f"Tigo Pesa payment prompt sent to {phone}. Please approve the transaction.",
            'reference': transaction_obj.transaction_reference,
            'provider': cls.code
        }

    @classmethod
    def verify(cls, transaction_obj: PaymentTransaction) -> bool:
        return True


class BankTransferProvider(PaymentProviderBase):
    code = 'BANK_TRANSFER'
    name = 'Bank Transfer (CRDB / NMB)'

    @classmethod
    def initiate(cls, transaction_obj: PaymentTransaction, payment_details: dict) -> dict:
        return {
            'status': 'AWAITING_TRANSFER',
            'message': "Please transfer the exact amount to ISATS PantherMode Account (CRDB 0150992388100 / NMB 20110098231) referencing your payment reference.",
            'reference': transaction_obj.transaction_reference,
            'provider': cls.code,
            'account_details': {
                'bank_name': 'CRDB Bank Plc',
                'account_name': 'PantherMode ISATS Platform Ltd',
                'account_number': '0150992388100',
                'currency': 'TZS',
                'swift_code': 'CORUTZTZ'
            }
        }

    @classmethod
    def verify(cls, transaction_obj: PaymentTransaction) -> bool:
        return True


PROVIDERS = {
    'MPESA': MPesaPaymentProvider,
    'TIGO_PESA': TigoPesaPaymentProvider,
    'AIRTEL_MONEY': MPesaPaymentProvider,
    'HALOPESA': MPesaPaymentProvider,
    'BANK_TRANSFER': BankTransferProvider,
    'CARD': MPesaPaymentProvider,
    'MANUAL': BankTransferProvider,
}


class PaymentService:
    @staticmethod
    def generate_reference(prefix: str = 'PAY') -> str:
        return f"{prefix}-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

    @classmethod
    def initiate_subscription_payment(
        cls,
        organization: Organization,
        provider_code: str = 'MPESA',
        payment_details: dict = None
    ) -> dict:
        """
        Initiates a payment transaction for an organization's subscription.
        Creates an invoice if none exists, records the transaction, and contacts the provider adapter.
        """
        payment_details = payment_details or {}
        invoice = Invoice.objects.filter(
            organization=organization,
            status='PENDING'
        ).first()

        if not invoice:
            invoice = BillingService.create_subscription_invoice(organization)

        provider_cls = PROVIDERS.get(provider_code, MPesaPaymentProvider)
        ref = cls.generate_reference()

        txn = PaymentTransaction.objects.create(
            organization=organization,
            subscription=getattr(organization, 'subscription', None),
            invoice=invoice,
            transaction_reference=ref,
            provider=provider_code,
            amount=invoice.total_amount,
            currency=invoice.currency,
            status='PENDING',
            payment_method=provider_code,
            raw_metadata=payment_details
        )

        init_result = provider_cls.initiate(txn, payment_details)

        return {
            'transaction_id': str(txn.id),
            'reference': txn.transaction_reference,
            'amount': float(txn.amount),
            'currency': txn.currency,
            'status': txn.status,
            'provider': txn.provider,
            'invoice_number': invoice.invoice_number,
            'provider_response': init_result,
        }

    @classmethod
    def process_webhook(
        cls,
        provider_code: str,
        transaction_reference: str,
        provider_transaction_id: str,
        status: str,
        payload: dict
    ) -> dict:
        """
        Idempotent webhook processor. Ensures duplicate webhooks do not double-activate or double-charge.
        """
        with transaction.atomic():
            txn = PaymentTransaction.objects.select_for_update().filter(
                transaction_reference=transaction_reference
            ).first()

            if not txn:
                # Fallback to provider_transaction_id lookup
                txn = PaymentTransaction.objects.select_for_update().filter(
                    provider_transaction_id=provider_transaction_id
                ).first()

            if not txn:
                return {'success': False, 'error': 'TRANSACTION_NOT_FOUND'}

            # If already processed, return idempotent success
            if txn.status == 'COMPLETED':
                return {
                    'success': True,
                    'message': 'Transaction was already completed (Idempotent replay)',
                    'transaction_id': str(txn.id)
                }

            txn.provider_transaction_id = provider_transaction_id
            txn.raw_metadata.update({'webhook_payload': payload})

            if status in ['SUCCESS', 'COMPLETED', 'PAID']:
                txn.status = 'COMPLETED'
                txn.completed_at = timezone.now()
                txn.save()

                if txn.invoice:
                    BillingService.mark_invoice_paid(txn.invoice, txn)
                else:
                    SubscriptionService.activate_subscription(txn.organization)

                return {
                    'success': True,
                    'message': 'Payment completed and subscription activated successfully',
                    'transaction_id': str(txn.id),
                    'organization_status': txn.organization.status
                }
            else:
                txn.status = 'FAILED'
                txn.failure_reason = payload.get('failure_reason', 'Payment failed at provider')
                txn.save()
                return {'success': False, 'message': 'Payment marked failed'}

    @classmethod
    def manual_confirm_payment(cls, transaction_id: str, verified_by_user) -> dict:
        """
        PantherMode Platform Admin manual approval for Bank Transfers & cash settlements.
        """
        with transaction.atomic():
            txn = PaymentTransaction.objects.select_for_update().get(id=transaction_id)
            if txn.status == 'COMPLETED':
                return {'success': True, 'message': 'Already completed'}

            txn.status = 'COMPLETED'
            txn.completed_at = timezone.now()
            txn.provider_transaction_id = f"MANUAL-{verified_by_user.username}-{timezone.now().strftime('%Y%m%d%H%M')}"
            txn.save()

            if txn.invoice:
                BillingService.mark_invoice_paid(txn.invoice, txn)
            else:
                SubscriptionService.activate_subscription(txn.organization)

            return {'success': True, 'message': 'Manual verification recorded and subscription activated'}
