<template>
  <div class="role-list-container">
    <el-card header="角色权限管理">
        <div style="margin-bottom: 20px; text-align: right;">
            <el-button type="primary" @click="createVisible = true">新增角色</el-button>
        </div>
      <el-table :data="roles" border stripe v-loading="loading">
        <el-table-column prop="name" label="角色标识" width="150" />
        <el-table-column prop="displayName" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="权限" min-width="300">
            <template #default="{ row }">
                <el-tag v-for="perm in row.perms" :key="perm" style="margin-right: 5px; margin-bottom: 5px">
                    {{ perm }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openConfig(row)">配置权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createVisible" title="新增角色" width="400px">
        <el-form :model="createForm" label-width="80px">
            <el-form-item label="标识">
                <el-input v-model="createForm.name" placeholder="Admin" />
            </el-form-item>
            <el-form-item label="显示名">
                <el-input v-model="createForm.displayName" placeholder="管理员" />
            </el-form-item>
             <el-form-item label="描述">
                <el-input v-model="createForm.description" />
            </el-form-item>
        </el-form>
        <template #footer>
             <el-button @click="createVisible = false">取消</el-button>
             <el-button type="primary" @click="handleCreate">提交</el-button>
        </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" title="配置权限与菜单" size="50%">
        <template #header>
            <h4>{{ currentRole?.displayName }} 配置</h4>
        </template>
        
        <el-tabs v-model="activeTab">
            <el-tab-pane label="菜单权限" name="menu">
                 <el-tree
                    ref="menuTreeRef"
                    :data="menuTree"
                    show-checkbox
                    node-key="id"
                    :props="{ label: 'name', children: 'children' }"
                    default-expand-all

                />
                 <div style="margin-top: 10px; text-align: right;">
                    <el-button type="primary" @click="saveMenus">保存菜单配置</el-button>
                </div>
            </el-tab-pane>
            <el-tab-pane label="功能权限" name="perm">
                <el-tree
                    ref="permTreeRef"
                    :data="permissionTree"
                    show-checkbox
                    node-key="code"
                    :props="{ label: 'description', children: 'children' }"
                    default-expand-all
                />
                 <div style="margin-top: 10px; text-align: right;">
                    <el-button type="primary" @click="savePermissions">保存功能权限</el-button>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getRoles, getAllPermissions, updateRolePermissions } from '../../api/role';
import { getMenuTree } from '../../api/menu';
import request from '../../api/request';

const roles = ref([]);
const allPerms = ref([]);
const menuTree = ref([]);
const loading = ref(false);
const drawerVisible = ref(false);
const createVisible = ref(false);
const activeTab = ref('menu');

const currentRole = ref(null);
const permTreeRef = ref(null);
const menuTreeRef = ref(null);
const createForm = ref({ name: '', displayName: '', description: '' });

// Group permissions for Tree
const permissionTree = computed(() => {
    // Simple grouping by prefix (ticket:read -> Group Ticket)
    const groups = {};
    allPerms.value.forEach(p => {
        const prefix = p.code.split(':')[0];
        if (!groups[prefix]) groups[prefix] = { code: prefix, description: prefix.toUpperCase() + ' Management', children: [] };
        groups[prefix].children.push(p);
    });
    return Object.values(groups);
});

const fetchRoles = async () => {
    loading.value = true;
    try {
        roles.value = await getRoles();
    } catch (error) {
        ElMessage.error('加载角色失败');
    } finally {
        loading.value = false;
    }
};

const handleCreate = async () => {
    try {
        await request({ url: '/roles', method: 'post', data: createForm.value });
        ElMessage.success('创建成功');
        createVisible.value = false;
        fetchRoles();
    } catch (error) {
        ElMessage.error('创建失败');
    }
};

const openConfig = async (row) => {
    currentRole.value = row;
    // Load perms and menus if not loaded
    if (allPerms.value.length === 0) {
        allPerms.value = await getAllPermissions();
    }
    if (menuTree.value.length === 0) {
        menuTree.value = await getMenuTree();
    }
    
    drawerVisible.value = true;
    
    // Set checked keys
    nextTick(() => {
        if(permTreeRef.value) permTreeRef.value.setCheckedKeys(row.perms);
        if(menuTreeRef.value) menuTreeRef.value.setCheckedKeys(row.menus || []);
    });
};

const saveMenus = async () => {
    try {
        // getCheckedKeys + getHalfCheckedKeys for full tree preservation? 
        // For Filter logic in backend we typically need the exact IDs.
        // check-strictly=true on read, but false on write? 
        // With check-strictly=true, we just get what is clicked.
        const checkedKeys = menuTreeRef.value.getCheckedKeys();
        const halfChecked = menuTreeRef.value.getHalfCheckedKeys();
        const allIds = [...checkedKeys, ...halfChecked];
        
        await request({
            url: `/roles/${currentRole.value.id}/menus`,
            method: 'patch',
            data: { menuIds: allIds }
        });
        
        ElMessage.success('菜单配置更新成功');
        // Refresh roles to update local state?
        fetchRoles(); 
    } catch (error) {
        ElMessage.error('保存菜单失败');
    }
};

const savePermissions = async () => {
    try {
        const checkedKeys = permTreeRef.value.getCheckedKeys(true); 
        const realPerms = checkedKeys.filter(k => k.includes(':'));
        
        await updateRolePermissions(currentRole.value.id, realPerms);
        ElMessage.success('功能权限更新成功');
        fetchRoles();
    } catch (error) {
        ElMessage.error('保存权限失败');
    }
}

onMounted(() => {
    fetchRoles();
});
</script>

<style scoped>
.role-list-container {
  padding: 20px;
}
</style>
