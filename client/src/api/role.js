import request from './request';

export const getRoles = () => {
    return request({
        url: '/roles',
        method: 'get'
    });
};

export const getAllPermissions = () => {
    return request({
        url: '/roles/permissions',
        method: 'get'
    });
};

export const updateRolePermissions = (id, perms) => {
    return request({
        url: `/roles/${id}/permissions`,
        method: 'patch',
        data: { perms }
    });
};
