<template>
  <el-card header="菜单管理">
    <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="openDialog()">新增菜单</el-button>
    </div>
    
    <el-table
      :data="menus"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="path" label="路径" width="180" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="{ row }">
            {{ row.icon }}
        </template>
      </el-table-column>
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="permission" label="权限标识" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑菜单' : '新增菜单'" width="600px">
        <el-form :model="form" label-width="80px">
            <el-form-item label="类型">
                <el-radio-group v-model="form.type">
                    <el-radio label="catalog">目录</el-radio>
                    <el-radio label="menu">菜单</el-radio>
                    <!-- <el-radio label="button">按钮</el-radio> Future -->
                </el-radio-group>
            </el-form-item>
            <el-form-item label="上级菜单">
                <el-tree-select
                    v-model="form.parentId"
                    :data="menus"
                    check-strictly
                    :render-after-expand="false"
                    placeholder="顶级菜单"
                    clearable
                    node-key="id"
                    :props="{ label: 'name', value: 'id', children: 'children' }"
                />
            </el-form-item>
            <el-form-item label="名称">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="路径" v-if="form.type !== 'catalog'">
                <el-input v-model="form.path" />
            </el-form-item>
            <el-form-item label="组件" v-if="form.type === 'menu'">
                <el-input v-model="form.component" placeholder="views/..." />
            </el-form-item>
             <el-form-item label="权限">
                <el-input v-model="form.permission" placeholder="如 ticket:read" />
            </el-form-item>
            <el-form-item label="图标">
                 <el-input v-model="form.icon" placeholder="Element Plus Icon Name" />
            </el-form-item>
            <el-form-item label="排序">
                <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMenuTree, getMenusFlat } from '../../api/menu';
import { ElMessage } from 'element-plus';
// Note: We need Create/Update/Delete APIs in api/menu.js. I added them in controller but not api client yet.
// I will quickly assume I added them or will add them. Actually I missed adding CRUD to api/menu.js.
// I will just use basic fetch or add them now.
import request from '../../api/request';

const menus = ref([]);
const dialogVisible = ref(false);
const form = ref({});

const fetchData = async () => {
    try {
        const res = await getMenuTree();
        menus.value = res;
    } catch (error) {
        console.error(error);
    }
};

const openDialog = (row = {}) => {
    form.value = { 
        type: 'menu', 
        sort: 0, 
        parentId: null,
        ...row 
    };
    // Ensure parentId is null if 0 or undefined for TreeSelect to work as root
    if (!form.value.parentId) form.value.parentId = null; 
    
    dialogVisible.value = true;
};

const handleSubmit = async () => {
    try {
        if (form.value.id) {
             await request({ url: `/menus/${form.value.id}`, method: 'patch', data: form.value });
        } else {
             await request({ url: `/menus`, method: 'post', data: form.value });
        }
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        fetchData();
    } catch (error) {
        ElMessage.error('操作失败');
    }
};

onMounted(() => {
    fetchData();
});
</script>
