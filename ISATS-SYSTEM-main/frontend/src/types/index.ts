// ─── User & Auth ─────────────────────────────────────────
export type UserRole = 
  | 'User' 
  | 'Technician' 
  | 'ICT Officer' 
  | 'Supervisor' 
  | 'HOD' 
  | 'Manager' 
  | 'Admin' 
  | 'SuperAdmin'
  | 'PlatformAdmin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_staff: boolean;
  is_superuser: boolean;
  department?: Department;
  phone_number?: string;
  date_joined?: string;
  last_login?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ─── Department & Category ────────────────────────────────
export interface Department {
  id: number;
  name: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

// ─── Device Type ──────────────────────────────────────────
export interface DeviceType {
  id: number;
  name: string;
  code: string;
  category_name: string;
  category_slug?: string;
  is_custom: boolean;
  icon?: string;
}

// ─── Asset ───────────────────────────────────────────────
export type AssetStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Disposed';
export type AssetPriority = 'Low' | 'Medium' | 'High';

export interface Asset {
  asset_id: string;
  asset_tag: string;
  serial_number: string;
  asset_name: string;
  asset_type: string;
  device_type?: DeviceType | null;
  category: Category | null;
  department: Department | null;
  status: AssetStatus;
  model: string;
  manufacturer: string;
  purchase_date: string | null;
  warranty_expiry: string | null;
  vendor_name: string;
  location: string;
  assigned_to: User | null;
  qr_code_image: string;
  barcode_image: string;
  risk_score?: number;
  usage_index?: number;
  condition_status?: string;
  priority_level?: AssetPriority;
  last_maintenance_date?: string | null;
  created_at?: string;
}

// ─── Ticket ───────────────────────────────────────────────
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Awaiting User' | 'Resolved' | 'Closed';

export interface Ticket {
  id: number;
  title?: string;
  asset: Asset | null;
  category?: Category | null;
  user: User;
  submitted_by?: User;
  assigned_to: User | null;
  priority: TicketPriority;
  description: string;
  image?: string | null;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
  closed_at: string | null;
  resolved_at?: string | null;
}

// ─── Inventory ────────────────────────────────────────────
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  reorder_level: number;
  description: string;
}

// ─── Maintenance ──────────────────────────────────────────
export interface MaintenanceRecord {
  id: number;
  asset: Asset;
  maintenance_type: string;
  description: string;
  cost?: number;
  scheduled_date: string;
  completed_date?: string | null;
  status: string;
  performed_by?: User | null;
}

// ─── Audit Log ────────────────────────────────────────────
export interface AuditLog {
  id: number;
  user: User | null;
  action: string;
  object_type: string;
  object_id?: string;
  description: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  timestamp: string;
  details?: any;
}

// ─── Notifications ────────────────────────────────────────
export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Pagination ───────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Dashboard Stats ──────────────────────────────────────
export interface DashboardStats {
  total_users?: number;
  active_assets?: number;
  open_tickets?: number;
  low_inventory_count?: number;
  total_assets?: number;
  pending_tickets?: number;
  maintenance_count?: number;
  recent_tickets?: Ticket[];
  recent_assets?: Asset[];
  [key: string]: any;
}
