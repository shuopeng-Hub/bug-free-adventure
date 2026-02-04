import request from './request';

// User Management
export const getUsers = () => {
    return request({
        url: '/users',
        method: 'get'
    });
};

export const updateUserStatus = (id, status) => {
    return request({
        url: `/users/${id}/approve`,
        method: 'patch',
        data: { status }
    });
};

// Project Management
export const getProjects = () => {
    return request({
        url: '/projects',
        method: 'get'
    });
};

export const createProject = (data) => {
    return request({
        url: '/projects',
        method: 'post',
        data
    });
};

export const deleteProject = (id) => {
    return request({
        url: `/projects/${id}`,
        method: 'delete'
    });
};
