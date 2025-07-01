# 用户管理系统

基于TypeScript、Express和React的全栈用户管理系统，实现了用户注册、登录和管理员用户管理功能。
完全基于tare框架的大模型进行的开发。
## 功能特点
- 用户注册与登录（JWT认证）
- 管理员用户列表查看
- 用户状态管理（启用/禁用）
- 用户删除功能
- 基于角色的权限控制

## 技术栈
- **后端**：Node.js, Express, TypeScript, MongoDB, Mongoose
- **前端**：React, TypeScript, React Router, Axios
- **认证**：JWT (JSON Web Tokens)
- **构建工具**：npm, ts-node-dev

## 项目结构
```
/user-management-system
├── /src/backend          # 后端源代码
│   ├── /controllers      # 控制器
│   ├── /middleware       # 中间件
│   ├── /models           # 数据模型
│   ├── /routes           # 路由定义
│   └── index.ts          # 后端入口文件
├── /client               # 前端React应用
│   ├── /public           # 静态资源
│   ├── /src              # 前端源代码
│   │   ├── /services     # API服务
│   │   ├── App.tsx       # 主应用组件
│   │   └── index.tsx     # 前端入口文件
├── .env                  # 环境变量配置
├── package.json          # 项目依赖
└── tsconfig.backend.json # 后端TypeScript配置
```

## 环境要求
- Node.js (v14+) 和 npm
- MongoDB (本地或远程实例)

## 安装与设置

### 1. 克隆仓库
```bash
# 克隆仓库（示例命令）
git clone <repository-url>
cd user-management-system
```

### 2. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 3. 配置环境变量
复制并修改环境变量示例文件：
```bash
cp .env.example .env
```

编辑.env文件，设置以下必要配置：
```
# 服务器配置
PORT=5000
NODE_ENV=development

# MongoDB数据库配置
MONGODB_URI=mongodb://localhost:27017/user-management

# JWT配置
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=24h
```
# 创建管理员账户
```bash
# 注册管理员账户
curl -X POST http://localhost:5000/api/register-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","secretKey":"admin-secret-key"}'
  
npm run register-admin -- --username=admin --password=admin123 --email=admin@example.com
```
## 运行应用

### 开发模式
同时启动后端和前端开发服务器：
```bash
# 启动后端开发服务器（自动重启）
npm run dev:backend

# 打开新终端，启动前端开发服务器
UNSET host && npm start

# 启动前端开发服务器
npm run dev:frontend
```

- 后端API将在 http://localhost:5000 上运行
- 前端应用将在 http://localhost:3000 上运行

### 生产构建
```bash
# 构建后端和前端代码
npm run build

# 启动生产服务器
npm start
```

## API接口文档

### 认证接口
- **注册**：POST /api/register
- **登录**：POST /api/login
- **获取当前用户**：GET /api/users/me

### 管理员接口
- **获取用户列表**：GET /api/users
- **更新用户状态**：PATCH /api/users/:id/status
- **删除用户**：DELETE /api/users/:id

详细的请求和响应格式请参见 `user-api.ts` 文件中的类型定义。

## 许可证
[MIT](LICENSE)