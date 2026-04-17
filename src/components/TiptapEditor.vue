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
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import {
  Undo2, Redo2, Heading, Heading1, Heading2, Heading3, Heading4, List, ListOrdered, ListTodo, Bold, Italic, 
  Strikethrough, Code, Underline as UnderlineIcon, Eraser, Link as LinkIcon, 
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, MoonStar, Sun, Quote, FileCode, ChevronDown, CornerDownLeft, ExternalLink, Trash, ImagePlus, Video as VideoIcon, Table as TableIcon
} from 'lucide-vue-next'
import { onBeforeUnmount, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Image from '@tiptap/extension-image'
import ImageUpload from '@/extensions/ImageUpload'
import VideoUpload from '@/extensions/VideoUpload'
import Video from '@/extensions/Video'

const props = withDefaults(defineProps<{
  modelValue: string
  height?: number | string
  onUploadImg?: (file: File, onProgress: (progress: number) => void) => Promise<string>
  onUploadVideo?: (file: File, onProgress: (progress: number) => void) => Promise<string>
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
    Video,
    VideoUpload.configure({
      uploadFn: props.onUploadVideo
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
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

const tableMenuRef = ref(null)
const isTableMenuOpen = ref(false)
const selectedGridRows = ref(0)
const selectedGridCols = ref(0)
onClickOutside(tableMenuRef, () => {
  isTableMenuOpen.value = false
  selectedGridRows.value = 0
  selectedGridCols.value = 0
})

const contextMenuRef = ref(null)
const isContextMenuOpen = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

onClickOutside(contextMenuRef, () => {
  isContextMenuOpen.value = false
})

const handleContextMenu = (e: MouseEvent) => {
  if (!editor.value) return
  
  const pos = editor.value.view.posAtCoords({ left: e.clientX, top: e.clientY })
  if (pos && pos.pos !== null) {
    // Synchronously check if the target is within a table to prevent default browser menu
    if ((e.target as HTMLElement).closest('table')) {
      e.preventDefault()
      editor.value.commands.setTextSelection(pos.pos)
      isContextMenuOpen.value = true
      contextMenuPosition.value = { x: e.clientX, y: e.clientY }
    } else {
      isContextMenuOpen.value = false
    }
  }
}

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
      
      <div class="relative" ref="tableMenuRef">
        <button @click="isTableMenuOpen = !isTableMenuOpen" :class="{ 'bg-zinc-800 text-zinc-100': editor.isActive('table') }" v-tooltip.top="'表格'" class="flex items-center gap-1 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
          <TableIcon :size="16" />
          <ChevronDown :size="12" class="opacity-70" />
        </button>
        <div v-show="isTableMenuOpen" class="absolute top-full left-0 mt-1 min-w-[160px] bg-[#1a1a1e]/95 backdrop-blur shadow-2xl border border-zinc-700/60 rounded-lg p-1 z-[100] text-sm flex flex-col gap-0.5">
          <template v-if="!editor.isActive('table')">
            <div class="px-2 py-1.5 flex flex-col items-center">
              <div class="text-xs font-medium mb-1.5 transition-colors self-start" :class="selectedGridRows > 0 ? 'text-indigo-400' : 'text-zinc-400'">
                {{ selectedGridRows > 0 && selectedGridCols > 0 ? `${selectedGridRows} × ${selectedGridCols} 表格` : '插入表格' }}
              </div>
              <div class="flex flex-col gap-0.5 w-fit" @mouseleave="selectedGridRows = 0; selectedGridCols = 0">
                <div v-for="r in 9" :key="'r-'+r" class="flex gap-0.5">
                  <div 
                    v-for="c in 16" 
                    :key="'c-'+c"
                    @mouseover="selectedGridRows = r; selectedGridCols = c"
                    @click="editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run(); isTableMenuOpen = false; selectedGridRows = 0; selectedGridCols = 0"
                    :class="[
                      'w-3.5 h-3.5 border rounded-[2px] cursor-pointer transition-all duration-75',
                      (r <= selectedGridRows && c <= selectedGridCols) ? 'bg-indigo-500/80 border-indigo-500/80' : 'border-zinc-500/40 table-grid-cell hover:border-zinc-400'
                    ]"
                  ></div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-if="editor.isActive('table')">
            <div class="h-px bg-zinc-700 my-1 mx-1"></div>
            <button @click="editor.chain().focus().addColumnBefore().run(); isTableMenuOpen = false" v-tooltip.top="'在左侧插入列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Add Column Before
            </button>
            <button @click="editor.chain().focus().addColumnAfter().run(); isTableMenuOpen = false" v-tooltip.top="'在右侧插入列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Add Column After
            </button>
            <button @click="editor.chain().focus().deleteColumn().run(); isTableMenuOpen = false" v-tooltip.top="'删除当前列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors text-left w-full whitespace-nowrap">
              Delete Column
            </button>
            <div class="h-px bg-zinc-700 my-1 mx-1"></div>
            <button @click="editor.chain().focus().addRowBefore().run(); isTableMenuOpen = false" v-tooltip.top="'在上方插入行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Add Row Before
            </button>
            <button @click="editor.chain().focus().addRowAfter().run(); isTableMenuOpen = false" v-tooltip.top="'在下方插入行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Add Row After
            </button>
            <button @click="editor.chain().focus().deleteRow().run(); isTableMenuOpen = false" v-tooltip.top="'删除当前行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors text-left w-full whitespace-nowrap">
              Delete Row
            </button>
            <div class="h-px bg-zinc-700 my-1 mx-1"></div>
            <button @click="editor.chain().focus().mergeCells().run(); isTableMenuOpen = false" v-tooltip.top="'合并单元格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Merge Cells
            </button>
            <button @click="editor.chain().focus().splitCell().run(); isTableMenuOpen = false" v-tooltip.top="'拆分单元格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap">
              Split Cell
            </button>
            <div class="h-px bg-zinc-700 my-1 mx-1"></div>
            <button @click="editor.chain().focus().deleteTable().run(); isTableMenuOpen = false" v-tooltip.top="'删除整个表格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 text-red-500 transition-colors text-left w-full whitespace-nowrap">
              Delete Table
            </button>
          </template>
        </div>
      </div>

      <button @click="editor.chain().focus().insertContent({ type: 'imageUpload' }).run()" v-tooltip.top="'添加图片'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-1 transition-colors">
        <ImagePlus :size="16" /> <span class="text-xs font-semibold">Image</span>
      </button>

      <button @click="editor.chain().focus().insertContent({ type: 'videoUpload' }).run()" v-tooltip.top="'添加视频'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-1 transition-colors">
        <VideoIcon :size="16" /> <span class="text-xs font-semibold">Video</span>
      </button>

      <div class="flex-1"></div>
      <button @click="toggleTheme" v-tooltip.top="'切换主题'" class="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors mr-2">
        <MoonStar v-if="isDark" :size="16" />
        <Sun v-else :size="16" />
      </button>
    </div>

    <!-- The actual editor container -->
    <div :style="{ height: typeof props.height === 'number' ? `${props.height}px` : props.height }" @contextmenu="handleContextMenu" :class="['relative overflow-y-auto w-full editor-inner resize-y min-h-[200px]', isDark ? 'bg-[#111111]' : 'bg-white']">
      <editor-content :editor="editor" class="h-full" />
    </div>

    <!-- Table Context Menu -->
    <div 
      v-if="isContextMenuOpen"
      ref="contextMenuRef"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      :class="['fixed z-[9999] min-w-[160px] shadow-2xl border rounded-lg p-1 text-sm flex flex-col gap-0.5', isDark ? 'bg-[#1a1a1e]/95 backdrop-blur border-zinc-700/60' : 'bg-white/95 backdrop-blur border-zinc-300 light-wrapper context-menu-wrapper']"
    >
      <button @click="editor.chain().focus().addColumnBefore().run(); isContextMenuOpen = false" v-tooltip.right="'在左侧插入列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Add Column Before
      </button>
      <button @click="editor.chain().focus().addColumnAfter().run(); isContextMenuOpen = false" v-tooltip.right="'在右侧插入列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Add Column After
      </button>
      <button @click="editor.chain().focus().deleteColumn().run(); isContextMenuOpen = false" v-tooltip.right="'删除当前列'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Delete Column
      </button>
      <div class="h-px bg-zinc-700 my-1 mx-1"></div>
      <button @click="editor.chain().focus().addRowBefore().run(); isContextMenuOpen = false" v-tooltip.right="'在上方插入行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Add Row Before
      </button>
      <button @click="editor.chain().focus().addRowAfter().run(); isContextMenuOpen = false" v-tooltip.right="'在下方插入行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Add Row After
      </button>
      <button @click="editor.chain().focus().deleteRow().run(); isContextMenuOpen = false" v-tooltip.right="'删除当前行'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-red-400 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Delete Row
      </button>
      <div class="h-px bg-zinc-700 my-1 mx-1"></div>
      <button @click="editor.chain().focus().mergeCells().run(); isContextMenuOpen = false" v-tooltip.right="'合并单元格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Merge Cells
      </button>
      <button @click="editor.chain().focus().splitCell().run(); isContextMenuOpen = false" v-tooltip.right="'拆分单元格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left w-full whitespace-nowrap text-zinc-300">
        Split Cell
      </button>
      <div class="h-px bg-zinc-700 my-1 mx-1"></div>
      <button @click="editor.chain().focus().deleteTable().run(); isContextMenuOpen = false" v-tooltip.right="'删除整个表格'" class="flex items-center gap-2 p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 text-red-500 transition-colors text-left w-full whitespace-nowrap">
        Delete Table
      </button>
    </div>
  </div>
</template>

<style>
/* Fix table selection issue on right click */
.ProseMirror .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}
.light-wrapper .context-menu-wrapper {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #d4d4d8 !important;
}
.light-wrapper .context-menu-wrapper button.text-zinc-300 {
  color: #71717a !important;
}
.light-wrapper .context-menu-wrapper button:hover {
  background-color: #e4e4e7 !important;
  color: #18181b !important;
}
.light-wrapper .context-menu-wrapper .h-px {
  background-color: #d4d4d8 !important;
}
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
.editor-inner .ProseMirror table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
  overflow: hidden;
}
.editor-inner .ProseMirror table td,
.editor-inner .ProseMirror table th {
  min-width: 1em;
  border: 1px solid #3f3f46;
  padding: 8px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}
.editor-inner .ProseMirror table th {
  font-weight: 500;
  text-align: left;
  background-color: #27272a;
}
.editor-inner .ProseMirror table .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  z-index: 20;
  background-color: #6366f1;
  pointer-events: none;
}
.editor-inner .ProseMirror table p {
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
.light-wrapper .editor-inner .ProseMirror table td,
.light-wrapper .editor-inner .ProseMirror table th {
  border-color: #d4d4d8 !important;
}
.light-wrapper .editor-inner .ProseMirror table th {
  background-color: #f4f4f5 !important;
}
.light-wrapper .editor-inner .ProseMirror blockquote {
  border-left-color: #d4d4d8 !important;
  color: #71717a !important;
}
.light-wrapper .table-grid-cell {
  border-color: #d4d4d8 !important;
}
.light-wrapper .table-grid-cell:hover {
  border-color: #71717a !important;
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
