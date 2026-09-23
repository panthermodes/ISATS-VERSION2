import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'
import type { UserRole } from '@/types'

// Public & Onboarding
const LandingPage      = React.lazy(() => import('@/pages/public/LandingPage'))
const Features         = React.lazy(() => import('@/pages/public/Features'))
const Pricing          = React.lazy(() => import('@/pages/public/Pricing'))
const About            = React.lazy(() => import('@/pages/public/About'))
const Contact          = React.lazy(() => import('@/pages/public/Contact'))
const OnboardingWizard = React.lazy(() => import('@/pages/onboarding/OnboardingWizard'))

// Auth
const Login            = React.lazy(() => import('@/pages/auth/Login'))
const Register         = React.lazy(() => import('@/pages/auth/Register'))
const ForgotPassword   = React.lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword    = React.lazy(() => import('@/pages/auth/ResetPassword'))

// ─── 9 Primary Role Dashboards ──────────────────────────────
const UserDashboard        = React.lazy(() => import('@/pages/dashboard/UserDashboard'))
const TechnicianDashboard  = React.lazy(() => import('@/pages/dashboard/TechnicianDashboard'))
const OfficerDashboard     = React.lazy(() => import('@/pages/dashboard/OfficerDashboard'))
const SupervisorDashboard  = React.lazy(() => import('@/pages/dashboard/SupervisorDashboard'))
const HODDashboard         = React.lazy(() => import('@/pages/dashboard/HODDashboard'))
const ManagerDashboard     = React.lazy(() => import('@/pages/dashboard/ManagerDashboard'))
const AdminDashboard       = React.lazy(() => import('@/pages/dashboard/AdminDashboard'))
const SuperAdminDashboard  = React.lazy(() => import('@/pages/dashboard/SuperAdminDashboard'))
const PlatformDashboard    = React.lazy(() => import('@/pages/platform/PlatformDashboard'))

// Operational App
const TicketList       = React.lazy(() => import('@/pages/tickets/TicketList'))
const TicketDetail     = React.lazy(() => import('@/pages/tickets/TicketDetail'))
const CreateTicket     = React.lazy(() => import('@/pages/tickets/CreateTicket'))

// Assets Lifecycle & Tracking
const AssetList        = React.lazy(() => import('@/pages/assets/AssetList'))
const AssetDetail      = React.lazy(() => import('@/pages/assets/AssetDetail'))
const CreateAsset      = React.lazy(() => import('@/pages/assets/CreateAsset'))
const AcknowledgePolicy = React.lazy(() => import('@/pages/assets/AcknowledgePolicy'))
const ScanAsset        = React.lazy(() => import('@/pages/assets/ScanAsset'))
const AssetMovementHistory = React.lazy(() => import('@/pages/assets/AssetMovementHistory'))
const AssetMovementForm = React.lazy(() => import('@/pages/assets/AssetMovementForm'))
const AssetUsageList   = React.lazy(() => import('@/pages/assets/AssetUsageList'))
const AssetUsageForm   = React.lazy(() => import('@/pages/assets/AssetUsageForm'))
const AssetAssignmentForm = React.lazy(() => import('@/pages/assets/AssetAssignmentForm'))
const AssetTransferForm = React.lazy(() => import('@/pages/assets/AssetTransferForm'))
const AssetReturnForm  = React.lazy(() => import('@/pages/assets/AssetReturnForm'))
const PrintAssetLabel  = React.lazy(() => import('@/pages/assets/PrintAssetLabel'))
const BatchPrintLabels = React.lazy(() => import('@/pages/assets/BatchPrintLabels'))

// Requisitions & Access Requests
const AssetRequestList = React.lazy(() => import('@/pages/requests/AssetRequestList'))
const AssetRequestForm = React.lazy(() => import('@/pages/requests/AssetRequestForm'))
const TemporaryAccessForm = React.lazy(() => import('@/pages/requests/TemporaryAccessForm'))

// Maintenance & Diagnostics
const PredictiveAlerts = React.lazy(() => import('@/pages/maintenance/PredictiveAlerts'))
const MaintenanceHistory = React.lazy(() => import('@/pages/maintenance/MaintenanceHistory'))
const MaintenanceLogForm = React.lazy(() => import('@/pages/maintenance/MaintenanceLogForm'))

