<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { EmojiCategory } from '../types'

interface Props {
  darkMode: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  select: [emoji: string]
  close: []
}>()

const EMOJI_LIST: EmojiCategory[] = [
  { cat: "熱門", emojis: ["❤️", "✨", "🔥", "😂", "🚀", "🙌", "👍", "💻"] },
  { cat: "表情", emojis: ["😊", "😍", "🤔", "🥺", "😎", "🥳", "😴", "💡"] },
  { cat: "職場", emojis: ["👩‍💻", "💼", "📈", "🎯", "☕", "📝", "📢", "🤝"] },
  { cat: "科技", emojis: ["🌐", "⚡", "📱", "🔧", "🔋", "🛡️", "🧬", "🤖"] }
]

const selectEmoji = (emoji: string): void => {
  emit('select', emoji)
}
</script>

<template>
  <div :class="[
    'absolute bottom-full mb-4 left-4 w-72 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200',
    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div :class="[
      'p-3 border-b flex justify-between items-center',
      darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'
    ]">
      <span class="text-xs font-bold uppercase tracking-wider">選擇表情</span>
      <button @click="emit('close')" class="hover:text-indigo-400 transition-colors">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Emoji Grid -->
    <div class="max-h-60 overflow-y-auto p-2 scrollbar-hide">
      <div v-for="category in EMOJI_LIST" :key="category.cat" class="mb-3">
        <p class="text-[10px] font-semibold text-slate-500 mb-1 px-1">{{ category.cat }}</p>
        <div class="grid grid-cols-6 gap-1">
          <button
            v-for="emoji in category.emojis"
            :key="emoji"
            type="button"
            @click="selectEmoji(emoji)"
            :class="[
              'w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-colors active:scale-90',
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-indigo-50'
            ]"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 200ms;
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fade-in;
}

.zoom-in-95 {
  animation-name: zoom-in-95;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
