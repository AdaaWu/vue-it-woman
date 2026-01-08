<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import MessageBubble from './MessageBubble.vue'
import type { Message } from '@/types'

interface Props {
  messages: Message[]
  currentUserId: string
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  clickAvatar: [userId: string]
}>()

const messagesEndRef: Ref<HTMLElement | null> = ref(null)
const scrollContainerRef: Ref<HTMLElement | null> = ref(null)
const floatingDate = ref<string>('')
const showFloatingDate = ref(false)
const dateRefs = ref<Map<string, HTMLElement>>(new Map())

// 取得訊息的日期 key（YYYY-MM-DD）
const getDateKey = (msg: Message): string => {
  if (!msg.timestamp) return 'unknown'
  const ms = msg.timestamp.toMillis ? msg.timestamp.toMillis() : msg.timestamp.seconds * 1000
  const date = new Date(ms)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化日期顯示
const formatDateLabel = (dateKey: string): string => {
  if (dateKey === 'unknown') return ''

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  const dayBeforeYesterday = new Date(today)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)
  const dayBeforeYesterdayKey = `${dayBeforeYesterday.getFullYear()}-${String(dayBeforeYesterday.getMonth() + 1).padStart(2, '0')}-${String(dayBeforeYesterday.getDate()).padStart(2, '0')}`

  if (dateKey === todayKey) return '今天'
  if (dateKey === yesterdayKey) return '昨天'
  if (dateKey === dayBeforeYesterdayKey) return '前天'

  // 其他日期顯示 MM/DD（週X）
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${month}/${day}（週${weekDays[date.getDay()]}）`
}

// 將訊息按日期分組
const groupedMessages = computed(() => {
  const groups: { dateKey: string; dateLabel: string; messages: Message[] }[] = []
  let currentDateKey = ''

  for (const msg of props.messages) {
    const dateKey = getDateKey(msg)
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey
      groups.push({
        dateKey,
        dateLabel: formatDateLabel(dateKey),
        messages: [msg]
      })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return groups
})

// 取得訊息在原始陣列中的索引
const getOriginalIndex = (msg: Message): number => {
  return props.messages.findIndex(m => m.id === msg.id)
}

// 檢查是否為自己的訊息
const isMyMessage = (msg: Message): boolean => msg.userId === props.currentUserId

// 檢查是否顯示頭像
const shouldShowAvatar = (index: number): boolean => {
  return index === 0 || props.messages[index - 1].userId !== props.messages[index].userId
}

// 處理滾動事件
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const handleScroll = () => {
  const container = scrollContainerRef.value
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const containerTop = containerRect.top

  // 找出目前可視區域頂部的日期
  let currentDate = ''

  for (const [dateKey, element] of dateRefs.value) {
    const rect = element.getBoundingClientRect()
    // 如果日期分隔線在容器頂部以下（還沒滾過去）
    if (rect.top <= containerTop + 60) {
      currentDate = dateKey
    }
  }

  if (currentDate && currentDate !== 'unknown') {
    floatingDate.value = formatDateLabel(currentDate)
    showFloatingDate.value = true

    // 清除之前的 timeout
    if (scrollTimeout) clearTimeout(scrollTimeout)

    // 停止滾動後 1.5 秒隱藏
    scrollTimeout = setTimeout(() => {
      showFloatingDate.value = false
    }, 1500)
  }
}

// 設定日期元素的 ref
const setDateRef = (dateKey: string, el: HTMLElement | null) => {
  if (el) {
    dateRefs.value.set(dateKey, el)
  } else {
    dateRefs.value.delete(dateKey)
  }
}

onMounted(() => {
  scrollContainerRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  scrollContainerRef.value?.removeEventListener('scroll', handleScroll)
  if (scrollTimeout) clearTimeout(scrollTimeout)
})

// 自動捲動到底部
watch(() => props.messages, async () => {
  await nextTick()
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
}, { deep: true })
</script>

<template>
  <div
    ref="scrollContainerRef"
    :class="['flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 relative', darkMode ? 'bg-slate-950/50' : 'bg-slate-50/50']"
  >
    <!-- 浮動日期標籤 -->
    <Transition name="fade">
      <div
        v-if="showFloatingDate && floatingDate"
        :class="[
          'sticky top-2 z-10 flex justify-center pointer-events-none'
        ]"
      >
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm',
            darkMode ? 'bg-slate-800/90 text-slate-200' : 'bg-white/90 text-slate-600'
          ]"
        >
          {{ floatingDate }}
        </span>
      </div>
    </Transition>

    <!-- 依日期分組的訊息 -->
    <template v-for="group in groupedMessages" :key="group.dateKey">
      <!-- 日期分隔線 -->
      <div
        v-if="group.dateLabel"
        :ref="(el) => setDateRef(group.dateKey, el as HTMLElement)"
        class="flex items-center justify-center py-2"
      >
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs',
            darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'
          ]"
        >
          {{ group.dateLabel }}
        </span>
      </div>

      <!-- 該日期的訊息 -->
      <MessageBubble
        v-for="msg in group.messages"
        :key="msg.id"
        :message="msg"
        :is-own="isMyMessage(msg)"
        :show-avatar="shouldShowAvatar(getOriginalIndex(msg))"
        :dark-mode="darkMode"
        @click-avatar="emit('clickAvatar', $event)"
      />
    </template>

    <div ref="messagesEndRef" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
