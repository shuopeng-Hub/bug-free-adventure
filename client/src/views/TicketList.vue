<template>
  <div class="ticket-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工单管理</span>
          <el-button type="primary" :icon="Plus" @click="openCreateDrawer">创建工单</el-button>
        </div>
      </template>

      <!-- Search & Filter -->
      <div class="filter-area">
        <el-input v-model="filters.keyword" placeholder="搜索标题/描述" style="width: 200px" clearable />
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 150px; margin-left: 10px">
          <el-option label="待处理" value="Open" />
          <el-option label="处理中" value="Processing" />
          <el-option label="挂起" value="Pending" />
          <el-option label="已关闭" value="Close" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="优先级" clearable style="width: 150px; margin-left: 10px">
          <el-option label="低" value="Low" />
          <el-option label="中" value="Medium" />
          <el-option label="高" value="High" />
          <el-option label="紧急" value="Critical" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="fetchTickets" style="margin-left: 10px">搜索</el-button>
      </div>

      <!-- Table -->
      <el-table :data="ticketList" v-loading="loading" style="width: 100%; margin-top: 20px" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="project.name" label="所属项目" width="150" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitter.name" label="报告人" width="120" />
        <el-table-column prop="handler.name" label="处理人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-area">
         <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          v-model:current-page="page"
          @current-change="fetchTickets"
        />
      </div>
    </el-card>

    <!-- Drawer for Detail would go here -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Plus } from '@element-plus/icons-vue';
import { getTickets } from '../api/ticket';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const ticketList = ref([]);
const total = ref(0);
const page = ref(1);

const filters = reactive({
  keyword: '',
  status: '',
  priority: ''
});

const fetchTickets = async () => {
  loading.value = true;
  try {
    const res = await getTickets({ 
        ...filters, 
        // page: page.value // Pagination not yet implemented on backend, but good to have ready
    });
    // Backend returns array directly for now
    ticketList.value = res;
    total.value = res.length;
  } catch (error) {
    console.error(error);
    ElMessage.error('获取工单列表失败');
  } finally {
    loading.value = false;
  }
};

const getPriorityType = (p) => {
  const map = { Critical: 'danger', High: 'warning', Medium: '', Low: 'info' };
  return map[p] || 'info';
};

const getStatusType = (s) => {
  const map = { Open: 'danger', Processing: 'warning', Pending: 'info', Close: 'success' };
  return map[s] || '';
};

const openCreateDrawer = () => {
    // TODO: Implement Create Logic
    ElMessage.info('创建功能开发中');
};

const viewDetail = (row) => {
    router.push(`/tickets/${row.id}`);
};

const handleEdit = (row) => {
    // For now, edit just redirects to detail
    router.push(`/tickets/${row.id}`);
};

onMounted(() => {
  fetchTickets();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-area {
  margin-bottom: 20px;
}
.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
