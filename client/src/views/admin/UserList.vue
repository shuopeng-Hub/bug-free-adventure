<template>
  <div class="user-list-container">
    <el-card header="用户管理">
        <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>用户管理</span>
                <el-button type="primary" @click="createVisible = true">新增用户</el-button>
            </div>
        </template>
      <el-table :data="users" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="role" label="角色">
           <template #default="{ row }">
             <el-tag :type="row.role === 'Admin' ? 'danger' : 'primary'">{{ row.role }}</el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'Active' ? 'success' : (row.status === 'Pending' ? 'warning' : 'info')">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <template v-if="row.status === 'Pending'">
              <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
            </template>
            <el-button v-else link type="primary" size="small" @click="openRoleDialog(row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-dialog v-model="roleDialogVisible" title="分配角色" width="400px">
        <el-form :model="roleForm">
            <el-form-item label="选择角色">
                <el-select v-model="roleForm.roleName" placeholder="请选择">
                    <el-option v-for="item in roleOptions" :key="item.id" :label="item.displayName" :value="item.name" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="roleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitRole">确定</el-button>
        </template>
      </el-dialog>

    </el-card>

    <el-dialog v-model="createVisible" title="新增用户" width="500px">
        <el-form :model="createForm" :rules="rules" ref="createFormRef" label-width="80px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="createForm.username" />
            </el-form-item>
             <el-form-item label="姓名" prop="name">
                <el-input v-model="createForm.name" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="createForm.password" type="password" show-password />
            </el-form-item>
             <el-form-item label="邮箱">
                <el-input v-model="createForm.email" />
            </el-form-item>
             <el-form-item label="部门">
                <el-input v-model="createForm.department" />
            </el-form-item>
             <el-form-item label="角色" prop="roleName">
                 <el-select v-model="createForm.roleName" placeholder="请选择角色" @visible-change="loadRoles">
                    <el-option v-for="item in roleOptions" :key="item.id" :label="item.displayName" :value="item.name" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="createVisible = false">取消</el-button>
            <el-button type="primary" @click="handleCreate">提交</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUsers, updateUserStatus } from '../../api/admin';
import request from '../../api/request';
import dayjs from 'dayjs';

const users = ref([]);
const loading = ref(false);

const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await getUsers();
        users.value = res.map(u => ({
            ...u,
            createdAt: dayjs(u.createdAt).format('YYYY-MM-DD HH:mm')
        }));
    } catch (error) {
        console.error(error);
        ElMessage.error('获取用户列表失败');
    } finally {
        loading.value = false;
    }
};

const handleApprove = async (row) => {
    try {
        await updateUserStatus(row.id, 'Active');
        ElMessage.success(`用户 ${row.name} 已通过审核`);
        fetchUsers();
    } catch (error) {
        ElMessage.error('操作失败');
    }
};

const handleReject = async (row) => {
    try {
        await updateUserStatus(row.id, 'Rejected');
        ElMessage.warning(`用户 ${row.name} 已被拒绝`);
        fetchUsers();
    } catch (error) {
        ElMessage.error('操作失败');
    }
};

const roleDialogVisible = ref(false);
const createVisible = ref(false);
const roleForm = ref({ userId: null, roleName: '' });
const createForm = ref({ username: '', password: '', name: '', email: '', department: '', roleName: '' });
const roleOptions = ref([]);
const createFormRef = ref(null);

const rules = {
    username: [{ required: true, message: '必填', trigger: 'blur' }],
    password: [{ required: true, message: '必填', trigger: 'blur' }],
    name: [{ required: true, message: '必填', trigger: 'blur' }],
    roleName: [{ required: true, message: '必选', trigger: 'change' }]
};

const loadRoles = async (visible) => {
    if (visible && roleOptions.value.length === 0) {
        const { getRoles } = await import('../../api/role');
        const roles = await getRoles();
        roleOptions.value = roles;
    }
};

const handleCreate = async () => {
    if (!createFormRef.value) return;
    await createFormRef.value.validate(async (valid) => {
        if (valid) {
             try {
                await request({ url: '/users', method: 'post', data: createForm.value });
                ElMessage.success('用户创建成功');
                createVisible.value = false;
                fetchUsers();
            } catch (error) {
                ElMessage.error('创建失败: ' + (error.response?.data?.error || 'Unknown'));
            }
        }
    });
};

const openRoleDialog = async (row) => {
    roleForm.value = { userId: row.id, roleName: row.role === 'Guest' ? '' : row.role };
    roleDialogVisible.value = true;
    loadRoles(true);
};

const submitRole = async () => {
    try {
        await request({
            url: `/users/${roleForm.value.userId}/role`,
            method: 'post',
            data: { roleName: roleForm.value.roleName }
        });
        ElMessage.success('角色分配成功');
        roleDialogVisible.value = false;
        fetchUsers();
    } catch (error) {
        ElMessage.error('分配失败');
    }
};

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}
</style>
