export const API_VERSION = 'v1';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  SUPPORT: 'support',
  CUSTOMER: 'customer',
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
} as const;

export const FILE_SIZE_LIMITS = {
  maxFileSizeMB: 200,
  maxTotalSizeMB: 1000,
  maxFilesPerQuote: 50,
} as const;

export const QUOTE_TIMEOUTS = {
  '3d_fff': 60,
  '3d_sla': 60,
  'cnc_3axis': 120,
  'laser_2d': 60,
} as const;

export const DEFAULT_QUOTE_VALIDITY_DAYS = 14;

export const MATERIAL_DENSITIES = {
  // 3D Printing (g/cm³)
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.05,
  'Resin Standard': 1.15,
  // CNC Materials (g/cm³)
  'Al 6061': 2.7,
  'Steel 1018': 7.87,
  'Acrylic': 1.18,
} as const;

export const CO2E_FACTORS = {
  // Grid CO₂e (kg/kWh)
  grid: {
    MX: 0.42,
    US: 0.38,
  },
  // Material CO₂e (kg/kg)
  materials: {
    PLA: 1.6,
    PETG: 3.0,
    ABS: 3.5,
    'Resin Standard': 6.0,
    'Al 6061': 10.0,
    'Steel 1018': 2.1,
    'Acrylic': 6.3,
  },
  // Logistics (kg CO₂e per kg·km)
  logistics: 0.0002,
} as const;

export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  UNAUTHORIZED: 'AUTH003',
  FORBIDDEN: 'AUTH004',
  
  // Validation
  VALIDATION_ERROR: 'VAL001',
  INVALID_FILE_TYPE: 'VAL002',
  FILE_TOO_LARGE: 'VAL003',
  
  // Business Logic
  QUOTE_EXPIRED: 'BIZ001',
  MARGIN_VIOLATION: 'BIZ002',
  STOCK_UNAVAILABLE: 'BIZ003',
  GEOMETRY_PARSE_ERROR: 'BIZ004',
  
  // System
  INTERNAL_ERROR: 'SYS001',
  SERVICE_UNAVAILABLE: 'SYS002',
  RATE_LIMIT_EXCEEDED: 'SYS003',
} as const;