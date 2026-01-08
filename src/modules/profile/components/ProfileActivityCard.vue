<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare, Users, BookOpen, ShoppingBag } from 'lucide-vue-next'
import type { UserActivity } from '@/types'
import { USER_ACTIVITY_TYPE_LABELS } from '@/types'

interface Props {
  activity: UserActivity
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [activity: UserActivity]
}>()

const activityMeta = computed(() => USER_ACTIVITY_TYPE_LABELS[props.activity.type])

const formatTime = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-TW')
}

const getIcon = computed(() => {
  switch (props.activity.type) {
    case 'forum_post':
    case 'forum_comment':
      return MessageSquare
    case 'mentorship_request':
    case 'mentorship_offer':
      return Users
    case 'book_review':
      return BookOpen
    case 'marketplace_listing':
    case 'marketplace_sold':
      return ShoppingBag
    default:
      return MessageSquare
  }
})
</script>

<template>
  <button
    @click="emit('click', activity)"
    :class="[
      'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all',
      darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
    ]"
  >
    <!-- Icon -->
    <div :class="[
      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
      activityMeta.color
    ]">
      <component :is="getIcon" class="w-5 h-5 text-white" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-700']">
          {{ activityMeta.icon }} {{ activityMeta.label }}
        </span>
        <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ formatTime(activity.createdAt) }}
        </span>
      </div>
      <p :class="['text-sm mt-0.5 truncate', darkMode ? 'text-white' : 'text-slate-800']">
        {{ activity.targetTitle }}
      </p>
      <p v-if="activity.preview" :class="['text-xs mt-1 line-clamp-2', darkMode ? 'text-slate-500' : 'text-slate-400']">
        {{ activity.preview }}
      </p>
    </div>
  </button>
</template>
