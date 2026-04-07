<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from '@/components/TiptapEditor.vue'

const editorContent = ref(`
  <p><a target="_blank" rel="noopener noreferrer nofollow" href="#">&rarr; Learn more</a></p>
  <hr>
  <h2>Make it your own</h2>
  <p>Switch between light and dark modes, and tailor the editor's appearance with customizable CSS to match your style.</p>
  <ul data-type="taskList">
    <li data-checked="true" data-type="taskItem">
      <label><input type="checkbox" checked="checked"><span></span></label>
      <div><p><s>Test template</s></p></div>
    </li>
    <li data-checked="false" data-type="taskItem">
      <label><input type="checkbox"><span></span></label>
      <div><p><a target="_blank" rel="noopener noreferrer nofollow" href="#">Integrate the free template</a></p></div>
    </li>
  </ul>
`)

const mode = ref('Tiptap UI')

</script>

<template>
  <div class="min-h-screen w-full bg-surface-900 bg-gradient-to-br from-indigo-950 via-purple-950 to-zinc-950 flex flex-col items-center py-12 px-4 relative overflow-hidden">
    <!-- Glowing background effects -->
    <div class="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Toggle header block -->
    <div class="z-10 mb-8 flex bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/10">
      <button 
        @click="mode = 'Tiptap UI'" 
        :class="['px-6 py-2 rounded-full text-sm font-semibold transition-all', mode === 'Tiptap UI' ? 'bg-indigo-500/30 text-white shadow-lg border border-indigo-400/30' : 'text-zinc-400 hover:text-white']"
      >
        Tiptap UI
      </button>
      <button 
        @click="mode = 'Headless'" 
        :class="['px-6 py-2 rounded-full text-sm font-semibold transition-all', mode === 'Headless' ? 'bg-indigo-500/30 text-white shadow-lg border border-indigo-400/30' : 'text-zinc-400 hover:text-white']"
      >
        Headless
      </button>
    </div>

    <!-- Edit block -->
    <div class="w-full relative z-10 flex flex-col items-center">
      <TiptapEditor v-model="editorContent" />
    </div>
  </div>
</template>
