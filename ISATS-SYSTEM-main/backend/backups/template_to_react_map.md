Conversion mapping: Django templates → proposed React routes/pages

Notes:
- Do not delete templates yet. Use this mapping to implement pages incrementally.
- Start with `templates/react/*` and critical dashboard/ticket/asset pages.

Mappings:

- templates/react/dashboard.html -> /react/dashboard (frontend/src/pages/react/Dashboard.tsx)
- templates/react/base.html -> shared React `react_base` mount (frontend/src/react_bridge/ReactBase.tsx)

- templates/react/profile/profile.html -> /profile (frontend/src/pages/profile/Profile.tsx)
- templates/react/profile/change_password.html -> /profile/change-password (frontend/src/pages/profile/ChangePassword.tsx)
- templates/react/profile/security.html -> /profile/security (frontend/src/pages/profile/Security.tsx)

- templates/react/tickets/create_ticket.html -> /tickets/create (frontend/src/pages/tickets/CreateTicket.tsx)
- templates/react/tickets/ticket_detail.html -> /tickets/:id (frontend/src/pages/tickets/TicketDetail.tsx)

- templates/assets/acknowledge_policy.html -> /assets/:id/acknowledge-policy (frontend/src/pages/assets/AcknowledgePolicy.tsx)
- templates/assets/assetusage_list.html -> /asset-usage (frontend/src/pages/assets/AssetUsageList.tsx)
- templates/assets/assignment_form.html -> /assets/assign (frontend/src/pages/assets/AssignmentForm.tsx)
- templates/assets/confirm_delete.html -> generic Confirm Modal component (frontend/src/components/ConfirmModal.tsx)
- templates/assets/movement_form.html -> /assets/move (frontend/src/pages/assets/AssetMovementForm.tsx)
- templates/assets/movement_history.html -> /assets/:id/movements (frontend/src/pages/assets/AssetMovementHistory.tsx)
- templates/assets/movement_list.html -> /asset-movements (frontend/src/pages/assets/AssetMovementList.tsx)
- templates/assets/override_form.html -> /assets/:id/override (frontend/src/pages/assets/OverrideAssignment.tsx)
- templates/assets/request_form.html -> /asset-requests/create (frontend/src/pages/requests/AssetRequestForm.tsx)
- templates/assets/request_list.html -> /asset-requests (frontend/src/pages/requests/AssetRequestList.tsx)
- templates/assets/return_form.html -> /assets/:id/return (frontend/src/pages/assets/AssetReturn.tsx)
- templates/assets/transfer_form.html -> /assets/transfer (frontend/src/pages/assets/AssetTransfer.tsx)
- templates/assets/usage_form.html -> /asset-usage/create (frontend/src/pages/assets/AssetUsageForm.tsx)
- templates/assets/usage_list.html -> /asset-usage (frontend/src/pages/assets/AssetUsageList.tsx)
- templates/assets/usage_summary.html -> /assets/:id/usage/summary (frontend/src/pages/assets/AssetUsageSummary.tsx)

- templates/base/base.html -> App shell/layouts (frontend/src/layouts/MainLayout.tsx)
- templates/base/assets_base.html -> Asset-specific layout (frontend/src/layouts/AssetLayout.tsx)
- templates/base/base1.html -> legacy base (review and merge into MainLayout)
- templates/base/base2.html -> legacy base2 (review)
- templates/base/base3.html -> legacy base3 (review)

- templates/categories/list.html -> /categories (frontend/src/pages/categories/CategoryList.tsx)
- templates/categories/form.html -> /categories/create or /categories/:id/edit (frontend/src/pages/categories/CategoryForm.tsx)
- templates/categories/confirm_delete.html -> reuse ConfirmModal

- templates/auth/login_attempts.html -> /admin/login-attempts (frontend/src/pages/admin/LoginAttempts.tsx)
- templates/auth/promote_form.html -> /users/:id/promote (frontend/src/pages/users/PromoteForm.tsx)
- templates/auth/demote_form.html -> /users/:id/demote (frontend/src/pages/users/DemoteForm.tsx)
- templates/auth/confirm_promote_admin.html -> modal or page under /users/:id/promote
- templates/auth/bulk_promote.html -> /admin/bulk-promote (frontend/src/pages/admin/BulkPromote.tsx)
- templates/auth/user_list.html -> /users (frontend/src/pages/users/UserList.tsx)
- templates/auth/user_form.html -> /users/create (frontend/src/pages/users/UserForm.tsx)
- templates/auth/user_detail.html -> /users/:id (frontend/src/pages/users/UserDetail.tsx)
- templates/auth/role_permission_list.html -> /roles/permissions (frontend/src/pages/roles/RolePermissionList.tsx)
- templates/auth/role_permission_form.html -> /roles/permissions/:id (frontend/src/pages/roles/RolePermissionForm.tsx)

- templates/maintenance/history.html -> /maintenance/history (frontend/src/pages/maintenance/MaintenanceHistory.tsx)
- templates/maintenance/log_list.html -> /maintenance/logs (frontend/src/pages/maintenance/MaintenanceLogList.tsx)
- templates/maintenance/predictive_alerts_officer.html -> /predictive/alerts (frontend/src/pages/predictive/PredictiveAlerts.tsx)
- templates/maintenance/officer_log_form.html -> /maintenance/logs/create (frontend/src/pages/maintenance/MaintenanceLogForm.tsx)

- templates/requests/temporary_access_form.html -> /requests/temporary-access/create (frontend/src/pages/requests/TemporaryAccessForm.tsx)


Next steps:
1. Review this mapping and approve or modify priorities.
2. I will implement the first batch: templates under `templates/react/` and a representative dashboard page.
3. Run the frontend dev server to test pages.


