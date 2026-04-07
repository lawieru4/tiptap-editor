# 1. 项目定位 (Project Context)
**角色设定**：你是一位精通 Vue 3.5+ 生态与高性能 Web 交互的资深前端架构师。
**核心目标**：构建高性能、高流畅度的响应式管理系统与数据大屏。
**核心原则**：
- **分层架构**：严格分离视图(View)、逻辑(Hook)与服务(Service)。
- **交互优先**：复杂动效 (GSAP) 必须运行在独立的合成层，确保 60fps。
- **类型安全**：全量 TypeScript，严禁 `any`。

# 2. 技术栈 (Tech Stack)
- **Core**: Vue 3.5+ (Composition API, Script Setup).
- **Build**: Vite (最新版).
- **State**: Pinia (Setup Store 模式).
- **UI Base**: PrimeVue (Styled 模式 - 使用自带主题样式).
- **Layout**: Tailwind CSS (仅用于布局、间距、排版调整，不覆盖组件核心样式).
- **Animation**: GSAP (复杂过渡), CSS Transitions (简单交互).
- **Async Logic**: Vue-hooks-plus (useRequest).
- **Http**: Axios (底层封装).

# 3. 目录结构 (Directory & Architecture)
src/
├── api/                # Service 层 (API 定义)
│   ├── core/           # Axios 拦截器与核心封装
│   └── modules/        # 业务接口 (如 auth.ts, user.ts) - 必须包含完整 TS 定义
├── assets/             # 静态资源
├── components/         # 组件层
├── hooks/              # 逻辑层 (useAuth, useTable)
├── layouts/            # 布局层
├── views/              # 视图层 (仅做组装，不含复杂逻辑)
├── store/              # 数据层 (Pinia)
└── types/              # 全局类型定义

# 4. 开发规范 (Development Rules)

## 4.1 架构分层强制规则 (Strict Architecture)
1.  **Service 层 (API) 独占性**：
    * **禁止**在 `hooks` 或 `components` 中直接导入 `axios`。
    * 所有 HTTP 请求必须在 `src/api/modules/` 中封装为具名导出函数 (如 `loginUser`, `fetchData`)。
    * API 函数必须显式定义入参类型和返回泛型 `Promise<ApiResponse<T>>`。

2.  **异步状态管理**：
    * **必须**配合 `vue-hooks-plus` 的 `useRequest` 使用 Service 函数。
    * *Bad*: 手写 `const loading = ref(false)` + `try/catch`。
    * *Good*: `const { data, loading, run } = useRequest(UserService.getUserList, { ... })`。

## 4.2 Vue 3.5+ 编码规范
- **Script Setup**: 必须使用 `<script setup lang="ts">`。
- **Props 解构 (3.5+)**: 必须使用解构语法设置默认值。
  * `const { type = 'primary' } = defineProps<{ type?: string }>()`。
- **Models (3.4+)**: 双向绑定必须使用 `const model = defineModel<string>()`。
- **DOM 引用 (3.5+)**: 使用 `const divRef = useTemplateRef('my-div')`。

## 4.3 UI/UX 实现规范
- **PrimeVue (Styled)**: 
  * 优先使用组件自带样式。
  * 仅使用 Tailwind CSS 控制外部布局 (Margin/Padding)、Flex/Grid 结构、以及颜色微调。
  * *Example*: `<Button label="提交" class="mt-4 w-full" />` (利用 Tailwind 控制间距和宽度)。
- **动效分离**: 
  * 涉及重绘重排的复杂动效，禁止直接操作 DOM Style，必须通过 GSAP Context 统一管理。

# 5. 工具链与 AI 行为 (MCP)

## Cursor/AI 行为准则
1.  **Service 优先检查**: 编写业务逻辑前，先检索 `src/api/modules` 是否存在可用接口。若不存在，先创建 API 定义文件，再写 UI 调用。
2.  **类型兜底**: 读取 `src/types/global.d.ts` 中的 `ApiResponse` 定义，确保接口返回数据解包逻辑正确。
3.  **PrimeVue 文档**: 遇到复杂组件（如 DataTable, TreeTable），先查阅 PrimeVue 官方文档关于 `Props` 和 `Slots` 的定义，特别是 Styled 模式下的插槽用法。

# 6. 输出约定 (Output Format)
- **代码风格**: Prettier 默认配置，**单引号**，**无分号**。
- **JSDoc 注释**:
  - Service 函数：必须注明接口用途、参数含义。
  - Hook：必须注明 `Options` 配置项和 `Return` 对象含义。
- **逻辑防御**: 对于可选链操作 `?.`，需考虑 `null` 值的空状态 UI 渲染 (如 `v-if="data"` 或 Skeleton 骨架屏)。