import { lazy } from 'react'

// Lazy-loaded page components
const Login            = lazy(() => import('@/pages/auth/Login'))
const Register         = lazy(() => import('@/pages/auth/Register'))
const UserDashboard    = lazy(() => import('@/pages/dashboard/UserDashboard'))
const OfficerDashboard = lazy(() => import('@/pages/dashboard/OfficerDashboard'))
const ManagerDashboard = lazy(() => import('@/pages/dashboard/ManagerDashboard'))
const AdminDashboard   = lazy(() => import('@/pages/dashboard/AdminDashboard'))
const SuperAdminDashboard = lazy(() => import('@/pages/dashboard/SuperAdminDashboard'))
const TicketList       = lazy(() => import('@/pages/tickets/TicketList'))
const TicketDetail     = lazy(() => import('@/pages/tickets/TicketDetail'))
const CreateTicket     = lazy(() => import('@/pages/tickets/CreateTicket'))
const AssetList        = lazy(() => import('@/pages/assets/AssetList'))
const AssetDetail      = lazy(() => import('@/pages/assets/AssetDetail'))
const CreateAsset      = lazy(() => import('@/pages/assets/CreateAsset'))
const UserList         = lazy(() => import('@/pages/users/UserList'))
const UserDetail       = lazy(() => import('@/pages/users/UserDetail'))
const DepartmentList   = lazy(() => import('@/pages/departments/DepartmentList'))
const InventoryList    = lazy(() => import('@/pages/inventory/InventoryList'))
const ReportList       = lazy(() => import('@/pages/reports/ReportList'))
const NotificationList = lazy(() => import('@/pages/notifications/NotificationList'))
const AuditLog         = lazy(() => import('@/pages/audit/AuditLog'))
const Settings         = lazy(() => import('@/pages/settings/Settings'))
const Profile          = lazy(() => import('@/pages/profile/Profile'))

export const pageRegistry: Record<string, React.LazyExoticComponent<any>> = {
  'login':              Login,
  'register':           Register,
  'user-dashboard':     UserDashboard,
  'officer-dashboard':  OfficerDashboard,
  'manager-dashboard':  ManagerDashboard,
  'admin-dashboard':    AdminDashboard,
  'superadmin-dashboard': SuperAdminDashboard,
  'ticket-list':        TicketList,
  'ticket-detail':      TicketDetail,
  'create-ticket':      CreateTicket,
  'asset-list':         AssetList,
  'asset-detail':       AssetDetail,
  'create-asset':       CreateAsset,
  'user-list':          UserList,
  'user-detail':        UserDetail,
  'department-list':    DepartmentList,
  'inventory-list':     InventoryList,
  'report-list':        ReportList,
  'notification-list':  NotificationList,
  'audit-log':          AuditLog,
  'settings':           Settings,
  'profile':            Profile,
}

export function getPage(name: string) {
  return pageRegistry[name] ?? null
}
