/**
 * Role-based permission definitions for the Smart Mess Management System.
 *
 * Roles:
 *  - admin       : full access to all features
 *  - manager     : same dashboard as admin, restricted on user role changes
 *  - kitchen     : kitchen dashboard only
 *  - student     : student dashboard only
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  KITCHEN: 'kitchen',
  STUDENT: 'student',
};

/** Pages each role is allowed to access */
export const ROLE_ROUTES = {
  [ROLES.ADMIN]: ['/admin-manager', '/admin-manager/users', '/admin-manager/students', '/admin-manager/menus', '/admin-manager/meal-plans', '/admin-manager/subscriptions', '/admin-manager/meal-bookings', '/admin-manager/attendance', '/admin-manager/billing', '/admin-manager/payments', '/admin-manager/inventory', '/admin-manager/wastage', '/admin-manager/feedback', '/admin-manager/complaints', '/admin-manager/announcements', '/admin-manager/notifications', '/admin-manager/reports', '/admin-manager/settings', '/admin-manager/audit-logs'],
  [ROLES.MANAGER]: ['/admin-manager', '/admin-manager/students', '/admin-manager/menus', '/admin-manager/meal-plans', '/admin-manager/subscriptions', '/admin-manager/meal-bookings', '/admin-manager/attendance', '/admin-manager/billing', '/admin-manager/payments', '/admin-manager/inventory', '/admin-manager/wastage', '/admin-manager/feedback', '/admin-manager/complaints', '/admin-manager/announcements', '/admin-manager/notifications', '/admin-manager/reports', '/admin-manager/settings'],
  [ROLES.KITCHEN]: ['/kitchen', '/kitchen/preparation', '/kitchen/attendance', '/kitchen/inventory', '/kitchen/wastage', '/kitchen/tasks'],
  [ROLES.STUDENT]: ['/student', '/student/menu', '/student/bookings', '/student/meal-history', '/student/subscription', '/student/billing', '/student/payments', '/student/feedback', '/student/complaints', '/student/notifications', '/student/profile'],
};

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: [ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.ADMIN],
  VIEW_USERS: [ROLES.ADMIN, ROLES.MANAGER],

  // Menu
  MANAGE_MENUS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_MENUS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN, ROLES.STUDENT],

  // Meal plans & subscriptions
  MANAGE_MEAL_PLANS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_SUBSCRIPTIONS: [ROLES.ADMIN, ROLES.MANAGER],

  // Bookings
  MANAGE_BOOKINGS: [ROLES.ADMIN, ROLES.MANAGER],
  CREATE_OWN_BOOKING: [ROLES.STUDENT],

  // Billing & Payments
  MANAGE_BILLING: [ROLES.ADMIN, ROLES.MANAGER],
  RECORD_PAYMENT: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_OWN_BILLING: [ROLES.STUDENT],

  // Inventory
  MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN],
  VIEW_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN],

  // Wastage
  RECORD_WASTAGE: [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN],

  // Feedback & Complaints
  MANAGE_FEEDBACK: [ROLES.ADMIN, ROLES.MANAGER],
  SUBMIT_FEEDBACK: [ROLES.STUDENT],

  // Announcements
  MANAGE_ANNOUNCEMENTS: [ROLES.ADMIN, ROLES.MANAGER],

  // Reports
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],

  // Settings
  MANAGE_SETTINGS: [ROLES.ADMIN],

  // Audit
  VIEW_AUDIT_LOGS: [ROLES.ADMIN],
};

/**
 * Check if a role has the given permission.
 * @param {string} role
 * @param {string[]} allowedRoles - array of roles that have the permission
 * @returns {boolean}
 */
export function hasPermission(role, allowedRoles) {
  return allowedRoles.includes(role);
}

/**
 * Get the default redirect path after login based on role.
 * @param {string} role
 * @returns {string}
 */
export function getDefaultRoute(role) {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.MANAGER:
      return '/admin-manager';
    case ROLES.KITCHEN:
      return '/kitchen';
    case ROLES.STUDENT:
      return '/student';
    default:
      return '/login';
  }
}

/**
 * Check if a role is allowed to access the admin/manager dashboard.
 */
export function isAdminOrManager(role) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}
