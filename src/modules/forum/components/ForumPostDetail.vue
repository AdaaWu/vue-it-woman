<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { ArrowLeft, Heart, MessageCircle, Eye, Trash2, Send } from 'lucide-vue-next'
import CommentItem from './CommentItem.vue'
import type { ForumPost, ForumComment } from '@/types'
import { FORUM_CATEGORY_LABELS } from '@/types'

interface Props {
  post: ForumPost
  comments: ForumComment[]
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  darkMode: boolean
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  like: [postId: string]
  delete: [postId: string]
  addComment: [content: string, parentId?: string]
  likeComment: [commentId: string]
  deleteComment: [commentId: string]
}>()

const commentText: Ref<string> = ref('')
const replyingTo: Ref<string | null> = ref(null)
const replyText: Ref<string> = ref('')

const isOwner = computed(() => props.post.userId === props.currentUserId)
const isLiked = computed(() => props.post.likedBy.includes(props.currentUserId))

// 取得主留言 (沒有 parentId 的)
const mainComments = computed(() =>
  props.comments.filter(c => !c.parentId)
)

// 取得回覆 (有 parentId 的)
const getReplies = (commentId: string): ForumComment[] => {
  return props.comments.filter(c => c.parentId === commentId)
}

const formatTime = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500',
    'bg-teal-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500'
  ]
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    tech: 'bg-blue-500',
    career: 'bg-purple-500',
    life: 'bg-pink-500',
    learning: 'bg-green-500',
    other: 'bg-slate-500'
  }
  return colors[category] || colors.other
}

const handleSubmitComment = (): void => {
  if (!commentText.value.trim()) return
  emit('addComment', commentText.value.trim())
  commentText.value = ''
}

const handleReply = (commentId: string): void => {
  replyingTo.value = commentId
  replyText.value = ''
}

const handleSubmitReply = (): void => {
  if (!replyText.value.trim() || !replyingTo.value) return
  emit('addComment', replyText.value.trim(), replyingTo.value)
  replyingTo.value = null
  replyText.value = ''
}

const handleCancelReply = (): void => {
  replyingTo.value = null
  replyText.value = ''
}
</script>

