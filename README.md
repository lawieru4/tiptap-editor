# AI Client Template

基于 Vue 3.5+ 高性能企业级前端脚手架，集成 PrimeVue (Styled)、Tailwind CSS、Pinia 与 TypeScript。

## 🚀 核心特性

- **Vue 3.5+**: 利用最新的 Composition API, `defineModel`, `props destructuring` 等特性。
- **高性能构建**: 基于 Vite 5，配置了 Gzip 压缩、代码分包 (Code Splitting) 与可视化分析。
- **UI 架构**:
  - **PrimeVue (Styled)**: 负责核心组件交互与基础样式。
  - **Tailwind CSS**: 负责布局系统、间距与微调。
- **分层架构**: 严格遵循 View (视图) - Hook (逻辑) - Service (服务) 分层设计。
- **类型安全**: 全量 TypeScript，提供完善的 API 类型定义。
- **状态管理**: 封装 Pinia Store。
- **异步管理**: 集成 `vue-hooks-plus` (useRequest) 管理异步状态。

## 🛠️ 技术栈

- **Core**: Vue 3.5+, TypeScript 5.5+
- **Build**: Vite 5
- **UI**: PrimeVue 4, Tailwind CSS 3.4
- **State**: Pinia 2.2
- **Router**: Vue Router 4.4
- **Network**: Axios 1.7
- **Hooks**: vue-hooks-plus
- **Icons**: PrimeIcons

## 📂 目录结构

```
src/
├── api/                # Service 层 (API 定义)
│   ├── core/           # Axios 核心封装 (拦截器/类型)
│   └── modules/        # 业务模块 API
├── assets/             # 静态资源
├── components/         # 公共组件
├── hooks/              # 逻辑 Hook (useUser, etc.)
├── layouts/            # 布局组件
├── router/             # 路由配置
├── store/              # Pinia 状态
├── types/              # 全局类型定义
└── views/              # 页面视图 (Login, Dashboard)
```

## 📦 快速开始

### 1. 安装依赖

推荐使用 `pnpm` 或 `npm`。

```bash
npm install
# 或者
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问: `http://localhost:5173`

### 3. 构建生产环境

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，并自动生成 gzip 压缩文件与 `stats.html` 分析报告。

## 🔧 常用脚本

| 命令 | 说明 |
|Data | Description|
| `npm run dev` | 启动开发服务器 (自动打开浏览器) |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run type-check` | 独立运行 TypeScript 类型检查 |
| `npm run clean` | **清理**：删除 `node_modules`, `dist`, `pnpm-lock.yaml` |
| `npm run reinstall` | **重装**：执行清理并重新安装依赖 |

## 📐 开发规范

### Service 层调用

禁止在组件中直接调用 Axios。必须在 `src/api/modules` 中定义 Service，并配合 `useRequest` 使用。

```typescript
// src/api/modules/auth.ts
export const AuthService = {
  login: (data) => service.post("/login", data),
};

// src/hooks/useUser.ts
const { run, loading } = useRequest(AuthService.login, { manual: true });
```

### 样式策略

优先使用 PrimeVue 组件自带样式。仅在布局排版 (`flex`, `grid`, `m-4`, `p-2`) 时使用 Tailwind CSS。
