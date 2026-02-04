<template>
  <div class="project-list-container">
    <el-card header="项目管理">
      <div style="margin-bottom: 20px; text-align: right;">
        <el-button type="primary" @click="dialogVisible = true">新建项目</el-button>
      </div>

      <el-table :data="projects" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="description" label="项目描述" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新建项目" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProjects, createProject, deleteProject } from '../../api/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

const dialogVisible = ref(false);
const form = ref({ name: '', description: '' });
const projects = ref([]);
const loading = ref(false);

const fetchProjects = async () => {
    loading.value = true;
    try {
        const res = await getProjects();
        projects.value = res.map(p => ({
            ...p,
            createdAt: dayjs(p.createdAt).format('YYYY-MM-DD')
        }));
    } catch (error) {
        ElMessage.error('获取项目列表失败');
    } finally {
        loading.value = false;
    }
};

const handleCreate = async () => {
  if (!form.value.name) return ElMessage.warning('请输入项目名称');
  
  try {
      await createProject(form.value);
      ElMessage.success('创建成功');
      dialogVisible.value = false;
      form.value = { name: '', description: '' };
      fetchProjects();
  } catch (error) {
      ElMessage.error('创建失败');
  }
};

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该项目吗?', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await deleteProject(row.id);
            ElMessage.success('删除成功');
            fetchProjects();
        } catch (error) {
            ElMessage.error('删除失败');
        }
    }).catch(() => {});
}

onMounted(() => {
    fetchProjects();
});
</script>

<style scoped>
.project-list-container {
  padding: 20px;
}
</style>
