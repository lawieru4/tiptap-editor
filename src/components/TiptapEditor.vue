<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Undo2, Redo2, Heading, Heading1, Heading2, Heading3, Heading4, List, ListOrdered, ListTodo, Bold, Italic, 
  Strikethrough, Code, Underline as UnderlineIcon, Eraser, Link as LinkIcon, 
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, MoonStar, Sun, Quote, FileCode, ChevronDown, CornerDownLeft, ExternalLink, Trash, ImagePlus
} from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Image from '@tiptap/extension-image'
import ImageUpload from '@/extensions/ImageUpload'

const props = withDefaults(defineProps<{
  modelValue: string
  height?: number | string
  onUploadImg?: (file: File) => Promise<string>
}>(), {
  height: 500
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
    }),
    Underline,
    Subscript,
    Superscript,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: 'Write something …',
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    ImageUpload.configure({
      uploadFn: props.onUploadImg
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none max-w-full min-h-[300px] p-6',
    },
  },
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const linkMenuRef = ref(null)
const isLinkMenuOpen = ref(false)
const linkUrl = ref('')

onClickOutside(linkMenuRef, () => {
  isLinkMenuOpen.value = false
})

const openLinkMenu = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  linkUrl.value = previousUrl || ''
  isLinkMenuOpen.value = !isLinkMenuOpen.value
}

const applyLink = () => {
  if (linkUrl.value) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  }
  isLinkMenuOpen.value = false
}

const removeLink = () => {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  isLinkMenuOpen.value = false
}

const openExternal = () => {
  if (linkUrl.value) {
    window.open(linkUrl.value, '_blank')
  }
}

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const headingMenuRef = ref(null)
const isHeadingMenuOpen = ref(false)
onClickOutside(headingMenuRef, () => {
  isHeadingMenuOpen.value = false
})

const listMenuRef = ref(null)
const isListMenuOpen = ref(false)
onClickOutside(listMenuRef, () => {
  isListMenuOpen.value = false
})

</script>