// Users, Categories & Roles
const UserList         = React.lazy(() => import('@/pages/users/UserList'))
const UserDetail       = React.lazy(() => import('@/pages/users/UserDetail'))
const CreateUser       = React.lazy(() => import('@/pages/users/CreateUser'))
const PromoteUser      = React.lazy(() => import('@/pages/users/PromoteUser'))
const DemoteUser       = React.lazy(() => import('@/pages/users/DemoteUser'))
const BulkPromote      = React.lazy(() => import('@/pages/users/BulkPromote'))
const CategoryList     = React.lazy(() => import('@/pages/categories/CategoryList'))
const CategoryForm     = React.lazy(() => import('@/pages/categories/CategoryForm'))
const DepartmentList   = React.lazy(() => import('@/pages/departments/DepartmentList'))
const RolePermissionList = React.lazy(() => import('@/pages/roles/RolePermissionList'))

// Inventory, Reports, Notifications & Settings
const InventoryList    = React.lazy(() => import('@/pages/inventory/InventoryList'))
const ReportList       = React.lazy(() => import('@/pages/reports/ReportList'))
const NotificationList = React.lazy(() => import('@/pages/notifications/NotificationList'))
const AuditLog         = React.lazy(() => import('@/pages/audit/AuditLog'))
const Settings         = React.lazy(() => import('@/pages/settings/Settings'))
const DeviceCatalogSettings = React.lazy(() => import('@/pages/settings/DeviceCatalogSettings'))
const Profile          = React.lazy(() => import('@/pages/profile/Profile'))
const SubscriptionDashboard = React.lazy(() => import('@/pages/subscription/SubscriptionDashboard'))

// PantherMode Master Platform Administration
const Organizations        = React.lazy(() => import('@/pages/platform/Organizations'))
const PlatformPlans        = React.lazy(() => import('@/pages/platform/PlatformPlans'))
const PlatformSubscriptions = React.lazy(() => import('@/pages/platform/PlatformSubscriptions'))
const PlatformPayments     = React.lazy(() => import('@/pages/platform/PlatformPayments'))
const PlatformDeviceCatalogue = React.lazy(() => import('@/pages/platform/PlatformDeviceCatalogue'))
const PlatformAudit        = React.lazy(() => import('@/pages/platform/PlatformAudit'))
const PlatformSettings     = React.lazy(() => import('@/pages/platform/PlatformSettings'))

