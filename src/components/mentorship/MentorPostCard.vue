<script setup lang="ts">
import { computed } from 'vue'
import { GraduationCap, BookOpen, Clock } from 'lucide-vue-next'
import type { MentorPost } from '../../types'

interface Props {
  post: MentorPost
  darkMode: boolean
  isOwn?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  delete: []
}>()

const isOffer = computed(() => props.post.type === 'offer')

const timeAgo = computed(() => {
  if (!props.post.createdAt) return ''
  const seconds = Date.now() / 1000 - props.post.createdAt.seconds
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`
  return `${Math.floor(seconds / 604800)} 週前`
})
</script>

<template>
  <div
    @click="emit('click')"
    :class="[
      'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
      darkMode
        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
        : 'bg-white border-slate-200 hover:border-indigo-200'
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2">
        <div :class="[
          'p-1.5 rounded-lg',
          isOffer
            ? (darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600')
            : (darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
        ]">
          <GraduationCap v-if="isOffer" class="w-4 h-4" />
          <BookOpen v-else class="w-4 h-4" />
        </div>
        <span :class="[
          'text-xs font-medium px-2 py-0.5 rounded-full',
          isOffer
            ? (darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600')
            : (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
        ]">
          {{ isOffer ? '導師邀請' : '學員需求' }}
        </span>
      </div>
      <div class="flex items-center gap-1 text-xs" :class="darkMode ? 'text-slate-500' : 'text-slate-400'">
        <Clock class="w-3 h-3" />
        {{ timeAgo }}
      </div>
    </div>

    <!-- Title -->
    <h3 :class="[
      'font-semibold mb-2 line-clamp-2',
      darkMode ? 'text-white' : 'text-slate-800'
    ]">
      {{ post.title }}
    </h3>

    <!-- Author -->
    <div class="flex items-center gap-2 mb-3">
      <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
        {{ post.userName?.[0]?.toUpperCase() || '?' }}
      </div>
      <span :class="['text-sm', darkMode ? 'text-slate-300' : 'text-slate-600']">
        {{ post.userName }}
      </span>
      <span :class="[
        'text-xs px-1.5 py-0.5 rounded',
        darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
      ]">
        {{ post.userRole }}
      </span>
    </div>

    <!-- Areas -->
    <div class="flex flex-wrap gap-1.5 mb-3">
      <span
        v-for="area in post.areas.slice(0, 4)"
        :key="area"
        :class="[
          'px-2 py-0.5 rounded-md text-xs font-medium',
          darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        ]"
      >
        {{ area }}
      </span>
      <span
        v-if="post.areas.length > 4"
        :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']"
      >
        +{{ post.areas.length - 4 }}
      </span>
    </div>

    <!-- Description -->
    <p :class="[
      'text-sm line-clamp-2',
      darkMode ? 'text-slate-400' : 'text-slate-500'
    ]">
      {{ post.description }}
    </p>

    <!-- Actions for own posts -->
    <div v-if="isOwn" class="flex justify-end mt-3 pt-3 border-t" :class="darkMode ? 'border-slate-700' : 'border-slate-100'">
      <button
        @click.stop="emit('delete')"
        :class="[
          'text-xs font-medium px-3 py-1 rounded-lg transition-colors',
          darkMode
            ? 'text-red-400 hover:bg-red-900/30'
            : 'text-red-600 hover:bg-red-50'
        ]"
      >
        刪除
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
