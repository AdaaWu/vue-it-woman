<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, Users, Share2, MessageSquare } from 'lucide-vue-next'
import StarRating from './StarRating.vue'
import type { Book, ReadingStatus, UserBookProgress } from '@/types'
import { BOOK_CATEGORY_LABELS, READING_STATUS_LABELS } from '@/types'

interface Props {
  book: Book
  progress?: UserBookProgress
  darkMode?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  updateProgress: [status: ReadingStatus]
  share: []
}>()

const categoryLabel = computed(() => BOOK_CATEGORY_LABELS[props.book.category])

const totalReaders = computed(() =>
  props.book.wantToReadCount + props.book.readingCount + props.book.finishedCount
)

const progressLabel = computed(() => {
  if (!props.progress) return null
  return READING_STATUS_LABELS[props.progress.status]
})

const progressColor = computed(() => {
  if (!props.progress) return ''
  switch (props.progress.status) {
    case 'want-to-read': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'reading': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    case 'finished': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    default: return ''
  }
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
      darkMode
        ? 'bg-slate-800 border-slate-700 hover:border-fuchsia-500/50'
        : 'bg-white border-slate-200 hover:border-fuchsia-300'
    ]"
    @click="emit('click')"
  >
    <!-- 封面 -->
    <div class="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-700">
      <img
        v-if="book.coverUrl"
        :src="book.coverUrl"
        :alt="book.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center',
          darkMode ? 'bg-slate-700' : 'bg-slate-100'
        ]"
      >
        <BookOpen :class="['w-12 h-12', darkMode ? 'text-slate-500' : 'text-slate-300']" />
      </div>

      <!-- 閱讀狀態標籤 -->
      <div
        v-if="progressLabel"
        :class="[
          'absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium',
          progressColor
        ]"
      >
        {{ progressLabel }}
      </div>

      <!-- 分類標籤 -->
      <div
        :class="[
          'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
          darkMode
            ? 'bg-slate-800/80 text-slate-200'
            : 'bg-white/80 text-slate-700'
        ]"
      >
        {{ categoryLabel }}
      </div>
    </div>

    <!-- 書籍資訊 -->
    <div class="p-4">
      <h3
        :class="[
          'font-bold text-base line-clamp-2 mb-1',
          darkMode ? 'text-white' : 'text-slate-800'
        ]"
      >
        {{ book.title }}
      </h3>

      <p
        :class="[
          'text-sm mb-2',
          darkMode ? 'text-slate-400' : 'text-slate-500'
        ]"
      >
        {{ book.author }}
      </p>

      <!-- 評分 -->
      <div class="flex items-center gap-2 mb-3">
        <StarRating
          :model-value="book.avgRating"
          :dark-mode="darkMode"
          readonly
          size="sm"
          show-value
        />
        <span
          :class="[
            'text-xs',
            darkMode ? 'text-slate-500' : 'text-slate-400'
          ]"
        >
          ({{ book.reviewCount }} 則評論)
        </span>
      </div>

      <!-- 標籤 -->
      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in book.tags.slice(0, 3)"
          :key="tag"
          :class="[
            'text-xs px-2 py-0.5 rounded-full',
            darkMode
              ? 'bg-slate-700 text-slate-300'
              : 'bg-slate-100 text-slate-600'
          ]"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 統計 -->
      <div
        :class="[
          'flex items-center justify-between pt-3 border-t text-xs',
          darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'
        ]"
      >
        <div class="flex items-center gap-1">
          <Users class="w-3.5 h-3.5" />
          <span>{{ totalReaders }} 人閱讀</span>
        </div>
        <div class="flex items-center gap-1">
          <MessageSquare class="w-3.5 h-3.5" />
          <span>{{ book.reviewCount }}</span>
        </div>
        <button
          :class="[
            'flex items-center gap-1 hover:text-fuchsia-500 transition-colors'
          ]"
          @click.stop="emit('share')"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span>{{ book.shareCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
