import { defineStore } from 'pinia';
import { ref } from 'vue';
import service from '../api/request';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '');
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));

    // 如果在组件内需要，可以使用简化的路由器推送，
    // 但通常动作返回数据，组件处理重定向。
    // 或者如果导出，我们可以从 main.js 导入路由器。

    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }

    function setUserInfo(info) {
        userInfo.value = info;
        localStorage.setItem('userInfo', JSON.stringify(info));
    }

    async function login(username, password) {
        try {
            const res = await service.post('/auth/login', { username, password }, { skipAuthRefresh: true });
            setToken(res.token);
            setUserInfo(res.user);
            return res; // 将响应返回给组件
        } catch (error) {
            throw error;
        }
    }



    async function logout() {
        try {
            // 调用后端获取消息
            const res = await service.post('/auth/logout');
            // 显示来自后端的消息或默认消息
            const { ElMessage } = await import('element-plus');
            ElMessage.success(res.message || '退出登录成功');
        } catch (e) {
            console.error('Logout API failed', e);
        } finally {
            // 始终清除本地状态
            token.value = '';
            userInfo.value = {};
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
    }

    function hasPermission(permissionCode) {
        // 超级管理员绕过或检查显式权限
        if (userInfo.value.role === 'Admin') return true;
        return userInfo.value.permissions && userInfo.value.permissions.includes(permissionCode);
    }

    return { token, userInfo, login, logout, hasPermission };
});
