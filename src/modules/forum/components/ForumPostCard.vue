<script setup lang="ts">
import { computed } from 'vue'
import { Heart, MessageCircle, Eye, Trash2 } from 'lucide-vue-next'
import type { ForumPost } from '@/types'
import { FORUM_CATEGORY_LABELS } from '@/types'

interface Props {
  post: ForumPost
  currentUserId: string
  darkMode: boolean
  showContent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showContent: false
})

const emit = defineEmits<{
  click: [postId: string]
  like: [postId: string]
  delete: [postId: string]
  viewProfile: [userId: string]
}>()

const isOwn = computed(() => props.post.userId === props.currentUserId)
const isLiked = computed(() => props.post.likedBy.includes(props.currentUserId))
const categoryLabel = computed(() => FORUM_CATEGORY_LABELS[props.post.category])

const formatTime = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return ''
  const now = Date.now()
  const time = timestamp.seconds * 1000
  const diff = now - time

  if (diff < 60000) return '剛剛'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  return new Date(time).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    career: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    life: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    learning: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
  }
  return colors[category] || colors.other
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-4 transition-all cursor-pointer',
      darkMode
        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
        : 'bg-white border-slate-200 hover:shadow-md'
    ]"
    @click="emit('click', post.id)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <button
          @click.stop="emit('viewProfile', post.userId)"
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-tr from-purple-400 to-indigo-500 hover:ring-2 hover:ring-indigo-400 transition-all"
        >
          {{ post.userName?.[0]?.toUpperCase() || '?' }}
        </button>
        <div>
          <div class="flex items-center gap-2">
            <button
              @click.stop="emit('viewProfile', post.userId)"
              :class="['text-sm font-semibold hover:underline', darkMode ? 'text-white' : 'text-slate-800']"
            >
              {{ post.userName }}
            </button>
            <span :class="['text-xs px-1.5 py-0.5 rounded', darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500']">
              {{ post.userRole }}
            </span>
          </div>
          <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
            {{ formatTime(post.createdAt) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span :class="['text-xs px-2 py-1 rounded-full', getCategoryColor(post.category)]">
          {{ categoryLabel }}
        </span>
        <button
          v-if="isOwn"
          @click.stop="emit('delete', post.id)"
          :class="['p-1.5 rounded-lg transition-colors', darkMode ? 'text-slate-500 hover:bg-slate-700 hover:text-red-400' : 'text-slate-400 hover:bg-slate-100 hover:text-red-500']"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Title -->
    <h3 :class="['font-bold mb-2', darkMode ? 'text-white' : 'text-slate-800']">
      {{ post.title }}
    </h3>

    <!-- Content (預覽或完整) -->
    <p :class="[
      'text-sm mb-3 whitespace-pre-line',
      darkMode ? 'text-slate-300' : 'text-slate-600',
      !showContent && 'line-clamp-2'
    ]">
      {{ post.content }}
    </p>

    <!-- Tags -->
    <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
      <span
        v-for="tag in post.tags"
        :key="tag"
        :class="[
          'text-xs px-2 py-0.5 rounded-full',
          darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        ]"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-4 pt-2 border-t" :class="darkMode ? 'border-slate-700' : 'border-slate-100'">
      <button
        @click.stop="emit('like', post.id)"
        :class="[
          'flex items-center gap-1.5 text-sm transition-colors',
          isLiked
            ? 'text-red-500'
            : (darkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500')
        ]"
      >
        <Heart :class="['w-4 h-4', isLiked && 'fill-current']" />
        {{ post.likeCount }}
      </button>

      <div :class="['flex items-center gap-1.5 text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
        <MessageCircle class="w-4 h-4" />
        {{ post.commentCount }}
      </div>

      <div :class="['flex items-center gap-1.5 text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
        <Eye class="w-4 h-4" />
        {{ post.viewCount }}
      </div>
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
