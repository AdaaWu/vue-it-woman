<script setup lang="ts">
import { computed } from 'vue'
import { Heart, MessageCircle, Trash2 } from 'lucide-vue-next'
import type { ForumComment } from '@/types'

interface Props {
  comment: ForumComment
  currentUserId: string
  darkMode: boolean
  isReply?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false
})

const emit = defineEmits<{
  like: [commentId: string]
  reply: [commentId: string]
  delete: [commentId: string]
}>()

const isOwner = computed(() => props.comment.userId === props.currentUserId)
const isLiked = computed(() => props.comment.likedBy.includes(props.currentUserId))

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

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500',
    'bg-teal-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500'
  ]
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}
</script>

<template>
  <div :class="[
    'flex gap-3',
    isReply ? 'ml-10' : ''
  ]">
    <!-- 頭像 -->
    <div :class="[
      'flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold',
      isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm',
      getAvatarColor(comment.userId)
    ]">
      {{ comment.userName.charAt(0).toUpperCase() }}
    </div>

    <!-- 內容 -->
    <div class="flex-1 min-w-0">
      <div :class="[
        'rounded-2xl px-4 py-3',
        darkMode ? 'bg-slate-800' : 'bg-slate-100'
      ]">
        <!-- 用戶資訊 -->
        <div class="flex items-center gap-2 mb-1">
          <span :class="['font-medium text-sm', darkMode ? 'text-white' : 'text-slate-800']">
            {{ comment.userName }}
          </span>
          <span :class="[
            'text-xs px-2 py-0.5 rounded-full',
            darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
          ]">
            {{ comment.userRole }}
          </span>
        </div>

        <!-- 留言內容 -->
        <p :class="['text-sm whitespace-pre-wrap', darkMode ? 'text-slate-300' : 'text-slate-700']">
          {{ comment.content }}
        </p>
      </div>

      <!-- 操作列 -->
      <div class="flex items-center gap-4 mt-2 ml-2">
        <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ formatTime(comment.createdAt) }}
        </span>

        <!-- 按讚 -->
        <button
          @click="emit('like', comment.id)"
          :class="[
            'flex items-center gap-1 text-xs transition-colors',
            isLiked
              ? 'text-pink-500'
              : (darkMode ? 'text-slate-500 hover:text-pink-400' : 'text-slate-400 hover:text-pink-500')
          ]"
        >
          <Heart :class="['w-3.5 h-3.5', isLiked ? 'fill-current' : '']" />
          <span v-if="comment.likeCount > 0">{{ comment.likeCount }}</span>
        </button>

        <!-- 回覆 (僅非回覆的留言可以回覆) -->
        <button
          v-if="!isReply"
          @click="emit('reply', comment.id)"
          :class="[
            'flex items-center gap-1 text-xs transition-colors',
            darkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-500'
          ]"
        >
          <MessageCircle class="w-3.5 h-3.5" />
          <span>回覆</span>
        </button>

        <!-- 刪除 (僅自己的留言) -->
        <button
          v-if="isOwner"
          @click="emit('delete', comment.id)"
          :class="[
            'flex items-center gap-1 text-xs transition-colors',
            darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'
          ]"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>刪除</span>
        </button>
      </div>
    </div>
  </div>
</template>
