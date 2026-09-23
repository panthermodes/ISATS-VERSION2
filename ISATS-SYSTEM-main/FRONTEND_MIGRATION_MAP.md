# FRONTEND_MIGRATION_MAP.md — ISATS Migration Tracker

This document provides the complete, exhaustive Phase 2 mapping of every legacy Django server-rendered HTML template to its corresponding React + TypeScript component and route in the modernized ISATS application.

---

## 1. Authentication & User Management

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/auth/login.html` | `frontend/src/pages/auth/Login.tsx` | `/login` | `POST /api/auth/login/` | Session login, CSRF handling, password toggle, client-side validation, redirect to dashboard by role. | **Migrated** |
| `templates/auth/register.html` | `frontend/src/pages/auth/Register.tsx` | `/register` | `POST /api/auth/register/` | Multi-field user registration, username, email, phone number, password strength checks. | **Migrated** |
| `templates/auth/user_list.html` | `frontend/src/pages/users/UserList.tsx` | `/users` | `GET /api/users/` | Table with search, department filtering, role badges, status toggle, pagination, actions dropdown. | **Migrated** |
| `templates/auth/user_detail.html` | `frontend/src/pages/users/UserDetail.tsx` | `/users/:id` | `GET /api/users/:id/` | Profile overview, assigned assets list, ticket history, role update, department assignment. | **Migrated** |
| `templates/auth/user_form.html` | `frontend/src/pages/users/UserDetail.tsx` (Modal) | `/users` | `POST /api/users/` | User creation form with role assignment, department dropdown, and initial password. | **Migrated** |
| `templates/auth/promote_form.html` | `frontend/src/pages/users/UserDetail.tsx` | `/users/:id` | `POST /api/validate-promotion/` | Hierarchical promotion modal, validates requester permissions against target hierarchy level. | **Migrated** |
| `templates/auth/demote_form.html` | `frontend/src/pages/users/UserDetail.tsx` | `/users/:id` | `POST /api/users/:id/demote/` | Demotion workflow with confirmation, reason capture, and hierarchy limit checks. | **Migrated** |
| `templates/auth/confirm_promote_admin.html` | `frontend/src/components/ui/ConfirmDialog.tsx` | N/A | `POST /api/users/:id/promote/` | Security warning dialog for promoting users to Admin/SuperAdmin roles. | **Migrated** |
| `templates/auth/bulk_promote.html` | `frontend/src/pages/users/UserList.tsx` | `/users` | `POST /api/users/bulk-promote/` | Batch multi-select checkbox table with bulk role transition controls. | **Migrated** |
| `templates/auth/role_permission_list.html` | `frontend/src/pages/settings/Settings.tsx` | `/settings` | `GET /api/roles/permissions/` | Permission matrix table showing allowed capabilities per role (SuperAdmin only). | **Migrated** |
| `templates/auth/role_permission_form.html` | `frontend/src/pages/settings/Settings.tsx` | `/settings` | `PATCH /api/roles/permissions/:id/` | Toggle switch for dynamic database-driven permission grants. | **Migrated** |
| `templates/auth/login_attempts.html` | `frontend/src/pages/audit/AuditLog.tsx` | `/audit` | `GET /api/audit/` | Security login audit table with IP address, timestamp, status (success/failure), username. | **Migrated** |

---

## 2. Asset Management & Tracking

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/assets/list.html` | `frontend/src/pages/assets/AssetList.tsx` | `/assets` | `GET /api/assets/` | Filterable data table, search with debouncing, status/category filters, QR preview trigger, pagination. | **Migrated** |
| `templates/assets/detail.html` | `frontend/src/pages/assets/AssetDetail.tsx` | `/assets/:id` | `GET /api/assets/:id/` | Full asset profile, QR code view/download, barcode display, assignment badge, maintenance logs tab. | **Migrated** |
| `templates/assets/create.html` | `frontend/src/pages/assets/CreateAsset.tsx` | `/assets/create` | `POST /api/assets/` | Multi-section form: tag, serial number, model, manufacturer, category/dept dropdowns, condition status. | **Migrated** |
| `templates/assets/acknowledge_policy.html` | `frontend/src/pages/assets/AcknowledgePolicy.tsx` | `/assets/:id/acknowledge-policy` | `POST /api/assets/:id/acknowledge/` | IT asset policy agreement with legal disclaimer checkbox and signature confirmation. | **Migrated** |
| `templates/assets/assignment_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Modal) | `/assets/:id` | `POST /api/assets/:id/assign/` | Modal to assign/reassign an asset to a user or department with notification trigger. | **Migrated** |
| `templates/assets/confirm_delete.html` | `frontend/src/components/ui/ConfirmDialog.tsx` | N/A | `DELETE /api/assets/:id/` | Safe soft-delete confirmation modal with dependency checking. | **Migrated** |
| `templates/assets/movement_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Modal) | `/assets/:id` | `POST /api/assets/:id/move/` | Location transfer form (from_location $\rightarrow$ to_location) with purpose notes. | **Migrated** |
| `templates/assets/movement_history.html` | `frontend/src/pages/assets/AssetDetail.tsx` | `/assets/:id` | `GET /api/assets/:id/movements/` | Chronological movement ledger showing relocations and approving officers. | **Migrated** |
| `templates/assets/movement_list.html` | `frontend/src/pages/assets/AssetList.tsx` | `/assets` | `GET /api/assets/movements/` | Global asset movement registry for facility and inventory tracking. | **Migrated** |
| `templates/assets/override_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` | `/assets/:id` | `POST /api/assets/:id/override/` | SuperAdmin override mechanism for reassigning locked assets. | **Migrated** |
| `templates/assets/request_form.html` | `frontend/src/pages/assets/AssetList.tsx` (Modal) | `/assets` | `POST /api/asset-requests/` | User hardware requisition form with urgency, justification, and specs. | **Migrated** |
| `templates/assets/request_list.html` | `frontend/src/pages/assets/AssetList.tsx` | `/assets` | `GET /api/asset-requests/` | Requisitions approval queue for ICT Officers and Managers. | **Migrated** |
| `templates/assets/return_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Modal) | `/assets/:id` | `POST /api/assets/:id/return/` | Asset return checklist with condition inspection and release clearance. | **Migrated** |
| `templates/assets/transfer_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Modal) | `/assets/:id` | `POST /api/assets/:id/transfer/` | Inter-employee asset transfer with dual-party clearance confirmation. | **Migrated** |
| `templates/assets/usage_form.html` & `usage_list.html` & `usage_summary.html` | `frontend/src/pages/assets/AssetDetail.tsx` | `/assets/:id` | `GET/POST /api/assets/:id/usage/` | Asset utilization logging (duration in minutes, activity type, operator). | **Migrated** |

