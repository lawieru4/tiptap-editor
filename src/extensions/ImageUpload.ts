import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageUploadComponent from '@/components/ImageUploadNode.vue'

export default Node.create({
  name: 'imageUpload',

  group: 'block',

  atom: true,

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
