// Quote related enums
export enum QuoteStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  AUTO_QUOTED = 'auto_quoted',
  NEEDS_REVIEW = 'needs_review',
  QUOTED = 'quoted',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  IN_PRODUCTION = 'in_production',
  QC = 'qc',
  SHIPPED = 'shipped',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum QuoteObjective {
  PROTOTYPE = 'PROTOTYPE',
  PRODUCTION = 'PRODUCTION',
  TOOLING = 'TOOLING',
  SPARE_PARTS = 'SPARE_PARTS',
}

// User and auth related enums
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  SUPPORT = 'support',
  CUSTOMER = 'customer',
}

// Process types
export enum ProcessType {
  FFF = 'FFF',
  SLA = 'SLA',
  SLS = 'SLS',
  MJF = 'MJF',
  CNC_3AXIS = 'CNC_3AXIS',
  CNC_5AXIS = 'CNC_5AXIS',
  LASER_2D = 'LASER_2D',
  SHEET_METAL = 'SHEET_METAL',
}

// Financial enums
export enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  EUR = 'EUR',
}

// Audit enums
export enum AuditEntity {
  USER = 'user',
  QUOTE = 'quote',
  QUOTE_ITEM = 'quote_item',
  CUSTOMER = 'customer',
  MATERIAL = 'material',
  MACHINE = 'machine',
  PRICING_RULE = 'pricing_rule',
  MARGIN = 'margin',
  DISCOUNT_RULE = 'discount_rule',
  SHIPPING_RATE = 'shipping_rate',
  TENANT = 'tenant',
  PAYMENT = 'payment',
  FILE = 'file',
  SESSION = 'session',
  CONFIG = 'config',
  SETTINGS = 'settings',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  VIEW = 'view',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  APPROVE = 'approve',
  REJECT = 'reject',
  ACCEPT = 'accept',
  CANCEL = 'cancel',
  SEND = 'send',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  CONFIG_CHANGE = 'config_change',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
}

// Order enums
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

// Material enums
export enum MaterialCategory {
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
  COMPOSITE = 'COMPOSITE',
  CERAMIC = 'CERAMIC',
  RESIN = 'RESIN',
  WOOD = 'WOOD',
}

// File enums
export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}
