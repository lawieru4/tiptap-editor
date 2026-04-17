import { Node, mergeAttributes } from '@tiptap/core'

export default Node.create({
  name: 'video',

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: "true", style: "width: 100%; border-radius: 0.5rem; outline: none; background: #000;" })]
  },
})
