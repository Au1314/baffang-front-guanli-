/**
 * 权限工具函数
 */

/**
 * 检查当前用户是否有指定权限
 * @param {string|Array} permission 权限字符串或数组
 * @param {string} mode 'or' 满足任意一个权限即可, 'and' 需要满足所有权限
 * @returns {boolean}
 */
export function checkPermission(permission, mode = 'or') {
    const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const userRole = localStorage.getItem('userRole') || '1';
    
    // 超级管理员拥有所有权限
    if (userRole === '0') {
        return true;
    }
    
    if (!permission) {
        return true;
    }
    
    if (Array.isArray(permission)) {
        if (mode === 'and') {
            return permission.every(perm => userPermissions.includes(perm));
        } else {
            return permission.some(perm => userPermissions.includes(perm));
        }
    } else if (typeof permission === 'string') {
        return userPermissions.includes(permission);
    }
    
    return false;
}

/**
 * 检查当前用户是否有指定角色
 * @param {string|Array} role 角色字符串或数组
 * @returns {boolean}
 */
export function checkRole(role) {
    const userRole = localStorage.getItem('userRole') || '1';
    
    if (Array.isArray(role)) {
        return role.includes(userRole);
    } else if (typeof role === 'string') {
        return role === userRole;
    }
    
    return false;
}

/**
 * 获取当前用户权限列表
 * @returns {Array}
 */
export function getPermissions() {
    return JSON.parse(localStorage.getItem('permissions') || '[]');
}

/**
 * 获取当前用户角色
 * @returns {string}
 */
export function getRole() {
    return localStorage.getItem('userRole') || '1';
}

/**
 * 判断当前用户是否是超级管理员
 * @returns {boolean}
 */
export function isSuperAdmin() {
    return localStorage.getItem('userRole') === '0';
}

/**
 * 判断当前用户是否是数据管理员
 * @returns {boolean}
 */
export function isDataAdmin() {
    return localStorage.getItem('userRole') === '1';
}

/**
 * 获取当前用户信息
 * @returns {Object}
 */
export function getUserInfo() {
    return {
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        role: localStorage.getItem('userRole'),
        deptId: localStorage.getItem('deptId'),
        permissions: JSON.parse(localStorage.getItem('permissions') || '[]')
    };
}

/**
 * 设置用户权限信息
 * @param {Object} userInfo 用户信息
 */
export function setUserInfo(userInfo) {
    if (userInfo.token) {
        localStorage.setItem('token', userInfo.token);
    }
    if (userInfo.userId) {
        localStorage.setItem('userId', userInfo.userId);
    }
    if (userInfo.username) {
        localStorage.setItem('username', userInfo.username);
    }
    if (userInfo.role) {
        localStorage.setItem('userRole', userInfo.role);
    }
    if (userInfo.deptId) {
        localStorage.setItem('deptId', userInfo.deptId);
    }
    if (userInfo.permissions) {
        localStorage.setItem('permissions', JSON.stringify(userInfo.permissions));
    }
}

/**
 * 清除用户权限信息
 */
export function clearUserInfo() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('deptId');
    localStorage.removeItem('permissions');
}