---

## 3. Ticketing & Support Operations

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/react/tickets/create_ticket.html` | `frontend/src/pages/tickets/CreateTicket.tsx` | `/tickets/create` | `POST /api/tickets/` | Incident report form: category, priority (Low/Med/High/Urgent), asset tag link, image attachment, description. | **Migrated** |
| `templates/react/tickets/ticket_detail.html` | `frontend/src/pages/tickets/TicketDetail.tsx` | `/tickets/:id` | `GET /api/tickets/:id/` | Live status workflow: Mark In Progress, Mark Resolved, Close Ticket, Related Asset Card, details timeline. | **Migrated** |
| `templates/tickets/user_ticket_list.html` | `frontend/src/pages/tickets/TicketList.tsx` | `/tickets` | `GET /api/tickets/` | Role-filtered tickets table: search, priority badges, status pills, assignment indicators. | **Migrated** |
| `templates/tickets/officer_queue.html` | `frontend/src/pages/tickets/TicketList.tsx` | `/tickets` | `GET /api/tickets/?queue=officer` | Technician queue with quick self-assignment and priority triage. | **Migrated** |

---

## 4. Dashboards & Analytics

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/dashboard/user.html` (and `base2.html`) | `frontend/src/pages/dashboard/UserDashboard.tsx` | `/dashboard` | `GET /api/dashboard/` | User KPI cards (My Assets, Open Tickets, Pending Requests), Quick Actions, Recent Tickets table. | **Migrated** |
| `templates/dashboard/ict_officer.html` | `frontend/src/pages/dashboard/OfficerDashboard.tsx` | `/dashboard` | `GET /api/dashboard/` | Queue stats, active maintenance tasks, assigned tickets, quick resolution tools. | **Migrated** |
| `templates/dashboard/manager.html` | `frontend/src/pages/dashboard/ManagerDashboard.tsx` | `/dashboard` | `GET /api/dashboard/` | Departmental ticket velocity, asset health overview, procurement approval widgets. | **Migrated** |
| `templates/dashboard/admin.html` | `frontend/src/pages/dashboard/AdminDashboard.tsx` | `/dashboard` | `GET /api/dashboard/` | System-wide statistics: total assets, tickets by status chart, active user counter, low stock alert. | **Migrated** |
| `templates/dashboard/superadmin.html` (and `base3.html`) | `frontend/src/pages/dashboard/SuperAdminDashboard.tsx` | `/dashboard` | `GET /api/dashboard/` | Enterprise administration: security audits, role controls, system settings, global KPI trends. | **Migrated** |

