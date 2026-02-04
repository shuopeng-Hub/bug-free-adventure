<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <h2>工作台</h2>
      <div class="date-display">{{ currentDate }}</div>
    </div>

    <!-- Stats Overview -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.bgColor, color: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-number">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Main Content -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- Chart Section -->
      <el-col :span="16">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span>工单趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="Week">近一周</el-radio-button>
                <el-radio-button label="Month">近一月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="mainChartRef" style="height: 380px; width: 100%;"></div>
        </el-card>
      </el-col>

      <!-- Notification/Activity Section -->
      <el-col :span="8">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-tag type="danger" effect="plain" size="small">3 待处理</el-tag>
            </div>
          </template>
          <div class="todo-list">
            <div class="todo-item" v-for="i in 5" :key="i">
              <el-checkbox v-model="todoList[i-1]">审核新用户注册申请 #100{{i}}</el-checkbox>
              <span class="todo-time">10:{{10+i}}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { Ticket, Timer, CircleCheck, DataLine } from '@element-plus/icons-vue';
import { getDashboardStats } from '../api/dashboard';
import { ElMessage } from 'element-plus';

const currentDate = dayjs().format('YYYY-MM-DD dddd');
const timeRange = ref('Week');
const mainChartRef = ref(null);
const todoList = reactive([false, false, false, false, false]); // TODO: Fetch real tasks

const stats = ref([
  { title: '待处理工单', value: '0', icon: 'Ticket', color: '#409EFF', bgColor: '#ecf5ff' },
  { title: '处理中', value: '0', icon: 'Timer', color: '#E6A23C', bgColor: '#fdf6ec' },
  { title: '本周解决', value: '0', icon: 'CircleCheck', color: '#67C23A', bgColor: '#f0f9eb' },
  { title: '平均耗时 (h)', value: '-', icon: 'DataLine', color: '#909399', bgColor: '#f4f4f5' },
]);

let chartInstance = null;

const fetchData = async () => {
  try {
    const res = await getDashboardStats();
    if (res && res.stats) {
       stats.value[0].value = res.stats.open;
       stats.value[1].value = res.stats.processing;
       stats.value[2].value = res.stats.closedThisWeek;
       stats.value[3].value = res.stats.avgResponseTime;
    }
    
    if (res && res.chart) {
       initChart(res.chart.categories, res.chart.data);
    } else {
       initChart([], []);
    }
  } catch (error) {
    console.error(error);
    // ElMessage.error('Failed to load dashboard data');
  }
};

const initChart = (categories, data) => {
  if (chartInstance) {
      chartInstance.dispose();
  }
  chartInstance = echarts.init(mainChartRef.value);
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: true, // Bar chart usually better with gap
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '工单数',
        type: 'bar', // Changed to bar as per backend logic
        barWidth: '40%',
        data: data,
        itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#8cc5ff' }
            ]),
            borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', () => chartInstance && chartInstance.resize());
});
</script>

<style scoped>
/* Global Dashboard Styles */
.dashboard-container :deep(.el-card) {
  border-radius: 12px;
  border: none; /* Remove default border for cleaner look */
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px 30px;
  border-radius: 16px; /* Softer rounded corners */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); /* Subtle shadow */
}

/* Stats Cards */
.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden; /* Ensure content respects radius */
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); /* Softer float effect */
}
.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 5px;
}
.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px; /* Match softer aesthetic */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  transition: transform 0.3s;
}
.stat-card:hover .stat-icon {
  transform: scale(1.1);
}
.stat-info {
  text-align: right;
}
.stat-title {
  font-size: 15px;
  color: #8c8c8c;
  margin-bottom: 8px;
}
.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Chart & List */
.content-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.todo-list .todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}
.todo-list .todo-item:last-child {
  border-bottom: none;
}
.todo-time {
  font-size: 12px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
