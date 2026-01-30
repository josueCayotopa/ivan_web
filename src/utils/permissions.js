// src/utils/permissions.js - SISTEMA DE PERMISOS

/**
 * Normaliza un rol eliminando acentos y espacios extra
 */
const normalizeRole = (role) => {
    if (!role) return '';
    return role
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .trim();
};

/**
 * Definición de roles del sistema
 */
export const ROLES = {
    ATENCION_CLIENTE: 'Atención al cliente',
    DOCTOR: 'Doctor',
    ADMIN: 'admin',
    ADMINISTRADOR: 'Administrador'
};

/**
 * Mapeo de permisos por rol
 */
const PERMISSIONS_MAP = {
    // ATENCIÓN AL CLIENTE
    'ATENCION AL CLIENTE': {
        dashboard: { view: true },
        pacientes: { view: true, create: true, edit: true, delete: false },
        atenciones: { view: true, create: true, edit: true, delete: true },
        consultas: { view: false, create: false, edit: false, delete: false },
        medicos: { view: true, create: false, edit: false, delete: false },
        usuarios: { view: false, create: false, edit: false, delete: false }
    },
    
    // DOCTOR
    'DOCTOR': {
        dashboard: { view: true },
        pacientes: { view: true, create: false, edit: false, delete: false },
        atenciones: { view: true, create: false, edit: false, delete: false }, // Solo sus atenciones
        consultas: { view: true, create: true, edit: true, delete: false },
        medicos: { view: false, create: false, edit: false, delete: false },
        usuarios: { view: false, create: false, edit: false, delete: false }
    },
    
    // ADMIN
    'ADMIN': {
        dashboard: { view: true },
        pacientes: { view: true, create: true, edit: true, delete: true },
        atenciones: { view: true, create: true, edit: true, delete: true },
        consultas: { view: true, create: true, edit: true, delete: true },
        medicos: { view: true, create: true, edit: true, delete: true },
        usuarios: { view: false, create: false, edit: false, delete: false }
    },
    
    // ADMINISTRADOR
    'ADMINISTRADOR': {
        dashboard: { view: true },
        pacientes: { view: true, create: true, edit: true, delete: true },
        atenciones: { view: true, create: true, edit: true, delete: true },
        consultas: { view: true, create: true, edit: true, delete: true },
        medicos: { view: true, create: true, edit: true, delete: true },
        usuarios: { view: true, create: true, edit: true, delete: true }
    }
};

/**
 * Obtiene el rol del usuario desde localStorage
 */
export const getUserRole = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        const user = JSON.parse(userStr);
        return user?.rolName || user?.roles?.[0]?.name || null;
    } catch (error) {
        console.error('Error obteniendo rol del usuario:', error);
        return null;
    }
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 * @returns {boolean}
 */
export const hasRole = (allowedRoles) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRoleNormalized = normalizeRole(userRole);
    
    return roles.some(role => normalizeRole(role) === userRoleNormalized);
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {string} module - Módulo (ej: 'pacientes', 'atenciones')
 * @param {string} action - Acción (ej: 'view', 'create', 'edit', 'delete')
 * @returns {boolean}
 */
export const hasPermission = (module, action) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    const roleNormalized = normalizeRole(userRole);
    const permissions = PERMISSIONS_MAP[roleNormalized];
    
    if (!permissions) return false;
    if (!permissions[module]) return false;
    
    return permissions[module][action] === true;
};

/**
 * Verifica si el usuario puede ver un módulo
 * @param {string} module - Módulo a verificar
 * @returns {boolean}
 */
export const canView = (module) => hasPermission(module, 'view');

/**
 * Verifica si el usuario puede crear en un módulo
 * @param {string} module - Módulo a verificar
 * @returns {boolean}
 */
export const canCreate = (module) => hasPermission(module, 'create');

/**
 * Verifica si el usuario puede editar en un módulo
 * @param {string} module - Módulo a verificar
 * @returns {boolean}
 */
export const canEdit = (module) => hasPermission(module, 'edit');

/**
 * Verifica si el usuario puede eliminar en un módulo
 * @param {string} module - Módulo a verificar
 * @returns {boolean}
 */
export const canDelete = (module) => hasPermission(module, 'delete');

/**
 * Verifica si el usuario es administrador
 * @returns {boolean}
 */
export const isAdmin = () => hasRole([ROLES.ADMIN, ROLES.ADMINISTRADOR]);

/**
 * Verifica si el usuario es super administrador
 * @returns {boolean}
 */
export const isSuperAdmin = () => hasRole(ROLES.ADMINISTRADOR);

/**
 * Verifica si el usuario es doctor
 * @returns {boolean}
 */
export const isDoctor = () => hasRole(ROLES.DOCTOR);

/**
 * Verifica si el usuario es atención al cliente
 * @returns {boolean}
 */
export const isAtencionCliente = () => hasRole(ROLES.ATENCION_CLIENTE);

/**
 * Obtiene todos los permisos del usuario actual
 * @returns {object}
 */
export const getUserPermissions = () => {
    const userRole = getUserRole();
    if (!userRole) return {};
    
    const roleNormalized = normalizeRole(userRole);
    return PERMISSIONS_MAP[roleNormalized] || {};
};

/**
 * Hook personalizado para React
 * Uso: const permissions = usePermissions();
 */
export const usePermissions = () => {
    return {
        role: getUserRole(),
        hasRole,
        hasPermission,
        canView,
        canCreate,
        canEdit,
        canDelete,
        isAdmin: isAdmin(),
        isSuperAdmin: isSuperAdmin(),
        isDoctor: isDoctor(),
        isAtencionCliente: isAtencionCliente(),
        permissions: getUserPermissions()
    };
};

export default {
    ROLES,
    getUserRole,
    hasRole,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isSuperAdmin,
    isDoctor,
    isAtencionCliente,
    getUserPermissions,
    usePermissions
};