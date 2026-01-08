<script setup lang="ts">
import { computed } from 'vue'
import { Eye, Bookmark, BookOpen, ArrowRight } from 'lucide-vue-next'
import type { BookTopic, Book } from '@/types'
import { TOPIC_CATEGORY_LABELS } from '@/types'

interface Props {
  topic: BookTopic
  books: Book[]
  isSaved?: boolean
  darkMode?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSaved: false,
  compact: false
})

const emit = defineEmits<{
  click: []
  save: []
}>()

const categoryLabel = computed(() => TOPIC_CATEGORY_LABELS[props.topic.category])
</script>

<template>
  <!-- 精簡版 (首頁熱門議題) -->
  <div
    v-if="compact"
    :class="[
      'group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1',
      'bg-gradient-to-br',
      topic.color
    ]"
    @click="emit('click')"
  >
    <div class="p-5 text-white">
      <!-- 圖示與分類 -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-3xl">{{ topic.icon }}</span>
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
          {{ categoryLabel }}
        </span>
      </div>

      <!-- 痛點標題 -->
      <h3 class="font-bold text-lg leading-snug mb-2 line-clamp-2">
        {{ topic.painPoint }}
      </h3>

      <!-- 統計 -->
      <div class="flex items-center gap-4 text-sm text-white/80">
        <div class="flex items-center gap-1">
          <Eye class="w-4 h-4" />
          <span>{{ topic.viewCount }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Bookmark class="w-4 h-4" />
          <span>{{ topic.saveCount }}</span>
        </div>
        <div class="flex items-center gap-1">
          <BookOpen class="w-4 h-4" />
          <span>{{ books.length }} 本書</span>
        </div>
      </div>

      <!-- 查看箭頭 -->
      <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight class="w-5 h-5" />
      </div>
    </div>
  </div>

  <!-- 完整版 (議題列表) -->
  <div
    v-else
    :class="[
      'rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1',
      darkMode
        ? 'bg-slate-800 border-slate-700 hover:border-fuchsia-500/50'
        : 'bg-white border-slate-200 hover:border-fuchsia-300'
    ]"
    @click="emit('click')"
  >
    <!-- 頂部漸層條 -->
    <div :class="['h-2 bg-gradient-to-r', topic.color]" />

    <div class="p-5">
      <!-- 標頭 -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ topic.icon }}</span>
          <div>
            <span
              :class="[
                'inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1',
                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              ]"
            >
              {{ categoryLabel }}
            </span>
          </div>
        </div>

        <!-- 收藏按鈕 -->
        <button
          :class="[
            'p-2 rounded-lg transition-colors',
            isSaved
              ? 'text-fuchsia-500'
              : darkMode
                ? 'text-slate-500 hover:text-fuchsia-400 hover:bg-slate-700'
                : 'text-slate-400 hover:text-fuchsia-500 hover:bg-slate-100'
          ]"
          @click.stop="emit('save')"
        >
          <Bookmark class="w-5 h-5" :class="isSaved ? 'fill-current' : ''" />
        </button>
      </div>

      <!-- 痛點標題 -->
      <h3
        :class="[
          'font-bold text-lg leading-snug mb-2',
          darkMode ? 'text-white' : 'text-slate-800'
        ]"
      >
        {{ topic.painPoint }}
      </h3>

      <!-- 痛點描述 -->
      <p
        :class="[
          'text-sm leading-relaxed mb-4 line-clamp-2',
          darkMode ? 'text-slate-400' : 'text-slate-500'
        ]"
      >
        {{ topic.painDescription }}
      </p>

      <!-- 解決方案提示 -->
      <div
        :class="[
          'p-3 rounded-xl mb-4',
          darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
        ]"
      >
        <p :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-600']">
          {{ topic.solution }}
        </p>
      </div>

      <!-- 相關書籍預覽 -->
      <div class="flex items-center gap-2 mb-4">
        <span :class="['text-sm font-medium', darkMode ? 'text-slate-400' : 'text-slate-500']">
          推薦書籍：
        </span>
        <div class="flex -space-x-2">
          <div
            v-for="(book, index) in books.slice(0, 3)"
            :key="book.id"
            :class="[
              'w-8 h-10 rounded border-2 overflow-hidden shadow-sm',
              darkMode ? 'border-slate-800 bg-slate-700' : 'border-white bg-slate-100'
            ]"
            :style="{ zIndex: 3 - index }"
          >
            <img
              v-if="book.coverUrl"
              :src="book.coverUrl"
              :alt="book.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <BookOpen class="w-3 h-3 text-slate-400" />
            </div>
          </div>
          <span
            v-if="books.length > 3"
            :class="[
              'flex items-center justify-center w-8 h-10 rounded text-xs font-medium',
              darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
            ]"
          >
            +{{ books.length - 3 }}
          </span>
        </div>
      </div>

      <!-- 統計 -->
      <div
        :class="[
          'flex items-center justify-between pt-3 border-t text-sm',
          darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'
        ]"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <Eye class="w-4 h-4" />
            <span>{{ topic.viewCount }} 次瀏覽</span>
          </div>
          <div class="flex items-center gap-1">
            <Bookmark class="w-4 h-4" />
            <span>{{ topic.saveCount }} 人收藏</span>
          </div>
        </div>

        <div class="flex items-center gap-1 text-fuchsia-500 font-medium">
          <span>查看詳情</span>
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
</template>
