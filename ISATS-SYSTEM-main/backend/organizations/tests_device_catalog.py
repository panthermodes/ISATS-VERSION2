import json
from decimal import Decimal
from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth.models import User
from organizations.models import (
    Organization, SubscriptionPlan, Subscription, OrganizationRegistration,
    DeviceCategory, DeviceType, OrganizationDeviceType
)
from organizations.services.device_catalogue_service import DeviceCatalogueService
from organizations.services.organization_service import OrganizationService
from core.models import Asset, Department, UserProfile


class DeviceCatalogAndOnboardingTests(TestCase):
    def setUp(self):
        self.client = Client()

        # Seed standard platform catalog
        DeviceCatalogueService.seed_default_catalogue()

        # Create Organization A & SuperAdmin User A
        self.org_a = Organization.objects.create(
            name="Apex Bank Tanzania",
            legal_name="Apex Bank Tanzania PLC",
            organization_code="APEX01",
            slug="apex-bank-tanzania",
            country="Tanzania",
            status="ACTIVE"
        )
        self.user_a = User.objects.create_user(
            username="admin_apex",
            email="admin@apexbank.co.tz",
            password="Password123!"
        )
        self.profile_a = UserProfile.objects.create(
            user=self.user_a,
            role="Admin",
            organization=self.org_a,
            is_active=True
        )

        # Create Organization B & SuperAdmin User B
        self.org_b = Organization.objects.create(
            name="Kilimanjaro Logistics LTD",
            legal_name="Kilimanjaro Logistics LTD",
            organization_code="KLM01",
            slug="kilimanjaro-logistics-ltd",
            country="Tanzania",
            status="ACTIVE"
        )
        self.user_b = User.objects.create_user(
            username="admin_klm",
            email="admin@klmlogistics.co.tz",
            password="Password123!"
        )
        self.profile_b = UserProfile.objects.create(
            user=self.user_b,
            role="Admin",
            organization=self.org_b,
            is_active=True
        )

        # Create Normal Employee in Org A (Non-Admin / Non-ICT Officer)
        self.emp_a = User.objects.create_user(
            username="teller_apex",
            email="teller@apexbank.co.tz",
            password="Password123!"
        )
        self.emp_profile_a = UserProfile.objects.create(
            user=self.emp_a,
            role="User",
            organization=self.org_a,
            is_active=True
        )

    def test_01_platform_catalog_complete_seeding(self):
        """1. Verify standard platform catalog contains all 12 categories and 80+ types."""
        self.assertGreaterEqual(DeviceCategory.objects.count(), 12)
        self.assertGreaterEqual(DeviceType.objects.count(), 80)

        # Check critical standard categories
        for slug in ['computing', 'networking', 'pos', 'printing', 'security', 'power', 'communication', 'storage']:
            self.assertTrue(DeviceCategory.objects.filter(slug=slug).exists(), f"Category {slug} should exist")

        # Check critical standard device types
        for code in ['LAPTOP', 'DESKTOP', 'ROUTER', 'SWITCH', 'POS_TERMINAL', 'PRINTER_RECEIPT', 'CCTV_CAMERA', 'UPS']:
            self.assertTrue(DeviceType.objects.filter(code=code).exists(), f"Type {code} should exist")

    def test_02_onboarding_step_persistence_and_resume(self):
        """2. Verify progressive auto-saving per step without premature provisioning."""
        step1_payload = {
            "organization_name": "Serengeti Safaris Ltd",
            "legal_name": "Serengeti Safaris Limited",
            "industry": "Tourism",
            "email": "info@serengeti.co.tz",
            "phone": "+255754000111"
        }
        res1 = OrganizationService.save_registration_step(step=1, step_payload=step1_payload)
        ref = res1.get("registration_reference")
        self.assertIsNotNone(ref)

        # Step 5: Devices selection
        step5_payload = {
            "devices": {"LAPTOP": 30, "DESKTOP": 15, "ROUTER": 2},
            "custom_devices": [
                {
                    "name": "Bush Safari VHF Transceiver",
                    "category": "communication",
                    "description": "Long-range off-grid radio transceiver",
                    "default_quantity": 8
                }
            ]
        }
        res5 = OrganizationService.save_registration_step(step=5, step_payload=step5_payload, registration_ref=ref)
        self.assertEqual(res5["current_step"], 5)

        # Resume draft
        resumed = OrganizationService.get_registration_draft(ref)
        self.assertTrue(resumed.get("found"))
        self.assertEqual(resumed["step_data"]["step_1"]["organization_name"], "Serengeti Safaris Ltd")
        self.assertEqual(resumed["step_data"]["step_5"]["devices"]["LAPTOP"], 30)
        self.assertEqual(len(resumed["step_data"]["step_5"]["custom_devices"]), 1)

    def test_03_mandatory_tenant_security_isolation(self):
        """
        CRITICAL MANDATORY TEST (Section 46):
        Verify that Organization A and Organization B custom device types remain 100% isolated.
        Org A must NEVER see Org B's custom devices and vice-versa.
        """
        # Org A creates Custom A Device
        custom_a = DeviceCatalogueService.create_custom_device_type(
            organization=self.org_a,
            data={
                "name": "Custom Banking Safe Terminal",
                "category": "security",
                "description": "High security biometric vault access terminal",
                "default_quantity": 4
            },
            user=self.user_a
        )
        self.assertIsNotNone(custom_a.id)

        # Org B creates Custom B Device
        custom_b = DeviceCatalogueService.create_custom_device_type(
            organization=self.org_b,
            data={
                "name": "Custom Cargo GPS Telemetry Unit",
                "category": "other",
                "description": "Container live tracking satellite unit",
                "default_quantity": 150
            },
            user=self.user_b
        )
        self.assertIsNotNone(custom_b.id)

        # Verify Org A catalogue: sees Custom A, DOES NOT see Custom B
        cat_a = DeviceCatalogueService.get_organization_catalogue(self.org_a)
        cat_a_names = [d['name'] for d in cat_a]
        self.assertIn("Custom Banking Safe Terminal", cat_a_names)
        self.assertNotIn("Custom Cargo GPS Telemetry Unit", cat_a_names)

        # Verify Org B catalogue: sees Custom B, DOES NOT see Custom A
        cat_b = DeviceCatalogueService.get_organization_catalogue(self.org_b)
        cat_b_names = [d['name'] for d in cat_b]
        self.assertIn("Custom Cargo GPS Telemetry Unit", cat_b_names)
        self.assertNotIn("Custom Banking Safe Terminal", cat_b_names)

    def test_04_custom_device_duplicate_validation_per_tenant(self):
        """4. Duplicate names within same org are rejected; same name in different orgs is allowed."""
        DeviceCatalogueService.create_custom_device_type(
            organization=self.org_a,
            data={"name": "Specialized Kiosk", "category": "pos"},
            user=self.user_a
        )

        # Duplicate in Org A should raise ValueError
        with self.assertRaises(ValueError):
            DeviceCatalogueService.create_custom_device_type(
                organization=self.org_a,
                data={"name": "Specialized Kiosk", "category": "pos"},
                user=self.user_a
            )

        # Same name in Org B is permitted because of tenant isolation
        dev_b = DeviceCatalogueService.create_custom_device_type(
            organization=self.org_b,
            data={"name": "Specialized Kiosk", "category": "pos"},
            user=self.user_b
        )
        self.assertIsNotNone(dev_b.id)

    def test_05_organization_device_selections_and_quantities(self):
        """5. Organization selecting standard devices with declared quantities."""
        selections = [
            {"identifier": "LAPTOP", "quantity": 50},
            {"identifier": "ROUTER", "quantity": 6},
            {"identifier": "POS_TERMINAL", "quantity": 100},
        ]
        DeviceCatalogueService.save_organization_device_selections(self.org_a, selections, user=self.user_a)

        cat = DeviceCatalogueService.get_organization_catalogue(self.org_a)
        cat_map = {d['code']: d['declared_quantity'] for d in cat}

        self.assertEqual(cat_map.get('LAPTOP'), 50)
        self.assertEqual(cat_map.get('ROUTER'), 6)
        self.assertEqual(cat_map.get('POS_TERMINAL'), 100)

    def test_06_rbac_normal_user_cannot_create_custom_device(self):
        """6. Normal employee without ICT Officer/Admin role cannot create custom device."""
        self.client.force_login(self.emp_a)
        response = self.client.post(
            '/api/organization/device-types/custom/',
            data=json.dumps({"name": "Unauthorized Terminal", "category": "other"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

    def test_07_asset_registration_with_device_type_and_qr_barcode(self):
        """7. Creating an asset linked to an organization device type automatically generates QR and Barcode."""
        self.client.force_login(self.user_a)

        # 1. Enable Laptop for Org A
        DeviceCatalogueService.save_organization_device_selections(
            self.org_a,
            [{"identifier": "LAPTOP", "quantity": 20}],
            user=self.user_a
        )
        org_dev = OrganizationDeviceType.objects.get(organization=self.org_a, platform_device_type__code="LAPTOP")

        # 2. Register an individual asset
        dept = Department.objects.create(name="Executive Floor")
        response = self.client.post(
            '/api/assets/',
            data=json.dumps({
                "asset_tag": "APEX-LAP-0001",
                "serial_number": "SN-DELL-998811",
                "asset_name": "Dell Latitude 5530",
                "device_type_id": org_dev.id,
                "department": dept.id,
                "manufacturer": "Dell",
                "model": "Latitude 5530",
                "status": "Active"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        res_data = response.json()

        asset = Asset.objects.get(asset_tag="APEX-LAP-0001")
        self.assertEqual(asset.organization, self.org_a)
        self.assertEqual(asset.device_type, org_dev)
        self.assertEqual(asset.asset_type, "Laptop")
        self.assertTrue(asset.qr_code_image.startswith('data:image/png;base64,'))
        self.assertTrue(asset.barcode_image.startswith('data:image/png;base64,'))

    def test_08_reconciliation_declared_vs_registered(self):
        """8. Declared equipment vs individually registered assets calculation."""
        DeviceCatalogueService.save_organization_device_selections(
            self.org_a,
            [{"identifier": "LAPTOP", "quantity": 25}],
            user=self.user_a
        )
        org_dev = OrganizationDeviceType.objects.get(organization=self.org_a, platform_device_type__code="LAPTOP")

        # Register 2 actual laptops
        Asset.objects.create(
            asset_tag="APEX-LAP-01",
            serial_number="SN-001",
            asset_name="Laptop 1",
            asset_type="Laptop",
            device_type=org_dev,
            organization=self.org_a
        )
        Asset.objects.create(
            asset_tag="APEX-LAP-02",
            serial_number="SN-002",
            asset_name="Laptop 2",
            asset_type="Laptop",
            device_type=org_dev,
            organization=self.org_a
        )

        summary = DeviceCatalogueService.get_reconciliation_summary(self.org_a)
        laptop_item = [i for i in summary['items'] if i['code'] == 'LAPTOP'][0]

        self.assertEqual(laptop_item['declared'], 25)
        self.assertEqual(laptop_item['registered'], 2)
        self.assertEqual(laptop_item['unregistered'], 23)

    def test_09_device_soft_disable_preserves_historical_assets(self):
        """9. Disabling a device type soft-disables it without deleting historical assets."""
        DeviceCatalogueService.save_organization_device_selections(
            self.org_a,
            [{"identifier": "ROUTER", "quantity": 5}],
            user=self.user_a
        )
        org_dev = OrganizationDeviceType.objects.get(organization=self.org_a, platform_device_type__code="ROUTER")

        asset = Asset.objects.create(
            asset_tag="APEX-RTR-01",
            serial_number="SN-RTR-11",
            asset_name="Cisco Edge Router",
            asset_type="Router",
            device_type=org_dev,
            organization=self.org_a
        )

        # Disable device type
        DeviceCatalogueService.toggle_device_type(org_dev.id, self.org_a, is_enabled=False, user=self.user_a)
        org_dev.refresh_from_db()
        self.assertFalse(org_dev.is_enabled)

        # Asset still exists and links to historical device type
        asset.refresh_from_db()
        self.assertEqual(asset.device_type, org_dev)
        self.assertEqual(asset.asset_type, "Router")

    def test_10_authorized_qr_scan_lookup(self):
        """10. Scan lookup enforces tenant boundaries and authenticates users."""
        self.client.force_login(self.user_a)
        asset = Asset.objects.create(
            asset_tag="APEX-CCTV-01",
            serial_number="SN-CCTV-88",
            asset_name="Hikvision IP Camera",
            asset_type="CCTV Camera",
            organization=self.org_a
        )

        # User A searches APEX-CCTV-01 -> Success
        resp_a = self.client.get('/api/assets/scan-lookup/?code=APEX-CCTV-01')
        self.assertEqual(resp_a.status_code, 200)
        self.assertEqual(resp_a.json()['data']['asset_tag'], "APEX-CCTV-01")

        # User B (from different organization) attempts lookup -> 403 Forbidden
        self.client.force_login(self.user_b)
        resp_b = self.client.get('/api/assets/scan-lookup/?code=APEX-CCTV-01')
        self.assertEqual(resp_b.status_code, 403)