<template>
  <div :class="['flex-1 flex flex-col h-full overflow-hidden', darkMode ? 'bg-slate-950' : 'bg-slate-50']">
    <!-- Header -->
    <header :class="[
      'h-16 border-b flex items-center px-4 gap-4 flex-shrink-0',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    ]">
      <button
        @click="emit('back')"
        :class="[
          'p-2 rounded-full transition-colors',
          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        ]"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 :class="['font-bold text-lg truncate', darkMode ? 'text-white' : 'text-slate-800']">
        文章詳情
      </h2>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-3xl mx-auto p-4 space-y-6">
        <!-- 文章本體 -->
        <article :class="[
          'rounded-2xl border overflow-hidden',
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        ]">
          <!-- 作者資訊 -->
          <div class="p-6 pb-4">
            <div class="flex items-start gap-4">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0',
                getAvatarColor(post.userId)
              ]">
                {{ post.userName.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span :class="['font-semibold', darkMode ? 'text-white' : 'text-slate-800']">
                    {{ post.userName }}
                  </span>
                  <span :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  ]">
                    {{ post.userRole }}
                  </span>
                  <span :class="[
                    'text-xs px-2 py-0.5 rounded-full text-white',
                    getCategoryColor(post.category)
                  ]">
                    {{ FORUM_CATEGORY_LABELS[post.category] }}
                  </span>
                </div>
                <p :class="['text-sm mt-1', darkMode ? 'text-slate-500' : 'text-slate-400']">
                  {{ formatTime(post.createdAt) }}
                </p>
              </div>

              <!-- 刪除按鈕 -->
              <button
                v-if="isOwner"
                @click="emit('delete', post.id)"
                :class="[
                  'p-2 rounded-full transition-colors',
                  darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                ]"
                title="刪除文章"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>

            <!-- 標題 -->
            <h1 :class="['text-xl font-bold mt-4', darkMode ? 'text-white' : 'text-slate-800']">
              {{ post.title }}
            </h1>

            <!-- 內容 -->
            <div :class="['mt-4 text-sm leading-relaxed whitespace-pre-wrap', darkMode ? 'text-slate-300' : 'text-slate-700']">
              {{ post.content }}
            </div>

            <!-- 標籤 -->
            <div v-if="post.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="tag in post.tags"
                :key="tag"
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                ]"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- 統計與互動 -->
          <div :class="[
            'flex items-center gap-6 px-6 py-4 border-t',
            darkMode ? 'border-slate-800' : 'border-slate-100'
          ]">
            <button
              @click="emit('like', post.id)"
              :class="[
                'flex items-center gap-2 transition-colors',
                isLiked
                  ? 'text-pink-500'
                  : (darkMode ? 'text-slate-400 hover:text-pink-400' : 'text-slate-500 hover:text-pink-500')
              ]"
            >
              <Heart :class="['w-5 h-5', isLiked ? 'fill-current' : '']" />
              <span class="text-sm">{{ post.likeCount }}</span>
            </button>

            <div :class="['flex items-center gap-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
              <MessageCircle class="w-5 h-5" />
              <span class="text-sm">{{ post.commentCount }}</span>
            </div>

            <div :class="['flex items-center gap-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
              <Eye class="w-5 h-5" />
              <span class="text-sm">{{ post.viewCount }}</span>
            </div>
          </div>
        </article>

        <!-- 留言區 -->
        <section :class="[
          'rounded-2xl border overflow-hidden',
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        ]">
          <div :class="[
            'px-6 py-4 border-b',
            darkMode ? 'border-slate-800' : 'border-slate-100'
          ]">
            <h3 :class="['font-bold', darkMode ? 'text-white' : 'text-slate-800']">
              留言 ({{ comments.length }})
            </h3>
          </div>

          <!-- 新增留言 -->
          <div :class="[
            'p-4 border-b',
            darkMode ? 'border-slate-800' : 'border-slate-100'
          ]">
            <div class="flex gap-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                getAvatarColor(currentUserId)
              ]">
                {{ currentUserName.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <textarea
                  v-model="commentText"
                  :placeholder="'寫下你的想法...'"
                  rows="3"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all outline-none',
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                  ]"
                />
                <div class="flex justify-end mt-2">
                  <button
                    @click="handleSubmitComment"
                    :disabled="!commentText.trim()"
                    :class="[
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      commentText.trim()
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                    ]"
                  >
                    <Send class="w-4 h-4" />
                    發送
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 留言列表 -->
          <div v-if="isLoading" class="p-8 text-center">
            <div :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
              載入中...
            </div>
          </div>

          <div v-else-if="mainComments.length === 0" class="p-8 text-center">
            <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
              還沒有留言，來當第一個留言的人吧！
            </p>
          </div>

          <div v-else class="p-4 space-y-4">
            <div v-for="comment in mainComments" :key="comment.id">
              <CommentItem
                :comment="comment"
                :current-user-id="currentUserId"
                :dark-mode="darkMode"
                @like="emit('likeComment', $event)"
                @reply="handleReply"
                @delete="emit('deleteComment', $event)"
              />

              <!-- 回覆列表 -->
              <div v-if="getReplies(comment.id).length > 0" class="mt-3 space-y-3">
                <CommentItem
                  v-for="reply in getReplies(comment.id)"
                  :key="reply.id"
                  :comment="reply"
                  :current-user-id="currentUserId"
                  :dark-mode="darkMode"
                  :is-reply="true"
                  @like="emit('likeComment', $event)"
                  @delete="emit('deleteComment', $event)"
                />
              </div>

              <!-- 回覆輸入框 -->
              <div v-if="replyingTo === comment.id" class="mt-3 ml-10">
                <div class="flex gap-3">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0',
                    getAvatarColor(currentUserId)
                  ]">
                    {{ currentUserName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <textarea
                      v-model="replyText"
                      :placeholder="`回覆 ${comment.userName}...`"
                      rows="2"
                      :class="[
                        'w-full px-3 py-2 rounded-xl border text-sm resize-none transition-all outline-none',
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                      ]"
                    />
                    <div class="flex justify-end gap-2 mt-2">
                      <button
                        @click="handleCancelReply"
                        :class="[
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                        ]"
                      >
                        取消
                      </button>
                      <button
                        @click="handleSubmitReply"
                        :disabled="!replyText.trim()"
                        :class="[
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          replyText.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                        ]"
                      >
                        回覆
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
