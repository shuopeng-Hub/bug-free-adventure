import request from './request';

// Get ticket list with optional filters
export const getTickets = (params) => {
    return request({
        url: '/tickets',
        method: 'get',
        params
    });
};

// Get single ticket details
export const getTicketById = (id) => {
    return request({
        url: `/tickets/${id}`,
        method: 'get'
    });
};

// Create new ticket
export const createTicket = (data) => {
    return request({
        url: '/tickets',
        method: 'post',
        data
    });
};

// Update ticket status
export const updateTicketStatus = (id, data) => {
    return request({
        url: `/tickets/${id}/status`,
        method: 'patch',
        data
    });
};
