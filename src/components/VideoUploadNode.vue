<script setup lang="ts">
import { ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { Film } from 'lucide-vue-next'

const props = defineProps(nodeViewProps)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

const triggerUpload = () => {
  if (isUploading.value) return
  fileInput.value?.click()
}

const replaceNodeWithVideo = (src: string) => {
  const { editor, getPos } = props
  const pos = typeof getPos === 'function' ? getPos() : undefined
  
  // Use a transaction to replace the node safely
  if (pos !== undefined && typeof pos === 'number') {
    editor.chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .insertContentAt(pos, {
        type: 'video',
        attrs: { src }
      })
      .run()
  }
}

const processFile = async (file: File) => {
  if (file && file.type.startsWith('video/')) {
    const uploadFn = props.extension.options.uploadFn
    if (uploadFn) {
      isUploading.value = true
      uploadProgress.value = 0
      try {
        const url = await uploadFn(file, (progress: number) => {
          uploadProgress.value = progress
        })
        if (url) {
          replaceNodeWithVideo(url)
        }
      } catch (error) {
        console.error('Video upload failed:', error)
      } finally {
        isUploading.value = false
      }
    } else {
      // Fallback to base64 (not recommended for large videos, but supported)
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result
        if (src && typeof src === 'string') {
          replaceNodeWithVideo(src)
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
        accept="video/*" 
        class="hidden" 
        @change="onFileChange"
      />
      <div v-if="isUploading" class="flex flex-col items-center justify-center w-full max-w-[200px]">
        <div class="w-full bg-zinc-800 rounded-full h-2 mb-3 mt-4 overflow-hidden border border-zinc-700/50">
          <div class="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <span class="upload-text-base text-zinc-100 text-sm font-medium">Uploading Video... {{ Math.round(uploadProgress) }}%</span>
      </div>
      <template v-else>
        <div class="relative mb-4">
          <!-- Using a placeholder file icon as base -->
          <div class="w-10 h-12 bg-zinc-200/10 rounded border border-zinc-500/30 flex items-center justify-center shadow-sm relative">
            <!-- Small right top fold -->
            <div class="upload-fold absolute top-0 right-0 w-3 h-3 bg-[#111111] border-b border-l border-zinc-500/30 rounded-bl"></div>
          </div>
          <div class="upload-cloud-border absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-[#151515]">
            <Film :size="12" class="text-white" stroke-width="3" />
          </div>
        </div>
        <div class="upload-text-muted text-zinc-300 text-[13px] font-medium mb-1">
          <span class="upload-text-base underline decoration-indigo-400 underline-offset-4 decoration-1 text-zinc-100 cursor-pointer hover:text-white">Click to upload video</span> or drag and drop
        </div>
        <div class="upload-text-muted text-zinc-500 text-[11px] font-medium">
          Maximum 1 file, 100MB.
        </div>
      </template>
    </div>
  </NodeViewWrapper>
</template>

<style>
/* 样式复用ImageUploadNode中的样式逻辑，所以保持一致即可。全局样式如果需要可以自己调节 */
</style>