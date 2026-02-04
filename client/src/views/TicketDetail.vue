<template>
  <div class="ticket-detail-container">
    <!-- Status Steps -->
    <el-card class="status-card">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="新建 (Open)" description="用户提交工单" />
        <el-step title="处理中 (Processing)" description="工程师接单处理" />
        <el-step title="挂起 (Pending)" description="等待反馈或配件" />
        <el-step title="已关闭 (Close)" description="问题解决" />
      </el-steps>
    </el-card>

    <div class="main-content">
      <el-row :gutter="20">
        <!-- Left: Ticket Info -->
        <el-col :span="16">
          <el-card header="工单详情">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="标题">{{ ticket.title }}</el-descriptions-item>
              <el-descriptions-item label="工单编号">#{{ ticket.id }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag>{{ ticket.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="优先级">{{ ticket.priority }}</el-descriptions-item>
              <el-descriptions-item label="所属项目">{{ ticket.project }}</el-descriptions-item>
              <el-descriptions-item label="提交人">{{ ticket.submitter }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ ticket.handler || '未分配' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ ticket.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">
                {{ ticket.description }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- Action Buttons for Handler/Admin -->
            <div class="actions" v-if="canHandle">
              <el-button type="primary" @click="handleAction('Processing')">接单 / 开始处理</el-button>
              <el-button type="warning" @click="handleAction('Pending')">挂起</el-button>
              <el-button type="success" @click="handleAction('Close')">解决 / 关闭</el-button>
            </div>
          </el-card>
        </el-col>

        <!-- Right: Flow/Logs -->
        <el-col :span="8">
          <el-card header="处理记录">
             <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :timestamp="activity.timestamp"
                  :type="activity.type"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getTicketById, updateTicketStatus } from '../api/ticket';
import dayjs from 'dayjs';

const userStore = useUserStore();
const route = useRoute();
const ticketId = route.params.id;

const ticket = ref({});
const activities = ref([]);

const fetchTicketDetail = async () => {
  try {
    const res = await getTicketById(ticketId);
    if (res) {
        // Backend structure adaptation
        ticket.value = {
            ...res,
            project: res.project?.name,
            submitter: res.submitter?.name,
            handler: res.handler?.name,
            createdAt: dayjs(res.createdAt).format('YYYY-MM-DD HH:mm:ss')
        };
        
        // Map logs to activities
        activities.value = res.logs?.map(log => ({
            content: `${log.operator.name} ${log.action}: ${log.details || ''}`,
            timestamp: dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            type: log.action === 'Status Changed' ? 'warning' : 'primary'
        })) || [];
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取工单详情失败');
  }
};

const activeStep = computed(() => {
  const map = { 'Open': 1, 'Processing': 2, 'Pending': 2, 'Close': 4 };
  return map[ticket.value.status] || 0;
});

const canHandle = computed(() => {
  return userStore.hasPermission('ticket:handle');
});

const handleAction = (newStatus) => {
  ElMessageBox.prompt('请输入处理备注', '更新状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({ value }) => {
    try {
        await updateTicketStatus(ticketId, { status: newStatus, comment: value });
        ElMessage.success('状态已更新');
        fetchTicketDetail(); // Refresh data
    } catch (error) {
        ElMessage.error('更新失败');
    }
  }).catch(() => {});
}

onMounted(() => {
    fetchTicketDetail();
});
</script>

<style scoped>
.ticket-detail-container {
  padding: 20px;
}
.status-card {
  margin-bottom: 20px;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
