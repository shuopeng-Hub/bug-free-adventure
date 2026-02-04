import axios from 'axios';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const service = axios.create({
    baseURL: 'http://localhost:3000/api', // 后端地址
    timeout: 5000
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        const userStore = useUserStore();
        if (userStore.token) {
            config.headers['Authorization'] = `Bearer ${userStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const msg = error.response?.data?.message || 'Request Failed';
        ElMessage.error(msg);

        if (error.response?.status === 401) {
            // 如果设置了显式标志（如登录），则跳过退出
            if (!error.config.skipAuthRefresh) {
                const userStore = useUserStore();
                userStore.logout();
            }
        }
        return Promise.reject(error);
    }
);

export default service;
