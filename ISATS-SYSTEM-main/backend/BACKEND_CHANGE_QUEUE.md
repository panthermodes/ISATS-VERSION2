# BACKEND_CHANGE_QUEUE.md — ISATS Backend Tracking

This document tracks all identified backend changes, schema updates, and database requirements discovered during frontend inspection and migration.

---

## Completed Backend Changes (Phase 2 & Initial Migration)

### 1. Missing `PhoneOTP` Model
* **Problem**: `core/forms.py` imported `PhoneOTP` from `core.models`, but the model did not exist in `core/models.py`.
* **Required Change**: Create `PhoneOTP` model with `phone_number` and `otp` fields.
* **Database Change**: YES
* **Migration**: Created `0007_phoneotp_category_is_default_loginattempt_ip_address.py`
* **Status**: **RESOLVED & APPLIED**

### 2. Missing `ip_address` on `LoginAttempt`
* **Problem**: `core/utils.py` called `LoginAttempt.objects.create(ip_address=...)`, but the model lacked this field.
* **Required Change**: Add `ip_address = models.CharField(max_length=45, blank=True, default='')` to `LoginAttempt`.
* **Database Change**: YES
* **Migration**: Created `0007_phoneotp_category_is_default_loginattempt_ip_address.py`
* **Status**: **RESOLVED & APPLIED**

### 3. Missing `is_default` on `Category`
* **Problem**: `CategoryDeleteView` and `core/signals.py` post-migrate hooks referenced `is_default`, but the model lacked the field.
* **Required Change**: Add `is_default = models.BooleanField(default=False)` to `Category`.
* **Database Change**: YES
* **Migration**: Created `0007_phoneotp_category_is_default_loginattempt_ip_address.py`
* **Status**: **RESOLVED & APPLIED**

---

## Deferred Backend Changes (Upcoming Multi-Tenant & SaaS Phases)

### 4. Organization Multi-Tenant Foreign Keys
* **Problem**: Models (`UserProfile`, `Asset`, `Ticket`, `Department`, `InventoryItem`) lack tenant references to `Organization`.
* **Required Change**: Add `organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE)` to all tenant-scoped models.
* **Database Change**: YES
* **Migration**: REQUIRED
* **Status**: **DEFERRED TO COMMAND 03 (MULTI-TENANT FOUNDATION)**

### 5. SaaS Subscription & Entitlement Models
* **Problem**: Commercial subscription plan (TZS 100,000/mo, 250 active users limit) requires database tracking.
* **Required Change**: Create `Subscription`, `SubscriptionPlan`, `SubscriptionUsage`, and `Invoice` models.
* **Database Change**: YES
* **Migration**: REQUIRED
* **Status**: **DEFERRED TO COMMAND 05 (SUBSCRIPTION & BILLING)**

### 6. Progressive Onboarding Persistence
* **Problem**: Multi-step registration wizard requires staging tenant setup data in the database across steps.
* **Required Change**: Create `OnboardingSession` model or store onboarding state on `Organization` with `is_onboarding_completed` flag.
* **Database Change**: YES
* **Migration**: REQUIRED
* **Status**: **DEFERRED TO COMMAND 04 (ORGANIZATION ONBOARDING)**
