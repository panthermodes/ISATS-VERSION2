import json
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from organizations.models import (
    Organization, SubscriptionPlan, Subscription, OrganizationRegistration,
    Invoice, PaymentTransaction
)
from organizations.services.subscription_service import SubscriptionService
from organizations.services.organization_service import OrganizationService
from organizations.services.payment_service import PaymentService
from core.models import Asset, Department, UserProfile
from django.contrib.auth.models import User

class SaasEngineTests(TestCase):
    def setUp(self):
        self.plan = SubscriptionPlan.objects.create(
            name="Standard Enterprise Plan",
            slug="standard-100k",
            monthly_base_price=Decimal("100000.00"),
            included_users=250,
            additional_user_monthly_price=Decimal("500.00"),
            is_active=True,
            is_default=True
        )
        self.org_a = Organization.objects.create(
            name="Alpha Corp LTD",
            legal_name="Alpha Corp LTD",
            organization_code="ALPHA01",
            slug="alpha-corp-ltd",
            country="Tanzania",
            status="ACTIVE"
        )
        self.org_b = Organization.objects.create(
            name="Beta Logistics LTD",
            legal_name="Beta Logistics LTD",
            organization_code="BETA01",
            slug="beta-logistics-ltd",
            country="Tanzania",
            status="ACTIVE"
        )
        self.sub_a = Subscription.objects.create(
            organization=self.org_a,
            plan=self.plan,
            status="ACTIVE",
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timezone.timedelta(days=30)
        )

    def test_250_included_users_billing_calculation(self):
        """Verify billing breakdown calculation for active user thresholds."""
        # Case 1: 150 active users (below 250 limit)
        b1 = SubscriptionService.calculate_billing_breakdown(self.org_a, active_users_override=150)
        self.assertEqual(b1["included_users"], 250)
        self.assertEqual(b1["additional_users"], 0)
        self.assertEqual(float(b1["base_price"]), 100000.0)
        self.assertEqual(float(b1["total_amount"]), 100000.0)

        # Case 2: 250 active users (exact limit)
        b2 = SubscriptionService.calculate_billing_breakdown(self.org_a, active_users_override=250)
        self.assertEqual(b2["additional_users"], 0)
        self.assertEqual(float(b2["total_amount"]), 100000.0)

        # Case 3: 260 active users (10 over limit at 500 TZS each)
        b3 = SubscriptionService.calculate_billing_breakdown(self.org_a, active_users_override=260)
        self.assertEqual(b3["additional_users"], 10)
        self.assertEqual(float(b3["total_amount"]), 105000.0)

    def test_progressive_onboarding_draft_persistence(self):
        """Verify step-by-step onboarding persistence without premature provisioning."""
        step1_data = {
            "legal_name": "Acme Tanzania Corp",
            "org_code": "ATC",
            "industry": "LOGISTICS",
            "country": "Tanzania"
        }
        res1 = OrganizationService.save_registration_step(
            step=1,
            step_payload=step1_data
        )
        ref = res1.get("registration_reference")
        self.assertIsNotNone(ref)

        reg = OrganizationRegistration.objects.get(registration_reference=ref)
        self.assertEqual(reg.current_step, 1)
        self.assertEqual(reg.step_data["step_1"]["legal_name"], "Acme Tanzania Corp")

        # Resume draft
        resumed = OrganizationService.get_registration_draft(ref)
        self.assertTrue(resumed.get("found"))
        self.assertEqual(resumed["step_data"]["step_1"]["org_code"], "ATC")

    def test_payment_initiation_and_webhook_activation(self):
        """Verify M-Pesa payment initiation and automated invoice fulfillment via webhook."""
        # 1. Initiate Payment
        init_res = PaymentService.initiate_subscription_payment(
            organization=self.org_a,
            provider_code='MPESA',
            payment_details={'phone': '+255754112233'}
        )
        self.assertEqual(init_res["status"], "PENDING")
        ref = init_res["reference"]

        # 2. Receive Idempotent Provider Webhook
        webhook_res = PaymentService.process_webhook(
            provider_code='MPESA',
            transaction_reference=ref,
            provider_transaction_id='MPESA-CONFIRM-99881',
            status='SUCCESS',
            payload={'result_code': 0, 'mpesa_receipt': 'LKS88912'}
        )
        self.assertTrue(webhook_res["success"])

        # Check invoice and transaction in DB
        invoice = Invoice.objects.get(invoice_number=init_res["invoice_number"])
        self.assertEqual(invoice.status, "PAID")
        self.assertIsNotNone(invoice.paid_at)

        txn = PaymentTransaction.objects.get(transaction_reference=ref)
        self.assertEqual(txn.status, "COMPLETED")
        self.assertEqual(txn.provider_transaction_id, "MPESA-CONFIRM-99881")

    def test_tenant_isolation_integrity(self):
        """Verify that records between Organization A and Organization B remain isolated."""
        dept_a = Department.objects.create(name="Alpha Finance")
        dept_b = Department.objects.create(name="Beta Operations")

        asset_a = Asset.objects.create(
            asset_tag="AST-ALPHA-01",
            serial_number="SN-ALP-001",
            asset_name="Alpha Laptop",
            department=dept_a,
            status="Active"
        )
        asset_b = Asset.objects.create(
            asset_tag="AST-BETA-01",
            serial_number="SN-BET-001",
            asset_name="Beta Server",
            department=dept_b,
            status="Active"
        )

        self.assertNotEqual(asset_a.asset_tag, asset_b.asset_tag)
        self.assertNotEqual(asset_a.department.name, asset_b.department.name)
        self.assertEqual(Asset.objects.filter(department=dept_a).count(), 1)
        self.assertEqual(Asset.objects.filter(department=dept_b).count(), 1)