<template>
  <div :class="['relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl flex flex-col', isDark ? 'bg-[#111111] border border-zinc-800' : 'bg-white border border-zinc-200 light-wrapper']">
    <div v-if="editor" :class="['sticky top-0 z-[50] flex flex-wrap items-center gap-1 p-2 border-b toolbar-container transition-colors', isDark ? 'border-zinc-800 bg-[#18181b] text-zinc-400' : 'border-zinc-200 bg-[#f4f4f5] text-zinc-500']">
      <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" v-tooltip.top="'撤销'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50 transition-colors">
        <Undo2 :size="16" />
      </button>
      <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" v-tooltip.top="'重做'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50 transition-colors">
        <Redo2 :size="16" />
      </button>

      <div class="w-px h-5 bg-zinc-800 mx-1"></div>

      <div class="relative" ref="headingMenuRef">
        <button @click="isHeadingMenuOpen = !isHeadingMenuOpen" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('heading') }" v-tooltip.top="'标题'" class="flex items-center gap-1 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
          <Heading :size="16" />
          <ChevronDown :size="12" class="opacity-70" />
        </button>
        <div v-show="isHeadingMenuOpen" class="absolute top-full left-0 mt-1 min-w-[130px] bg-[#1a1a1e]/95 backdrop-blur shadow-2xl border border-zinc-700/60 rounded-lg p-1 z-[100] text-sm flex flex-col gap-0.5">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run(); isHeadingMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('heading', { level: 1 }) }" v-tooltip.top="'标题 1'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full">
            <Heading1 :size="16" /> Heading 1
          </button>
          <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run(); isHeadingMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('heading', { level: 2 }) }" v-tooltip.top="'标题 2'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full">
            <Heading2 :size="16" /> Heading 2
          </button>
          <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run(); isHeadingMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('heading', { level: 3 }) }" v-tooltip.top="'标题 3'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full">
            <Heading3 :size="16" /> Heading 3
          </button>
          <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run(); isHeadingMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('heading', { level: 4 }) }" v-tooltip.top="'标题 4'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full">
            <Heading4 :size="16" /> Heading 4
          </button>
        </div>
      </div>

      <div class="w-px h-5 bg-zinc-800 mx-1"></div>

      <div class="relative" ref="listMenuRef">
        <button @click="isListMenuOpen = !isListMenuOpen" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList') }" v-tooltip.top="'列表'" class="flex items-center gap-1 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
          <List :size="16" />
          <ChevronDown :size="12" class="opacity-70" />
        </button>
        <div v-show="isListMenuOpen" class="absolute top-full left-0 mt-1 min-w-[130px] bg-[#1a1a1e]/95 backdrop-blur shadow-2xl border border-zinc-700/60 rounded-lg p-1 z-[100] text-sm flex flex-col gap-0.5">
          <button @click="editor.chain().focus().toggleBulletList().run(); isListMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('bulletList') }" v-tooltip.top="'项目列表'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
            <List :size="16" /> Bullet List
          </button>
          <button @click="editor.chain().focus().toggleOrderedList().run(); isListMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('orderedList') }" v-tooltip.top="'有序列表'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
            <ListOrdered :size="16" /> Ordered List
          </button>
          <button @click="editor.chain().focus().toggleTaskList().run(); isListMenuOpen = false" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('taskList') }" v-tooltip.top="'任务列表'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
            <ListTodo :size="16" /> Task List
          </button>
        </div>
      </div>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('blockquote') }" v-tooltip.top="'引用'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Quote :size="16" />
      </button>
      
      <div class="w-px h-5 bg-zinc-800 mx-1"></div>

      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('bold') }" v-tooltip.top="'加粗'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Bold :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('italic') }" v-tooltip.top="'斜体'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Italic :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('strike') }" v-tooltip.top="'删除线'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Strikethrough :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('code') }" v-tooltip.top="'行内代码'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Code :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('codeBlock') }" v-tooltip.top="'代码块'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <FileCode :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('underline') }" v-tooltip.top="'下划线'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <UnderlineIcon :size="16" />
      </button>
      <button @click="editor.chain().focus().clearNodes().unsetAllMarks().run()" v-tooltip.top="'清除格式'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Eraser :size="16" />
      </button>

      <div class="relative" ref="linkMenuRef">
        <button @click="openLinkMenu" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('link') || isLinkMenuOpen }" v-tooltip.top="'链接'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
          <LinkIcon :size="16" />
        </button>
        <div v-show="isLinkMenuOpen" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#1a1a1e]/95 backdrop-blur shadow-2xl border border-zinc-700/60 rounded-xl p-1.5 z-[100] flex items-center gap-1">
          <input 
            v-model="linkUrl" 
            @keydown.enter="applyLink"
            type="text" 
            placeholder="Paste a link..." 
            class="flex-1 bg-transparent border-none outline-none text-zinc-200 text-sm px-2 placeholder:text-zinc-500 min-w-0"
          />
          <button @click="applyLink" v-tooltip.top="'应用链接'" class="p-1.5 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
            <CornerDownLeft :size="14" />
          </button>
          
          <div class="w-px h-4 bg-zinc-700 mx-1"></div>
          
          <button @click="openExternal" :disabled="!linkUrl" v-tooltip.top="'在新窗口打开'" class="p-1.5 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50 transition-colors">
            <ExternalLink :size="14" />
          </button>
          <button @click="removeLink" v-tooltip.top="'删除链接'" class="p-1.5 rounded text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors">
            <Trash :size="14" />
          </button>
        </div>
      </div>

      <div class="w-px h-5 bg-zinc-800 mx-1"></div>

      <button @click="editor.chain().focus().toggleSubscript().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('subscript') }" v-tooltip.top="'下标'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <SubscriptIcon :size="16" />
      </button>
      <button @click="editor.chain().focus().toggleSuperscript().run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('superscript') }" v-tooltip.top="'上标'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <SuperscriptIcon :size="16" />
      </button>

      <div class="w-px h-5 bg-zinc-800 mx-1"></div>

      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive({ textAlign: 'left' }) }" v-tooltip.top="'左对齐'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <AlignLeft :size="16" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive({ textAlign: 'center' }) }" v-tooltip.top="'居中对齐'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <AlignCenter :size="16" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive({ textAlign: 'right' }) }" v-tooltip.top="'右对齐'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <AlignRight :size="16" />
      </button>
      <button @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive({ textAlign: 'justify' }) }" v-tooltip.top="'两端对齐'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <AlignJustify :size="16" />
      </button>

      <div class="w-px h-5 bg-zinc-800 mx-1"></div>
      
      <button @click="editor.chain().focus().insertContent({ type: 'imageUpload' }).run()" v-tooltip.top="'添加图片'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-1 transition-colors">
        <ImagePlus :size="16" /> <span class="text-xs font-semibold">Add</span>
      </button>

      <div class="flex-1"></div>
      <button @click="toggleTheme" v-tooltip.top="'切换主题'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors mr-2">
        <MoonStar v-if="isDark" :size="16" />
        <Sun v-else :size="16" />
      </button>
    </div>

    <!-- The actual editor container -->
    <div :style="{ height: typeof props.height === 'number' ? `${props.height}px` : props.height }" :class="['relative overflow-y-auto w-full editor-inner resize-y min-h-[200px]', isDark ? 'bg-[#111111]' : 'bg-white']">
      <editor-content :editor="editor" class="h-full" />
    </div>
  </div>