const dashboardByRole: Record<UserRole, React.LazyExoticComponent<any>> = {
  'User':          UserDashboard,
  'Technician':    TechnicianDashboard,
  'ICT Officer':   OfficerDashboard,
  'Supervisor':    SupervisorDashboard,
  'HOD':           HODDashboard,
  'Manager':       ManagerDashboard,
  'Admin':         AdminDashboard,
  'SuperAdmin':    SuperAdminDashboard,
  'PlatformAdmin': PlatformDashboard,
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-48 space-y-3">
        <Skeleton variant="rect" height="16px" />
        <Skeleton count={3} />
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function DashboardRoute() {
  const { user } = useAuth()
  const Dashboard = user ? dashboardByRole[user.role] || UserDashboard : UserDashboard
  return <Dashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />

          {/* Authentication */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Protected App Routes */}
          <Route path="/app"              element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
          <Route path="/dashboard"        element={<RequireAuth><DashboardRoute /></RequireAuth>} />
          
          {/* Tickets */}
          <Route path="/tickets"          element={<RequireAuth><TicketList /></RequireAuth>} />
          <Route path="/tickets/create"   element={<RequireAuth><CreateTicket /></RequireAuth>} />
          <Route path="/tickets/:id"      element={<RequireAuth><TicketDetail /></RequireAuth>} />

          {/* Assets */}
          <Route path="/assets"           element={<RequireAuth><AssetList /></RequireAuth>} />
          <Route path="/assets/create"    element={<RequireAuth><CreateAsset /></RequireAuth>} />
          <Route path="/assets/batch-print" element={<RequireAuth><BatchPrintLabels /></RequireAuth>} />
          <Route path="/assets/scan"      element={<RequireAuth><ScanAsset /></RequireAuth>} />
          <Route path="/assets/scan/:code" element={<RequireAuth><ScanAsset /></RequireAuth>} />
          <Route path="/assets/movements" element={<RequireAuth><AssetMovementHistory /></RequireAuth>} />
          <Route path="/assets/usage"     element={<RequireAuth><AssetUsageList /></RequireAuth>} />
          <Route path="/assets/usage/create" element={<RequireAuth><AssetUsageForm /></RequireAuth>} />
          <Route path="/asset-usage"      element={<RequireAuth><AssetUsageList /></RequireAuth>} />
          <Route path="/assets/assign"    element={<RequireAuth><AssetAssignmentForm /></RequireAuth>} />
          <Route path="/assets/:id"       element={<RequireAuth><AssetDetail /></RequireAuth>} />
          <Route path="/assets/:id/acknowledge-policy" element={<RequireAuth><AcknowledgePolicy /></RequireAuth>} />
          <Route path="/assets/:id/movements" element={<RequireAuth><AssetMovementHistory /></RequireAuth>} />
          <Route path="/assets/:id/move"  element={<RequireAuth><AssetMovementForm /></RequireAuth>} />
          <Route path="/assets/:id/print" element={<RequireAuth><PrintAssetLabel /></RequireAuth>} />
          <Route path="/assets/:id/assign" element={<RequireAuth><AssetAssignmentForm /></RequireAuth>} />
          <Route path="/assets/:id/transfer" element={<RequireAuth><AssetTransferForm /></RequireAuth>} />
          <Route path="/assets/:id/return" element={<RequireAuth><AssetReturnForm /></RequireAuth>} />
          <Route path="/assets/:id/usage" element={<RequireAuth><AssetUsageList /></RequireAuth>} />

          {/* Requisitions */}
          <Route path="/requests"         element={<RequireAuth><AssetRequestList /></RequireAuth>} />
          <Route path="/requests/create"  element={<RequireAuth><AssetRequestForm /></RequireAuth>} />
          <Route path="/requests/temporary-access" element={<RequireAuth><TemporaryAccessForm /></RequireAuth>} />
          <Route path="/asset-requests"   element={<RequireAuth><AssetRequestList /></RequireAuth>} />

          {/* Maintenance */}
          <Route path="/maintenance/predictive" element={<RequireAuth><PredictiveAlerts /></RequireAuth>} />
          <Route path="/maintenance/history" element={<RequireAuth><MaintenanceHistory /></RequireAuth>} />
          <Route path="/maintenance/logs/create" element={<RequireAuth><MaintenanceLogForm /></RequireAuth>} />

          {/* Users & Roles */}
          <Route path="/users"            element={<RequireAuth><UserList /></RequireAuth>} />
          <Route path="/users/create"     element={<RequireAuth><CreateUser /></RequireAuth>} />
          <Route path="/users/bulk-promote" element={<RequireAuth><BulkPromote /></RequireAuth>} />
          <Route path="/users/:id"        element={<RequireAuth><UserDetail /></RequireAuth>} />
          <Route path="/users/:id/promote" element={<RequireAuth><PromoteUser /></RequireAuth>} />
          <Route path="/users/:id/demote" element={<RequireAuth><DemoteUser /></RequireAuth>} />
          <Route path="/roles"            element={<RequireAuth><RolePermissionList /></RequireAuth>} />

          {/* Departments & Categories */}
          <Route path="/departments"      element={<RequireAuth><DepartmentList /></RequireAuth>} />
          <Route path="/categories"       element={<RequireAuth><CategoryList /></RequireAuth>} />
          <Route path="/categories/create" element={<RequireAuth><CategoryForm /></RequireAuth>} />

          {/* Inventory, Reports & System */}
          <Route path="/inventory"        element={<RequireAuth><InventoryList /></RequireAuth>} />
          <Route path="/reports"          element={<RequireAuth><ReportList /></RequireAuth>} />
          <Route path="/notifications"    element={<RequireAuth><NotificationList /></RequireAuth>} />
          <Route path="/audit"            element={<RequireAuth><AuditLog /></RequireAuth>} />
          <Route path="/settings"                 element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/settings/device-catalog"  element={<RequireAuth><DeviceCatalogSettings /></RequireAuth>} />
          <Route path="/profile"                  element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/subscription"     element={<RequireAuth><SubscriptionDashboard /></RequireAuth>} />

          {/* PantherMode Master Platform Administration */}
          <Route path="/platform" element={<RequireAuth><PlatformDashboard /></RequireAuth>} />
          <Route path="/platform/dashboard" element={<RequireAuth><PlatformDashboard /></RequireAuth>} />
          <Route path="/platform/organizations" element={<RequireAuth><Organizations /></RequireAuth>} />
          <Route path="/platform/plans" element={<RequireAuth><PlatformPlans /></RequireAuth>} />
          <Route path="/platform/subscriptions" element={<RequireAuth><PlatformSubscriptions /></RequireAuth>} />
          <Route path="/platform/payments" element={<RequireAuth><PlatformPayments /></RequireAuth>} />
          <Route path="/platform/device-catalogue" element={<RequireAuth><PlatformDeviceCatalogue /></RequireAuth>} />
          <Route path="/platform/audit" element={<RequireAuth><PlatformAudit /></RequireAuth>} />
          <Route path="/platform/settings" element={<RequireAuth><PlatformSettings /></RequireAuth>} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
