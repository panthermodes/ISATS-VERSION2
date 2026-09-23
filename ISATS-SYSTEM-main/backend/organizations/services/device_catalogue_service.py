import logging
from django.db import transaction
from django.db.models import Q
from organizations.models import (
    DeviceCategory, DeviceType, OrganizationDeviceType, OrganizationDeviceEstimate, Organization
)
from organizations.services.audit_service import AuditService

logger = logging.getLogger(__name__)


class DeviceCatalogueService:
    """
    Core service managing:
    - Level 1: Platform Device Catalog (Standard ICT hardware defaults)
    - Level 2: Organization Device Catalog (Tenant-selected hardware & declared quantities)
    - Level 3: Organization Custom Device Types (Strictly tenant-scoped custom hardware)
    - Declared vs Registered Hardware Reconciliation
    """

    DEFAULT_CATALOGUE = [
        {
            'category': 'Computing Devices',
            'slug': 'computing',
            'icon': 'laptop',
            'display_order': 1,
            'description': 'Laptops, desktop workstations, compute servers, and client endpoints.',
            'types': [
                ('Laptop', 'LAPTOP', 'Business, executive, and rugged portable laptops', True, 1),
                ('Desktop Computer', 'DESKTOP', 'Standard desktop computer towers and workstations', True, 2),
                ('Workstation', 'WORKSTATION', 'High performance CAD/Engineering/Data Science compute units', True, 3),
                ('All-in-One Computer', 'AIO_PC', 'Integrated monitor and desktop computer systems', False, 4),
                ('Mini PC', 'MINI_PC', 'Compact small form-factor desktop computing units', False, 5),
                ('Thin Client', 'THIN_CLIENT', 'Lightweight VDI terminals and terminal clients', False, 6),
                ('Tablet', 'TABLET', 'Enterprise mobile touchscreen tablets', False, 7),
                ('Smartphone', 'SMARTPHONE', 'Company-issued smartphones and mobile devices', False, 8),
                ('Server', 'SERVER_STANDALONE', 'General standalone enterprise server compute nodes', True, 9),
                ('Blade Server', 'SERVER_BLADE', 'High-density blade chassis compute modules', False, 10),
                ('Rack Server', 'SERVER_RACK', '1U/2U/4U rackmount enterprise servers', True, 11),
            ]
        },
        {
            'category': 'Networking Devices',
            'slug': 'networking',
            'icon': 'network',
            'display_order': 2,
            'description': 'Routers, switches, gateways, firewalls, and network controllers.',
            'types': [
                ('Router', 'ROUTER', 'General WAN and office routing appliances', True, 1),
                ('Core Router', 'ROUTER_CORE', 'High-throughput data center/campus core routers', False, 2),
                ('Edge Router', 'ROUTER_EDGE', 'Edge perimeter routing appliances', False, 3),
                ('Switch', 'SWITCH', 'General Ethernet network switches', True, 4),
                ('Managed Switch', 'SWITCH_MANAGED', 'Layer 2/3 Gigabit managed access/distribution switches', True, 5),
                ('Unmanaged Switch', 'SWITCH_UNMANAGED', 'Unmanaged plug-and-play workgroup switches', False, 6),
                ('Layer 3 Switch', 'SWITCH_L3', 'Multi-layer routing switches with IP forwarding', False, 7),
                ('Network Access Point', 'WIFI_AP', 'Enterprise indoor/outdoor Wi-Fi access points', True, 8),
                ('Wireless Controller', 'WLAN_CONTROLLER', 'Hardware and virtual wireless LAN controllers', False, 9),
                ('Modem', 'MODEM', 'Fiber, DSL, and cellular broadband modems', False, 10),
                ('Network Gateway', 'GATEWAY', 'Unified service and application network gateways', False, 11),
                ('Firewall', 'FIREWALL', 'Next-Gen Firewall / UTM perimeter security appliances', True, 12),
                ('VPN Gateway', 'VPN_GATEWAY', 'Dedicated IPsec and SSL VPN concentrators', False, 13),
                ('Network Bridge', 'BRIDGE', 'Network bridging appliances', False, 14),
                ('Network Repeater', 'REPEATER', 'Signal repeaters and regenerators', False, 15),
                ('Network Extender', 'EXTENDER', 'Long-range Ethernet and wireless range extenders', False, 16),
                ('Network Appliance', 'NET_APPLIANCE', 'Specialized network appliances and packet analyzers', False, 17),
            ]
        },
        {
            'category': 'POS Devices',
            'slug': 'pos',
            'icon': 'credit-card',
            'display_order': 3,
            'description': 'Point of sale terminals, receipt printers, barcode guns, and cash drawers.',
            'types': [
                ('POS Terminal', 'POS_TERMINAL', 'All-in-one touchscreen retail and checkout terminals', True, 1),
                ('POS Computer', 'POS_COMPUTER', 'Dedicated under-counter retail computing units', False, 2),
                ('POS Tablet', 'POS_TABLET', 'Mobile handheld and counter-mounted tablet POS devices', False, 3),
                ('POS Mobile Terminal', 'POS_MOBILE', 'Handheld mobile point of sale ordering terminals', False, 4),
                ('Receipt Printer', 'POS_RECEIPT_PRINTER', 'High-speed thermal receipt printers', True, 5),
                ('Barcode Scanner', 'POS_BARCODE_SCANNER', '1D/2D handheld and hands-free barcode scanners', True, 6),
                ('QR Code Scanner', 'POS_QR_SCANNER', 'High-speed desktop and handheld QR code readers', False, 7),
                ('Cash Drawer', 'POS_CASH_DRAWER', 'Electronic solenoid cash drawers', True, 8),
                ('Customer Display', 'POS_CUSTOMER_DISPLAY', 'Customer-facing pole screens and VFDs', False, 9),
                ('POS Display', 'POS_DISPLAY', 'Secondary customer-facing color touch screens', False, 10),
                ('POS Card Reader', 'POS_CARD_READER', 'Magnetic stripe and chip payment card readers', False, 11),
                ('Payment Terminal', 'POS_PAYMENT_TERMINAL', 'Standalone bank POS / EMV payment terminals', True, 12),
                ('PIN Entry Device', 'POS_PED', 'PCI-PTS certified PIN entry pads', False, 13),
                ('POS Controller', 'POS_CONTROLLER', 'Branch and store POS controller units', False, 14),
            ]
        },
        {
            'category': 'Printer & Document Devices',
            'slug': 'printing',
            'icon': 'printer',
            'display_order': 4,
            'description': 'Laser, multifunction, thermal, label printers, and document scanners.',
            'types': [
                ('Printer', 'PRINTER', 'General office document printer', True, 1),
                ('Laser Printer', 'PRINTER_LASER', 'Monochrome and color desktop/workgroup laser printers', True, 2),
                ('Inkjet Printer', 'PRINTER_INKJET', 'Color inkjet document and photo printers', False, 3),
                ('Thermal Printer', 'PRINTER_THERMAL', 'Direct thermal and thermal transfer printers', False, 4),
                ('Receipt Printer', 'PRINTER_RECEIPT', 'Thermal roll receipt and ticket printers', False, 5),
                ('Label Printer', 'PRINTER_LABEL', 'Dedicated address, asset, and shipping label printers', True, 6),
                ('Barcode Printer', 'PRINTER_BARCODE', 'Industrial thermal barcode and tag printers', False, 7),
                ('Scanner', 'SCANNER', 'Flatbed and desktop document scanners', False, 8),
                ('Document Scanner', 'SCANNER_DOC', 'High-speed ADF duplex sheetfed scanners', True, 9),
                ('Network Scanner', 'SCANNER_NETWORK', 'Standalone Ethernet/Wi-Fi push document scanners', False, 10),
                ('Multifunction Printer', 'PRINTER_MFP', 'Enterprise print, copy, scan, and fax units', True, 11),
                ('Photocopier', 'PHOTOCOPIER', 'Heavy-duty floor-standing digital copiers', False, 12),
                ('Plotter', 'PLOTTER', 'Wide-format engineering CAD and graphics plotters', False, 13),
            ]
        },
        {
            'category': 'Security & Surveillance',
            'slug': 'security',
            'icon': 'shield',
            'display_order': 5,
            'description': 'CCTV cameras, NVRs, DVRs, access control, and biometric terminals.',
            'types': [
                ('CCTV Camera', 'CCTV_CAMERA', 'Standard surveillance security cameras', True, 1),
                ('IP Camera', 'CAMERA_IP', 'Network IP surveillance cameras', True, 2),
                ('Dome Camera', 'CAMERA_DOME', 'Ceiling-mounted vandal-resistant dome cameras', False, 3),
                ('Bullet Camera', 'CAMERA_BULLET', 'Long-range outdoor weather-rated bullet cameras', False, 4),
                ('PTZ Camera', 'CAMERA_PTZ', 'Pan-tilt-zoom optical tracking surveillance cameras', False, 5),
                ('DVR', 'DVR', 'Analog video digital recording units', False, 6),
                ('NVR', 'NVR', 'Multi-channel IP network video recorders', True, 7),
                ('CCTV Monitor', 'CCTV_MONITOR', 'Dedicated 24/7 security room display monitors', False, 8),
                ('Biometric Device', 'BIOMETRIC_DEVICE', 'General biometric recognition terminals', True, 9),
                ('Fingerprint Scanner', 'FINGERPRINT_SCANNER', 'Optical and capacitive fingerprint clocks', True, 10),
                ('Facial Recognition Device', 'FACIAL_RECOGNITION', 'AI facial recognition access control terminals', False, 11),
                ('Access Control Device', 'ACCESS_CONTROL', 'Electronic door access controllers', True, 12),
                ('Door Access Controller', 'DOOR_CONTROLLER', 'Centralized multi-door access control panels', False, 13),
                ('RFID Reader', 'RFID_READER', 'Proximity smart card and badge RFID readers', False, 14),
                ('RFID Device', 'RFID_DEVICE', 'Active/passive RFID tracking transponders', False, 15),
            ]
        },
        {
            'category': 'Power Devices',
            'slug': 'power',
            'icon': 'zap',
            'display_order': 6,
            'description': 'UPS battery backups, inverters, PDUs, and voltage stabilizers.',
            'types': [
                ('UPS', 'UPS', 'Uninterruptible power supply units', True, 1),
                ('Online UPS', 'UPS_ONLINE', 'Double-conversion pure sine-wave data center UPS units', True, 2),
                ('Offline UPS', 'UPS_OFFLINE', 'Standby workstation power backup units', False, 3),
                ('Inverter', 'INVERTER', 'DC to AC pure sine power inverter systems', False, 4),
                ('Power Backup', 'POWER_BACKUP', 'Auxiliary battery banks and power packs', False, 5),
                ('Surge Protector', 'SURGE_PROTECTOR', 'Transient voltage surge suppressors (TVSS)', False, 6),
                ('Power Distribution Unit', 'PDU', 'Rackmount metered and switched power bars', True, 7),
                ('Voltage Stabilizer', 'VOLTAGE_STABILIZER', 'Automatic servo voltage regulators (AVR)', False, 8),
                ('Network UPS', 'UPS_NETWORK', 'SNMP-enabled network managed UPS systems', False, 9),
            ]
        },
        {
            'category': 'Communication Devices',
            'slug': 'communication',
            'icon': 'phone',
            'display_order': 7,
            'description': 'IP phones, VoIP hardware, PBX systems, and video conference devices.',
            'types': [
                ('IP Phone', 'PHONE_IP', 'SIP protocol desktop IP telephones', True, 1),
                ('VoIP Phone', 'PHONE_VOIP', 'Enterprise voice over IP desk sets', True, 2),
                ('Telephone', 'PHONE_ANALOG', 'Analog telephone handsets', False, 3),
                ('Mobile Phone', 'PHONE_MOBILE', 'Field and support cell phones', False, 4),
                ('Radio', 'RADIO', 'Communication base station radios', False, 5),
                ('Two-Way Radio', 'RADIO_TWO_WAY', 'Handheld walkie-talkie VHF/UHF transceivers', False, 6),
                ('Conference Phone', 'PHONE_CONF', 'Tabletop 360-degree boardroom speakerphones', False, 7),
                ('Video Conference Device', 'VIDEO_CONF', 'All-in-one boardroom camera/mic/speaker bars', True, 8),
            ]
        },
        {
            'category': 'Display & Presentation',
            'slug': 'display',
            'icon': 'monitor',
            'display_order': 8,
            'description': 'Monitors, projectors, interactive touchscreens, and digital signage screens.',
            'types': [
                ('Monitor', 'MONITOR', 'General desktop computer display monitors', True, 1),
                ('LED Monitor', 'MONITOR_LED', 'Widescreen LED computer screens', False, 2),
                ('LCD Monitor', 'MONITOR_LCD', 'Color LCD desktop screens', False, 3),
                ('Projector', 'PROJECTOR', 'Conference and classroom multimedia projectors', True, 4),
                ('Interactive Display', 'DISPLAY_INTERACTIVE', 'Interactive smart whiteboard touchscreens', False, 5),
                ('Digital Signage Display', 'DISPLAY_SIGNAGE', 'Commercial public information screens', False, 6),
                ('Conference Display', 'DISPLAY_CONF', 'Meeting room large-format display panels', False, 7),
            ]
        },
        {
            'category': 'Storage Devices',
            'slug': 'storage',
            'icon': 'hard-drive',
            'display_order': 9,
            'description': 'External drives, SSDs, NAS appliances, and SAN storage systems.',
            'types': [
                ('External Hard Drive', 'HDD_EXTERNAL', 'Portable USB/Thunderbolt external magnetic drives', False, 1),
                ('External SSD', 'SSD_EXTERNAL', 'High-speed solid-state external storage', False, 2),
                ('NAS', 'NAS', 'Network attached storage multi-bay RAID appliances', True, 3),
                ('SAN', 'SAN', 'Storage area network block-level storage arrays', False, 4),
                ('Network Storage Device', 'NET_STORAGE', 'Enterprise shared storage appliances', False, 5),
                ('Backup Storage Device', 'BACKUP_STORAGE', 'Automated tape libraries and backup appliances', False, 6),
                ('USB Storage Device', 'USB_STORAGE', 'Encrypted USB flash memory devices', False, 7),
            ]
        },
        {
            'category': 'Server Room / Data Center',
            'slug': 'datacenter',
            'icon': 'server',
            'display_order': 10,
            'description': 'Server racks, patch panels, KVM switches, consoles, and environmental controllers.',
            'types': [
                ('Server Rack', 'RACK_SERVER', '42U/48U enclosed server cabinets', True, 1),
                ('Network Rack', 'RACK_NETWORK', 'Open-frame two-post and four-post network racks', False, 2),
                ('Patch Panel', 'PATCH_PANEL', 'Cat6/Cat6A RJ45 punchdown patch panels', True, 3),
                ('KVM Switch', 'KVM_SWITCH', 'Multi-server keyboard-video-mouse switches', False, 4),
                ('Server Console', 'SERVER_CONSOLE', '1U rackmount fold-out LCD console drawers', False, 5),
                ('Rack Monitor', 'RACK_MONITOR', 'Data center rackmount surveillance monitors', False, 6),
                ('Data Center Controller', 'DC_CONTROLLER', 'Environmental temperature/humidity monitoring units', False, 7),
            ]
        },
        {
            'category': 'Network Infrastructure',
            'slug': 'infrastructure',
            'icon': 'layers',
            'display_order': 11,
            'description': 'Fiber converters, media converters, distribution boxes, and wall cabinets.',
            'types': [
                ('Fiber Converter', 'FIBER_CONVERTER', 'Ethernet-to-fiber optical media converters', False, 1),
                ('Media Converter', 'MEDIA_CONVERTER', 'Multi-mode to single-mode media converters', False, 2),
                ('Patch Panel', 'INFRA_PATCH_PANEL', 'Structured cabling distribution panels', False, 3),
                ('Network Cabinet', 'NETWORK_CABINET', 'Wall-mount 6U/9U/12U telecommunication boxes', True, 4),
                ('Fiber Distribution Unit', 'FIBER_ODF', 'Optical distribution frames (ODF)', False, 5),
                ('Fiber Termination Box', 'FIBER_TB', 'Fiber optic wall and rack termination boxes', False, 6),
            ]
        },
        {
            'category': 'Other ICT Devices',
            'slug': 'other',
            'icon': 'cpu',
            'display_order': 12,
            'description': 'Smart TVs, IoT devices, GPS units, and custom organizational hardware.',
            'types': [
                ('Smart TV', 'SMART_TV', 'Conference room connected smart televisions', False, 1),
                ('Digital Signage', 'DIGITAL_SIGNAGE', 'Standalone digital signage players and kiosks', False, 2),
                ('IoT Gateway', 'IOT_GATEWAY', 'Industrial and building IoT telemetry gateways', False, 3),
                ('IoT Device', 'IOT_DEVICE', 'Environmental sensors and IoT endpoints', False, 4),
                ('GPS Tracker', 'GPS_TRACKER', 'Fleet vehicle and asset GPS tracking units', False, 5),
                ('Smart Device', 'SMART_DEVICE', 'Smart office controllers and connected devices', False, 6),
                ('Embedded Computer', 'EMBEDDED_PC', 'Specialized embedded automation controllers', False, 7),
                ('Other ICT Equipment', 'OTHER_EQUIPMENT', 'General unclassified ICT hardware and peripherals', True, 8),
            ]
        }
    ]

    @classmethod
    def seed_default_catalogue(cls):
        """
        Populates or updates all 12 default enterprise device categories and 80+ standard device types.
        """
        with transaction.atomic():
            for cat_data in cls.DEFAULT_CATALOGUE:
                category, _ = DeviceCategory.objects.update_or_create(
                    slug=cat_data['slug'],
                    defaults={
                        'name': cat_data['category'],
                        'icon': cat_data['icon'],
                        'display_order': cat_data.get('display_order', 0),
                        'description': cat_data['description'],
                        'is_active': True,
                    }
                )
                for item in cat_data['types']:
                    type_name, code, desc = item[0], item[1], item[2]
                    is_def = item[3] if len(item) > 3 else True
                    order = item[4] if len(item) > 4 else 0

                    DeviceType.objects.update_or_create(
                        code=code,
                        defaults={
                            'category': category,
                            'name': type_name,
                            'description': desc,
                            'is_default': is_def,
                            'display_order': order,
                            'is_active': True,
                        }
                    )

    @classmethod
    def get_full_catalogue(cls) -> list:
        """
        Returns full hierarchy of categories and types for React selector.
        Auto-seeds if catalog is empty.
        """
        if DeviceCategory.objects.count() < 12 or DeviceType.objects.count() < 60:
            cls.seed_default_catalogue()

        categories = DeviceCategory.objects.filter(is_active=True).prefetch_related('device_types')
        result = []
        for cat in categories:
            types = cat.device_types.filter(is_active=True)
            result.append({
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'icon': cat.icon,
                'display_order': cat.display_order,
                'description': cat.description,
                'types_count': types.count(),
                'types': [
                    {
                        'id': t.id,
                        'name': t.name,
                        'code': t.code,
                        'description': t.description,
                        'is_default': t.is_default,
                        'display_order': t.display_order,
                    }
                    for t in types
                ]
            })
        return result

    @classmethod
    def get_organization_catalogue(cls, organization: Organization, include_disabled: bool = False) -> list:
        """
        LEVEL 2 & LEVEL 3:
        Returns the organization's device catalog:
        - All configured OrganizationDeviceType records (Standard + Custom)
        - If none configured yet, returns standard defaults with default_quantity=0.
        """
        query = Q(organization=organization)
        if not include_disabled:
            query &= Q(is_enabled=True)

        org_types = OrganizationDeviceType.objects.filter(query).select_related(
            'platform_device_type', 'platform_device_type__category', 'custom_category'
        )

        results = []
        for ot in org_types:
            registered_count = ot.registered_assets.filter(is_deleted=False).count()
            results.append({
                'id': ot.id,
                'name': ot.name,
                'code': ot.code,
                'category_name': ot.category_name,
                'category_slug': ot.category_slug,
                'icon': ot.icon,
                'description': ot.description,
                'is_custom': ot.is_custom,
                'is_enabled': ot.is_enabled,
                'declared_quantity': ot.default_quantity,
                'registered_count': registered_count,
                'unregistered_count': max(0, ot.default_quantity - registered_count),
                'manufacturer': ot.manufacturer,
                'model_family': ot.model_family,
                'notes': ot.notes,
                'platform_device_type_id': ot.platform_device_type_id,
                'custom_category_id': ot.custom_category_id,
            })
        return results

    @classmethod
    def save_organization_estimates(cls, organization: Organization, estimates_dict: dict, user=None):
        """
        Legacy/convenience helper to populate OrganizationDeviceType from onboarding dictionary.
        Format: { 'CODE_OR_ID': quantity }
        """
        cls.save_organization_device_selections(
            organization=organization,
            selections_list=[
                {'identifier': key, 'quantity': qty}
                for key, qty in estimates_dict.items()
            ],
            user=user
        )

    @classmethod
    def save_organization_device_selections(cls, organization: Organization, selections_list: list, user=None):
        """
        Persists selected standard device types and quantities for an organization.
        selections_list item format:
        { 'identifier': 'LAPTOP' or id, 'quantity': 25, 'is_enabled': True }
        """
        with transaction.atomic():
            for item in selections_list:
                key = item.get('identifier') or item.get('code') or item.get('id')
                qty = int(item.get('quantity', 0) or 0)
                is_enabled = bool(item.get('is_enabled', True))

                if not key:
                    continue

                # Locate standard platform device type
                device_type = None
                if str(key).isdigit():
                    device_type = DeviceType.objects.filter(id=int(key)).first()
                if not device_type:
                    device_type = DeviceType.objects.filter(code=str(key)).first()
                if not device_type:
                    device_type = DeviceType.objects.filter(name__iexact=str(key)).first()

                if not device_type:
                    continue

                org_dev, created = OrganizationDeviceType.objects.update_or_create(
                    organization=organization,
                    platform_device_type=device_type,
                    defaults={
                        'is_custom': False,
                        'is_enabled': is_enabled,
                        'default_quantity': max(0, qty),
                        'created_by': user or organization.members.first().user if hasattr(organization, 'members') and organization.members.exists() else None,
                    }
                )

                # Keep legacy estimate model synchronized
                OrganizationDeviceEstimate.objects.update_or_create(
                    organization=organization,
                    device_type=device_type,
                    defaults={'estimated_quantity': max(0, qty)}
                )

    @classmethod
    def create_custom_device_type(cls, organization: Organization, data: dict, user=None) -> OrganizationDeviceType:
        """
        LEVEL 3: Creates a custom device type belonging strictly to this organization.
        Enforces tenant isolation and prevents cross-organization leakage.
        """
        custom_name = (data.get('name') or data.get('custom_name', '')).strip()
        if not custom_name:
            raise ValueError("Device type name is required")

        # Check duplicate name within the same organization
        if OrganizationDeviceType.objects.filter(
            organization=organization,
            custom_name__iexact=custom_name,
            is_custom=True
        ).exists():
            raise ValueError(f"A custom device type named '{custom_name}' already exists in your organization.")

        category_id = data.get('category_id') or data.get('category')
        category = None
        if category_id:
            if str(category_id).isdigit():
                category = DeviceCategory.objects.filter(id=int(category_id)).first()
            if not category:
                category = DeviceCategory.objects.filter(slug=str(category_id)).first()

        if not category:
            category = DeviceCategory.objects.filter(slug='other').first()

        org_dev = OrganizationDeviceType.objects.create(
            organization=organization,
            platform_device_type=None,
            custom_name=custom_name,
            custom_category=category,
            custom_description=data.get('description', ''),
            manufacturer=data.get('manufacturer', ''),
            model_family=data.get('model_family', ''),
            notes=data.get('notes', ''),
            is_custom=True,
            is_enabled=True,
            default_quantity=int(data.get('default_quantity', 0) or 0),
            created_by=user,
        )

        if user:
            AuditService.log_action(
                user=user,
                action="create_custom_device_type",
                details=f"Created custom ICT device type: {custom_name} (Org: {organization.name})"
            )

        return org_dev

    @classmethod
    def toggle_device_type(cls, org_device_id: int, organization: Organization, is_enabled: bool, user=None):
        """
        Enables or disables an organization device type without destructive deletion.
        """
        org_dev = OrganizationDeviceType.objects.filter(id=org_device_id, organization=organization).first()
        if not org_dev:
            raise ValueError("Organization device type not found.")

        old_status = org_dev.is_enabled
        org_dev.is_enabled = is_enabled
        org_dev.save(update_fields=['is_enabled', 'updated_at'])

        if user:
            AuditService.log_action(
                user=user,
                action="toggle_device_type",
                details=f"Toggled device type '{org_dev.name}' enabled={is_enabled} (was {old_status})"
            )
        return org_dev

    @classmethod
    def get_reconciliation_summary(cls, organization: Organization) -> dict:
        """
        Compares declared quantities vs registered assets across the organization.
        """
        org_devices = OrganizationDeviceType.objects.filter(
            organization=organization
        ).select_related('platform_device_type', 'platform_device_type__category', 'custom_category')

        total_declared = 0
        total_registered = 0
        categories_breakdown = {}
        items = []

        for od in org_devices:
            declared = od.default_quantity
            registered = od.registered_assets.filter(is_deleted=False).count()
            unregistered = max(0, declared - registered)

            total_declared += declared
            total_registered += registered

            cat_name = od.category_name
            if cat_name not in categories_breakdown:
                categories_breakdown[cat_name] = {'declared': 0, 'registered': 0}
            categories_breakdown[cat_name]['declared'] += declared
            categories_breakdown[cat_name]['registered'] += registered

            items.append({
                'id': od.id,
                'name': od.name,
                'code': od.code,
                'category': cat_name,
                'icon': od.icon,
                'is_custom': od.is_custom,
                'is_enabled': od.is_enabled,
                'declared': declared,
                'registered': registered,
                'unregistered': unregistered,
            })

        return {
            'total_device_types': org_devices.count(),
            'standard_types_count': org_devices.filter(is_custom=False).count(),
            'custom_types_count': org_devices.filter(is_custom=True).count(),
            'enabled_types_count': org_devices.filter(is_enabled=True).count(),
            'disabled_types_count': org_devices.filter(is_enabled=False).count(),
            'total_declared_assets': total_declared,
            'total_registered_assets': total_registered,
            'total_unregistered_assets': max(0, total_declared - total_registered),
            'categories_breakdown': categories_breakdown,
            'items': items,
        }
