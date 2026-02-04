<template>
  <div class="login-wrapper">
    <!-- 左侧：品牌与信息 -->
    <div class="login-left">
      <div class="left-content">
        <div class="logo-box">
          <el-icon :size="40" color="#fff"><Monitor /></el-icon>
          <span class="logo-text">ITSM 服务台</span>
        </div>
        <h1 class="big-title">企业级 IT 运维管理平台</h1>
        <p class="subtitle">全方位的工单管理解决方案，助您提升运维效率。</p>
        <ul class="features-list">
          <li><el-icon><Check /></el-icon> 高效工单追踪</li>
          <li><el-icon><Check /></el-icon> 实时状态更新</li>
          <li><el-icon><Check /></el-icon> 无缝团队协作</li>
        </ul>
      </div>
      <div class="copyright">© 2026 IT Service Desk. All Rights Reserved.</div>
      <!-- 背景装饰 -->
      <div class="bg-decoration"></div>
    </div>

    <!-- 右侧：登录表单 -->
    <div class="login-right">
      <div class="form-container">
        <h2 class="welcome-text">欢迎回来</h2>
        <p class="welcome-sub">请输入您的账号信息以继续</p>
        
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" size="large" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              prefix-icon="Lock" 
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button link type="primary">忘记密码？</el-button>
          </div>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Postcard, Monitor, Check } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const loginFormRef = ref(null);
const regFormRef = ref(null);

const activeTab = ref('login'); // 保留以兼容样式，或者可以移除
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({ username: '', password: '' });

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await userStore.login(loginForm.username, loginForm.password);
        ElMessage.success('登录成功');
        router.push('/');
      } catch (error) {
        // 全局处理
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
/* 重置布局以避免溢出 */
.login-wrapper {
  position: fixed; /* 强制固定在视口 */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 100; /* 确保在最上层 */
}

/* 左侧样式 */
.login-left {
  width: 40%; /* 改为百分比以获得更好比例 */
  min-width: 450px;
  max-width: 600px;
  background: linear-gradient(150deg, #1e3c72 0%, #2a5298 100%);
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 80px; /* 增加内边距 */
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
  z-index: 2;
  flex: none; /* 禁用伸缩以保持宽度 */
}

.left-content {
  position: relative;
  z-index: 3;
}

.logo-box {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
  letter-spacing: 1px;
}

.big-title {
  font-size: 36px; /* Adjusted slightly */
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 40px;
  line-height: 1.6;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.features-list .el-icon {
  margin-right: 10px;
  background: rgba(255,255,255,0.2);
  padding: 4px;
  border-radius: 50%;
}

.copyright {
  position: absolute;
  bottom: 30px; /* 固定在底部 */
  left: 80px;   /* 匹配容器内边距 */
  font-size: 12px;
  opacity: 0.5;
  z-index: 10;
}

.bg-decoration {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(255,255,255,0.05) 0%, transparent 20%);
  pointer-events: none;
}

/* 右侧样式 */
.login-right {
  flex: 1;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.form-container {
  width: 420px;
  padding: 40px;
}

.welcome-text {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.welcome-sub {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}



.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  margin-top: -10px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
}

/* 移动端适配 */
@media (max-width: 900px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    background: #f0f2f5; 
  }

  .form-container {
    width: 100%;
    max-width: 400px;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
  }
}
</style>