---

## 5. Inventory & Maintenance

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/inventory/items.html` | `frontend/src/pages/inventory/InventoryList.tsx` | `/inventory` | `GET /api/inventory/` | Stock tracking table, reorder alerts, quantity adjustment modals, procurement requests. | **Migrated** |
| `templates/maintenance/history.html` & `log_list.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Tab) | `/assets/:id` | `GET /api/maintenance/` | Preventative/corrective service logs, maintenance dates, technician notes. | **Migrated** |
| `templates/maintenance/predictive_alerts_officer.html` | `frontend/src/pages/dashboard/OfficerDashboard.tsx` | `/dashboard` | `GET /api/check-alerts/` | AI-driven hardware failure prediction alerts, risk scoring, proactive service triggers. | **Migrated** |
| `templates/requests/temporary_access_form.html` | `frontend/src/pages/assets/AssetDetail.tsx` (Modal) | `/assets/:id` | `POST /api/requests/temporary-access/` | Time-bound temporary hardware/network access requests with auto-expiry. | **Migrated** |

---

## 6. Profile, Settings & Notifications

| Old Template | New React TSX Page / Component | Route | Target API | Features & Interactions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `templates/react/profile/profile.html` | `frontend/src/pages/profile/Profile.tsx` | `/profile` | `GET /api/me/` | User avatar, name, email, department, role badge, phone number edit. | **Migrated** |
| `templates/react/profile/change_password.html` | `frontend/src/pages/profile/Profile.tsx` (Tab) | `/profile` | `POST /api/auth/change-password/` | Current password verification, new password confirmation with validation. | **Migrated** |
| `templates/react/profile/security.html` | `frontend/src/pages/profile/Profile.tsx` (Tab) | `/profile` | `GET /api/me/security/` | Two-factor authentication status, active session overview. | **Migrated** |
| `templates/notifications/notifications_view.html` | `frontend/src/pages/notifications/NotificationList.tsx` | `/notifications` | `GET /api/notifications/` | Real-time notification feed, mark single read, mark all read button, unread pill. | **Migrated** |
| `templates/settings/systemsetting_list.html` | `frontend/src/pages/settings/Settings.tsx` | `/settings` | `GET/PATCH /api/settings/` | System configuration keys, company details, global ticketing rules. | **Migrated** |
| `templates/categories/list.html` & `form.html` | `frontend/src/pages/departments/DepartmentList.tsx` | `/departments` | `GET/POST /api/departments/` | Category & Department organizational units management, create/edit modals. | **Migrated** |
| `templates/reports/*.html` | `frontend/src/pages/reports/ReportList.tsx` | `/reports` | `GET /api/reports/` | Asset utilization, ticket SLA, risk assessment, and maintenance report generators. | **Migrated** |
