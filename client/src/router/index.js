import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/',
        name: 'Layout',
        component: () => import('../layout/Layout.vue'),
        meta: { requiresAuth: true },
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/Dashboard.vue')
            },
            {
                path: 'tickets',
                name: 'TicketList',
                component: () => import('../views/TicketList.vue')
            },
            {
                path: 'tickets/:id',
                name: 'TicketDetail',
                component: () => import('../views/TicketDetail.vue')
            },
            {
                path: 'admin/users',
                name: 'UserManagement',
                component: () => import('../views/admin/UserList.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'admin/projects',
                name: 'ProjectManagement',
                component: () => import('../views/admin/ProjectList.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'admin/roles',
                name: 'RoleManagement',
                component: () => import('../views/admin/RoleList.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'admin/menus',
                name: 'MenuManagement',
                component: () => import('../views/admin/MenuList.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '403',
                name: 'Forbidden',
                component: () => import('../views/403.vue')
            }
        ]
    }
];

// 动态导入视图
const modules = import.meta.glob('../views/**/*.vue');

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 辅助函数：将菜单树转换为路由
function generateRoutes(menus) {
    const res = [];
    for (const menu of menus) {
        // 跳过没有组件的目录或项，除非它们有子项（由递归处理）
        // 实际上，我们要扁平化树还是处理嵌套？
        // 让我们为了简单起见假设扁平化路由或嵌套。
        // Vue Router 通常需要在布局子项中使用扁平化，或者嵌套配置。
        // 让我们使用后端的扁平列表或在这里扁平化。 

        if (menu.type === 'menu' && menu.component) {
            const componentPath = `../${menu.component}.vue`; // 规范化路径
            if (modules[componentPath]) {
                const route = {
                    path: menu.path, // 例如：'system/user'
                    name: menu.name, // 确保唯一？
                    component: modules[componentPath],
                    meta: {
                        title: menu.name,
                        icon: menu.icon,
                        code: menu.permission
                    }
                };
                res.push(route);
            } else {
                console.warn(`未找到组件: ${componentPath}`);
            }
        }

        if (menu.children && menu.children.length) {
            res.push(...generateRoutes(menu.children));
        }
    }
    return res;
}

let routesGenerated = false;

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    // 1. 检查登录
    if (to.path === '/login') {
        if (userStore.token) return next('/');
        return next();
    }

    if (!userStore.token) {
        return next('/login');
    }

    // 2. 访问控制与动态路由
    if (!routesGenerated) {
        try {
            // 如果需要，重新获取菜单/用户信息以确保数据新鲜
            // 或者如果持久化，假设存储中有它。
            // 如果存储为空，最好触发特定的“getMenus”操作？
            // 登录存储菜单。如果刷新，存储可能会持久化。

            // 我们需要扁平列表或树。Store 有 `userInfo.menus`。
            // 让我们假设 userStore.userInfo.menus 是树。
            const menus = userStore.userInfo.menus || [];

            // 或者如果为空，获取新的？现在跳过，依靠存储持久性
            if (menus.length === 0) {
                // 也许获取？现在跳过，依靠存储持久性
            }

            const dynamicRoutes = generateRoutes(menus);

            // 添加到布局子项
            dynamicRoutes.forEach(route => {
                // 确保路径正确相对或绝对。
                // 如果 Layout 是 '/'，子路径通常是 'dashboard'。
                // 如果后端发送 '/admin/users'，如果我们想要它是嵌套的，我们可能需要去掉前导斜杠。
                // 让我们去掉前导斜杠。
                const path = route.path.startsWith('/') ? route.path.slice(1) : route.path;

                router.addRoute('Layout', {
                    ...route,
                    path
                });
            });

            // 添加全部捕获 404
            router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/403' });

            routesGenerated = true;
            next({ ...to, replace: true }); // 重启导航
        } catch (error) {
            console.error(error);
            userStore.logout();
            next('/login');
        }
    } else {
        next();
    }
});

export default router;
