<script setup lang="ts">
import { ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { CloudUpload } from 'lucide-vue-next'

const props = defineProps(nodeViewProps)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const triggerUpload = () => {
  fileInput.value?.click()
}

const processFile = (file: File) => {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result
      if (src && typeof src === 'string') {
        const { editor, getPos } = props
        const pos = typeof getPos === 'function' ? getPos() : undefined
        
        // Use a transaction to replace the node safely
        if (pos !== undefined && typeof pos === 'number') {
          editor.chain()
            .focus()
            .deleteRange({ from: pos, to: pos + 1 })
            .insertContentAt(pos, {
              type: 'image',
              attrs: { src }
            })
            .run()
        }
      }
    }
    reader.readAsDataURL(file)
  }
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

const onDragOver = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

</script>

<template>
  <NodeViewWrapper class="w-full my-6">
    <div 
      @click="triggerUpload"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      :class="['upload-block w-full max-w-lg mx-auto border-[1.5px] border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors', isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-500/60 hover:border-indigo-400 bg-[#151515] hover:bg-[#1a1a1f]']"
    >
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="onFileChange"
      />
      <div class="relative mb-4">
        <!-- Using a placeholder file icon as base -->
        <div class="w-10 h-12 bg-zinc-200/10 rounded border border-zinc-500/30 flex items-center justify-center shadow-sm relative">
          <!-- Small right top fold -->
          <div class="upload-fold absolute top-0 right-0 w-3 h-3 bg-[#111111] border-b border-l border-zinc-500/30 rounded-bl"></div>
        </div>
        <div class="upload-cloud-border absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-[#151515]">
          <CloudUpload :size="12" class="text-white" stroke-width="3" />
        </div>
      </div>
      <div class="upload-text-muted text-zinc-300 text-[13px] font-medium mb-1">
        <span class="upload-text-base underline decoration-indigo-400 underline-offset-4 decoration-1 text-zinc-100 cursor-pointer hover:text-white">Click to upload</span> or drag and drop
      </div>
      <div class="upload-text-muted text-zinc-500 text-[11px] font-medium">
        Maximum 3 files, 5MB each.
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style>
.light-wrapper .upload-block {
  background-color: #f4f4f5 !important;
}
.light-wrapper .upload-block:hover {
  background-color: #e4e4e7 !important;
}
.light-wrapper .upload-fold {
  background-color: #ffffff !important;
}
.light-wrapper .upload-cloud-border {
  border-color: #f4f4f5 !important;
}
.light-wrapper .upload-text-base {
  color: #18181b !important;
}
.light-wrapper .upload-text-base:hover {
  color: #000000 !important;
}
.light-wrapper .upload-text-muted {
  color: #71717a !important;
}
</style>
