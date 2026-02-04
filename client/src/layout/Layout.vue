<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        router
        :default-active="$route.path"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        class="el-menu-vertical"
      >
        <div class="logo">ITSM 服务台</div>
        
        <template v-for="menu in menuList" :key="menu.id">
            <!-- Leaf Node -->
            <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.path">
                <el-icon v-if="menu.icon">
                    <component :is="getIcon(menu.icon)" />
                </el-icon>
                <span>{{ menu.name }}</span>
            </el-menu-item>

            <!-- Sub Menu -->
            <el-sub-menu v-else :index="menu.path">
                <template #title>
                    <el-icon v-if="menu.icon">
                        <component :is="getIcon(menu.icon)" />
                    </el-icon>
                    <span>{{ menu.name }}</span>
                </template>
                <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
                    <el-icon v-if="child.icon">
                        <component :is="getIcon(child.icon)" />
                    </el-icon>
                    <span>{{ child.name }}</span>
                </el-menu-item>
            </el-sub-menu>
        </template>

      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
           <!-- Breadcrumb could go here -->
           <span>{{ currentRouteName }}</span>
        </div>
        <div class="user-area">
          <el-dropdown>
            <span class="el-dropdown-link">
              {{ userInfo.name }} ({{ userInfo.role === 'Admin' ? '管理员' : (userInfo.role === 'Handler' ? '处理人' : '提交人') }})
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Odometer, Ticket, ArrowDown, User, Folder, Monitor as Management, List, Setting, Lock, Menu as MenuIcon } from '@element-plus/icons-vue';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { getMenuTree } from '../api/menu';

const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);
const route = useRoute();
const menuList = ref([]);

const iconMap = {
    'Odometer': Odometer,
    'Ticket': Ticket,
    'List': List,
    'Setting': Setting,
    'User': User,
    'Lock': Lock,
    'Menu': MenuIcon,
    'Folder': Folder,
    'Management': Management
};

const getIcon = (name) => iconMap[name] || Odometer;

onMounted(async () => {
    try {
        menuList.value = await getMenuTree();
    } catch (e) {
        console.error('Failed to load menu', e);
    }
});

const routeNameMap = {
  'Dashboard': '工作台',
  'TicketList': '工单管理',
  'TicketDetail': '工单详情',
  'UserManagement': '用户管理',
  'ProjectManagement': '项目管理'
};

const currentRouteName = computed(() => {
  return routeNameMap[route.name] || route.name;
});

const logout = () => {
  userStore.logout();
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-menu-vertical {
  height: 100%;
  border-right: none;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  background-color: #002140;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
}
.main-content {
  background-color: #f0f2f5; /* Standard Admin Gray Background */
  padding: 20px;
}
.breadcrumb span {
  font-size: 14px;
  color: #97a8be;
}
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
