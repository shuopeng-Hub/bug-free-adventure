<template>
  <div class="forbidden-page">
    <el-result
      icon="warning"
      title="403 Forbidden"
      sub-title="您没有权限访问该页面，请联系管理员。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.forbidden-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
