import { AppError } from '../utils/app-error.js'
import { ROLES, PERMISSIONS } from '../constants/roles.js'

/**
 * Middleware to restrict access based on user roles
 * @param {Array} allowedRoles - Array of role IDs that are allowed to access the route
 * @returns {Function} Express middleware
 */
export const restrictToRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.user || req.user.user_type === undefined) {
            return next(new AppError('User not authenticated or role not defined', 401))
        }

        // Check if user's role is in the allowed roles
        if (!allowedRoles.includes(req.user.user_type)) {
            return next(new AppError("You don't have permission to perform this action", 403))
        }

        // User has permission, proceed to the next middleware
        return next()
    }
}

/**
 * Middleware to restrict access based on permissions
 * @param {String} permission - Permission key from PERMISSIONS object
 * @returns {Function} Express middleware
 */
export const hasPermission = (permission) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.user || req.user.user_type === undefined) {
            return next(new AppError('User not authenticated or role not defined', 401))
        }

        // Check if the permission exists
        if (!PERMISSIONS[permission]) {
            return next(new AppError(`Permission ${permission} not defined`, 500))
        }

        // Check if user's role has the required permission
        if (!PERMISSIONS[permission].includes(req.user.user_type)) {
            return next(new AppError("You don't have permission to perform this action", 403))
        }

        // User has permission, proceed to the next middleware
        return next()
    }
}

/**
 * Check if a user has a specific permission
 * @param {Number} userRole - User's role ID
 * @param {String} permission - Permission key from PERMISSIONS object
 * @returns {Boolean} Whether the user has the permission
 */
export const checkPermission = (userRole, permission) => {
    if (!PERMISSIONS[permission]) {
        return false
    }

    return PERMISSIONS[permission].includes(userRole)
}

/**
 * Get all permissions for a specific role
 * @param {Number} roleId - Role ID
 * @returns {Array} Array of permission keys that the role has
 */
export const getRolePermissions = (roleId) => {
    return Object.entries(PERMISSIONS)
        .filter(([_, roles]) => roles.includes(roleId))
        .map(([permission, _]) => permission)
}

/**
 * Helper function to get role name from role ID
 * @param {Number} roleId - Role ID
 * @returns {String|null} Role name or null if not found
 */
export const getRoleName = (roleId) => {
    const role = Object.entries(ROLES).find(([_, id]) => id === roleId)
    return role ? role[0] : null
}
