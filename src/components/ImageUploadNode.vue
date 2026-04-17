<script setup lang="ts">
import { ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { CloudUpload } from 'lucide-vue-next'

const props = defineProps(nodeViewProps)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)

const triggerUpload = () => {
  if (isUploading.value) return
  fileInput.value?.click()
}

const replaceNodeWithImage = (src: string) => {
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

const processFile = async (file: File) => {
  if (file && file.type.startsWith('image/')) {
    const uploadFn = props.extension.options.uploadFn
    if (uploadFn) {
      isUploading.value = true
      try {
        const url = await uploadFn(file)
        if (url) {
          replaceNodeWithImage(url)
        }
      } catch (error) {
        console.error('Image upload failed:', error)
      } finally {
        isUploading.value = false
      }
    } else {
      // Fallback to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result
        if (src && typeof src === 'string') {
          replaceNodeWithImage(src)
        }
      }
      reader.readAsDataURL(file)
    }
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
      :class="[
        'upload-block w-full max-w-lg mx-auto border-[1.5px] border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors',
        isUploading ? 'opacity-70 cursor-not-allowed border-indigo-500/30' : 'cursor-pointer',
        isDragging && !isUploading ? 'border-indigo-500 bg-indigo-500/10' : '',
        !isUploading && !isDragging ? 'border-indigo-500/60 hover:border-indigo-400 bg-[#151515] hover:bg-[#1a1a1f]' : ''
      ]"
    >
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="onFileChange"
      />
      <div v-if="isUploading" class="flex flex-col items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="upload-text-base text-zinc-100 text-sm font-medium">Uploading...</span>
      </div>
      <template v-else>
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
      </template>
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
