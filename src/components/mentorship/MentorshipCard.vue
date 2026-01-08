<script setup lang="ts">
import { computed } from 'vue'
import { User, MessageCircle, Check, X, CheckCircle } from 'lucide-vue-next'
import MentorshipStatusBadge from './MentorshipStatusBadge.vue'
import type { Mentorship } from '../../types'

interface Props {
  mentorship: Mentorship
  currentUserId: string
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  accept: [id: string]
  reject: [id: string]
  complete: [id: string]
  viewProfile: [userId: string]
}>()

// 是否為導師
const isMentor = computed(() => props.mentorship.mentorId === props.currentUserId)

// 對方資料
const partnerName = computed(() =>
  isMentor.value ? props.mentorship.menteeName : props.mentorship.mentorName
)

const partnerRole = computed(() =>
  isMentor.value ? '學員' : '導師'
)

// 是否可以操作
const canAccept = computed(() => {
  const { status, mentorId, menteeId, initiatedBy } = props.mentorship
  const userId = props.currentUserId
  // 等待我方回應
  if (status === 'pending_mentor' && userId === mentorId && initiatedBy !== userId) return true
  if (status === 'pending_mentee' && userId === menteeId && initiatedBy !== userId) return true
  return false
})

const canReject = computed(() => canAccept.value)

const canComplete = computed(() => props.mentorship.status === 'active')

// 等待中訊息
const pendingMessage = computed(() => {
  const { status, initiatedBy } = props.mentorship
  const userId = props.currentUserId
  if (status === 'pending_mentor' || status === 'pending_mentee') {
    if (initiatedBy === userId) {
      return '等待對方回應...'
    }
  }
  return null
})

// 格式化時間
const formatDate = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return ''
  return new Date(timestamp.seconds * 1000).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div :class="[
    'rounded-xl border p-4 transition-all',
    darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
  ]">
    <!-- 頭部 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <!-- 頭像 -->
        <button
          @click="emit('viewProfile', isMentor ? mentorship.menteeId : mentorship.mentorId)"
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105',
            darkMode ? 'bg-slate-700' : 'bg-slate-100'
          ]"
        >
          <User :class="['w-5 h-5', darkMode ? 'text-slate-400' : 'text-slate-500']" />
        </button>
        <div>
          <button
            @click="emit('viewProfile', isMentor ? mentorship.menteeId : mentorship.mentorId)"
            :class="[
              'font-medium hover:underline text-left',
              darkMode ? 'text-white' : 'text-slate-800'
            ]"
          >
            {{ partnerName || '用戶' }}
          </button>
          <p :class="['text-xs', darkMode ? 'text-slate-400' : 'text-slate-500']">
            {{ partnerRole }}
          </p>
        </div>
      </div>
      <MentorshipStatusBadge :status="mentorship.status" :dark-mode="darkMode" />
    </div>

    <!-- 領域標籤 -->
    <div v-if="mentorship.areas.length > 0" class="flex flex-wrap gap-1.5 mb-3">
      <span
        v-for="area in mentorship.areas"
        :key="area"
        :class="[
          'px-2 py-0.5 rounded-full text-xs',
          darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
        ]"
      >
        {{ area }}
      </span>
    </div>

    <!-- 訊息 -->
    <div v-if="mentorship.message" :class="[
      'text-sm mb-3 p-3 rounded-lg',
      darkMode ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-50 text-slate-600'
    ]">
      <div class="flex items-start gap-2">
        <MessageCircle class="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
        <p class="line-clamp-3">{{ mentorship.message }}</p>
      </div>
    </div>

    <!-- 等待中提示 -->
    <p v-if="pendingMessage" :class="[
      'text-sm mb-3',
      darkMode ? 'text-amber-400' : 'text-amber-600'
    ]">
      {{ pendingMessage }}
    </p>

    <!-- 拒絕原因 -->
    <p v-if="mentorship.status === 'rejected' && mentorship.rejectionReason" :class="[
      'text-sm mb-3',
      darkMode ? 'text-red-400' : 'text-red-600'
    ]">
      拒絕原因：{{ mentorship.rejectionReason }}
    </p>

    <!-- 時間 -->
    <div :class="['text-xs mb-3', darkMode ? 'text-slate-500' : 'text-slate-400']">
      <span v-if="mentorship.status === 'active' && mentorship.acceptedAt">
        配對於 {{ formatDate(mentorship.acceptedAt) }}
      </span>
      <span v-else-if="mentorship.status === 'completed' && mentorship.completedAt">
        結束於 {{ formatDate(mentorship.completedAt) }}
      </span>
      <span v-else>
        建立於 {{ formatDate(mentorship.createdAt) }}
      </span>
    </div>

    <!-- 操作按鈕 -->
    <div v-if="canAccept || canReject || canComplete" class="flex gap-2 pt-2 border-t" :class="darkMode ? 'border-slate-700' : 'border-slate-100'">
      <button
        v-if="canAccept"
        @click="emit('accept', mentorship.id)"
        :class="[
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'bg-emerald-600 text-white hover:bg-emerald-700'
        ]"
      >
        <Check class="w-4 h-4" />
        接受
      </button>
      <button
        v-if="canReject"
        @click="emit('reject', mentorship.id)"
        :class="[
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          darkMode
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        ]"
      >
        <X class="w-4 h-4" />
        婉拒
      </button>
      <button
        v-if="canComplete"
        @click="emit('complete', mentorship.id)"
        :class="[
          'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          darkMode
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        ]"
      >
        <CheckCircle class="w-4 h-4" />
        結束配對
      </button>
    </div>
  </div>
</template>
