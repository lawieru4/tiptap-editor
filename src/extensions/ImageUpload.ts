import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageUploadComponent from '@/components/ImageUploadNode.vue'

export interface ImageUploadOptions {
  uploadFn?: (file: File) => Promise<string>
}

export default Node.create<ImageUploadOptions>({
  name: 'imageUpload',

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
        tag: 'image-upload',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['image-upload', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageUploadComponent)
  },
})

