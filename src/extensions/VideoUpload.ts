import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VideoUploadComponent from '@/components/VideoUploadNode.vue'

export interface VideoUploadOptions {
  uploadFn?: (file: File, onProgress: (progress: number) => void) => Promise<string>
}

export default Node.create<VideoUploadOptions>({
  name: 'videoUpload',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      uploadFn: undefined,
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video-upload',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video-upload', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoUploadComponent)
  },
})
