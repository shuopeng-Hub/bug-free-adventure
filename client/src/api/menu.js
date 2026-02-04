import request from './request';

export const getMenuTree = () => {
    return request({
        url: '/menus/tree',
        method: 'get'
    });
};

export const getMenusFlat = () => {
    return request({
        url: '/menus',
        method: 'get'
    });
}