</template>

<style>
/* Base typography inside the editor */
.editor-inner .ProseMirror {
  color: #e5e5e5;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.editor-inner .ProseMirror p {
  margin-top: 1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.editor-inner .ProseMirror p.is-editor-empty:first-child::before {
  color: #52525b;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.editor-inner .ProseMirror h1, .editor-inner .ProseMirror h2, .editor-inner .ProseMirror h3 {
  font-weight: 700;
  color: #f4f4f5;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.editor-inner .ProseMirror h1 { font-size: 2.25rem; }
.editor-inner .ProseMirror h2 { font-size: 1.5rem; }
.editor-inner .ProseMirror h3 { font-size: 1.25rem; }
.editor-inner .ProseMirror h4 { font-size: 1rem; font-weight: 600; }

.editor-inner .ProseMirror a {
  color: #6366f1; /* Indigo */
  text-decoration: underline;
  cursor: pointer;
}

.editor-inner .ProseMirror ul, .editor-inner .ProseMirror ol {
  padding-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.editor-inner .ProseMirror ul { list-style-type: disc; }
.editor-inner .ProseMirror ol { list-style-type: decimal; }

.editor-inner .ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}
.editor-inner .ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.editor-inner .ProseMirror ul[data-type="taskList"] li > label {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  user-select: none;
}
.editor-inner .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
  accent-color: #6366f1;
}
.editor-inner .ProseMirror ul[data-type="taskList"] li > div {
  flex: 1;
}
.editor-inner .ProseMirror ul[data-type="taskList"] li > div > p {
  margin: 0;
}
.editor-inner .ProseMirror hr {
  border: none;
  border-top: 1px solid #27272a;
  margin: 2rem 0;
}
.editor-inner .ProseMirror blockquote {
  border-left: 3px solid #3f3f46;
  padding-left: 1rem;
  margin-left: 0;
  color: #a1a1aa;
}

/* Light Theme Overrides */
.light-wrapper .hover\:bg-zinc-800:hover, 
.light-wrapper .bg-zinc-800 {
  background-color: #e4e4e7 !important;
  color: #18181b !important;
}
.light-wrapper .bg-\[\#1a1a1e\]\/95 {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #d4d4d8 !important;
}
.light-wrapper .border-zinc-700\/60 {
  border-color: #d4d4d8 !important;
}
.light-wrapper .text-zinc-400,
.light-wrapper .text-zinc-500 {
  color: #71717a !important;
}
.light-wrapper .hover\:text-zinc-100:hover {
  color: #09090b !important;
}
.light-wrapper .editor-inner .ProseMirror {
  color: #27272a !important;
}
.light-wrapper .editor-inner .ProseMirror h1,
.light-wrapper .editor-inner .ProseMirror h2,
.light-wrapper .editor-inner .ProseMirror h3,
.light-wrapper .editor-inner .ProseMirror h4 {
  color: #09090b !important;
}
.light-wrapper .editor-inner .ProseMirror blockquote {
  border-left-color: #d4d4d8 !important;
  color: #71717a !important;
}
.light-wrapper .editor-inner .ProseMirror pre {
  background: #f4f4f5 !important;
}
.light-wrapper .editor-inner .ProseMirror hr {
  border-top-color: #e4e4e7 !important;
}
.light-wrapper .w-px {
  background-color: #d4d4d8 !important;
}
.light-wrapper input {
  color: #18181b !important;
}
.light-wrapper input::placeholder {
  color: #a1a1aa !important;
}
.editor-inner .ProseMirror pre {
  background: #18181b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
.editor-inner .ProseMirror pre code {
  color: inherit;
  background: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
}

/* Custom Scrollbar for Editor */
.editor-inner::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}
.editor-inner::-webkit-scrollbar-track {
  background: transparent;
}
.editor-inner::-webkit-scrollbar-thumb {
  background-color: #3f3f46;
  border-radius: 10px;
  border: 4px solid transparent;
  background-clip: content-box;
}
.editor-inner::-webkit-scrollbar-thumb:hover {
  background-color: #52525b;
}

/* Light Theme Scrollbar Override */
.light-wrapper.editor-inner::-webkit-scrollbar-thumb,
.light-wrapper .editor-inner::-webkit-scrollbar-thumb {
  background-color: #d4d4d8 !important;
}
.light-wrapper.editor-inner::-webkit-scrollbar-thumb:hover,
.light-wrapper .editor-inner::-webkit-scrollbar-thumb:hover {
  background-color: #a1a1aa !important;
}

/* Hide native ugly resizer and scrollbar corner */
.editor-inner::-webkit-resizer,
.editor-inner::-webkit-scrollbar-corner {
  background-color: transparent;
}
</style>
