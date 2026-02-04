# ITSM 服务台项目

这是一个基于 Vue 3 + Node.js (Express) + Prisma (SQLite) 的 IT 运维服务台管理系统。
支持完整的 RBAC（基于角色的访问控制）权限管理，包括菜单、角色和用户的动态配置。

## 🛠️ 技术栈

- **前端**: Vue 3, Vite, Element Plus, Pinia, Vue Router
- **后端**: Node.js, Express, JWT Authentication
- **数据库**: SQLite (通过 Prisma ORM 管理)

## 🚀 快速开始

请按照以下步骤启动项目：

### 1. 启动后端 (Server)

打开终端 (Terminal)，进入 `server` 目录并运行：

```bash
cd server

# 安装依赖
npm install

# 初始化数据库 (如果第一次运行)
npx prisma db push

# 启动服务
npm run dev
```

后端服务将运行在: `http://localhost:3000`

### 2. 启动前端 (Client)

打开一个新的终端窗口，进入 `client` 目录并运行：

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端页面将运行在: `http://localhost:5173` (具体端口请查看终端输出)

## 🔑 登录说明

- **登录页**: 打开浏览器访问前端地址 (如 `http://localhost:5173`)。
- **账号**: 使用您在数据库中创建的账号登录。
  - 如果是全新环境，您可能需要通过数据库种子脚本或直接操作数据库来创建一个初始管理员账号。
  - 也可以使用后端提供的 `userController` 接口进行初始用户创建。

## 📂 项目结构

- **client/**: 前端 Vue 项目代码
  - `src/api`: 接口请求封装
  - `src/views`: 页面组件
  - `src/router`: 路由配置 (支持动态路由)
  - `src/stores`: 状态管理
- **server/**: 后端 Express 项目代码
  - `prisma/`: 数据库模型定义 (`schema.prisma`)
  - `src/controllers`: 业务逻辑
  - `src/routes`: 路由定义

## 📝 常见问题

1.  **登录报错 400/401**?
    - 请检查用户名密码是否正确。
    - 检查后端服务是否正常运行。
2.  **菜单不显示**?
    - 登录后侧边栏是根据用户角色动态加载的。
    - 请确保当前登录用户的角色已在【系统管理】->【角色管理】中配置了相应的菜单权限。

祝不需要修 Bug！🎉
