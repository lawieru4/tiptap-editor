# Tiptap Editor

基于 Vue 3.5+ 的高性能富文本编辑器，集成 Tiptap 3、PrimeVue (Styled)、Tailwind CSS 与 TypeScript。支持图片上传、任务列表、代码块等丰富功能。

## 🚀 核心特性

- **Tiptap 3.22+**: 开箱即用的富文本编辑核心，支持多种扩展。
  - 基础文本格式（粗体、斜体、下划线等）
  - 标题、引用、代码块
  - 任务列表（Task List）
  - 图片上传与管理
  - 链接管理
  - 文本对齐
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
- **UI**: PrimeVue 4, Tailwind CSS 3.4, Lucide Icons
- **Editor**: Tiptap 3.22+（核心 + 多个扩展）
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
│   └── modules/        # 业务模块 API (auth.ts)
├── assets/             # 静态资源
├── components/         # 公共组件
│   ├── TiptapEditor.vue      # Tiptap 编辑器组件（核心）
│   └── ImageUploadNode.vue   # 图片上传节点组件
├── extensions/         # Tiptap 自定义扩展
│   └── ImageUpload.ts        # 图片上传扩展
├── hooks/              # 逻辑 Hook
│   └── useUser.ts            # 用户相关逻辑
├── router/             # 路由配置
├── store/              # Pinia 状态
├── types/              # 全局类型定义
└── views/              # 页面视图
    ├── Login.vue             # 登录页面
    └── EditorDemo.vue        # 编辑器演示页面
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
|------|------|
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
  login: (data: LoginReq) => service.post<LoginRes>("/auth/login", data),
};

// src/hooks/useUser.ts
import { useRequest } from 'vue-hooks-plus'
import { AuthService } from '@/api/modules/auth'

const { run, loading } = useRequest(AuthService.login, { manual: true })
```

### 样式策略

优先使用 PrimeVue 组件自带样式。仅在布局排版 (`flex`, `grid`, `m-4`, `p-2`) 时使用 Tailwind CSS。

## 📝 Tiptap 编辑器使用

### 基础使用

在 Vue 组件中使用 TiptapEditor 组件：

```vue
<template>
  <TiptapEditor 
    v-model="editorContent" 
    @update:modelValue="handleContentChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from '@/components/TiptapEditor.vue'

const editorContent = ref('<p>默认内容</p>')

const handleContentChange = (html: string) => {
  console.log('编辑器内容更新:', html)
}
</script>
```

### 支持的功能

- ✅ **文本格式**: 粗体、斜体、下划线、删除线
- ✅ **标题**: H1 - H6
- ✅ **列表**: 有序列表、无序列表、任务列表
- ✅ **代码**: 代码块、内联代码
- ✅ **媒体**: 图片上传与管理
- ✅ **其他**: 链接、引用、水平线、文本对齐

### 自定义扩展

在 `src/extensions/` 目录下创建自定义扩展，例如图片上传：

```typescript
// src/extensions/ImageUpload.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const ImageUpload = Node.create({
  name: 'imageUpload',
  group: 'block',
  // ... 扩展配置
})
```

## 🔒 认证与权限

项目内置登录流程，通过 `Login.vue` 验证用户身份，使用 Pinia Store 管理用户状态。

```typescript
// 在需要身份验证的路由中
const { user } = storeToRefs(useUserStore())
watch(() => user.value, (newUser) => {
  if (!newUser) router.push('/login')
})
```

## 📖 开发指南

### 新增编辑器功能

1. 在 `src/extensions/` 创建新扩展文件
2. 在 `TiptapEditor.vue` 中导入并注册扩展
3. 在编辑器工具栏中添加对应按钮（可选）

### 上传图片

项目集成了图片上传功能，通过 `ImageUploadNode.vue` 组件处理图片管理。上传的图片将通过 API 发送到服务器。

### 类型检查

确保 TypeScript 类型安全：

```bash
npm run type-check
```

## 🐛 常见问题

### 编辑器内容为空

检查 `v-model` 的初始值是否正确传递，以及编辑器是否正确初始化。

### 图片上传失败

确保 API 服务器端点配置正确，检查 `src/api/modules/` 中的上传接口。

### 样式不生效

确认 Tailwind CSS 和 PrimeVue 的样式已正确加载，检查 `main.ts` 中的导入语句。

## 📄 许可证

MIT License
