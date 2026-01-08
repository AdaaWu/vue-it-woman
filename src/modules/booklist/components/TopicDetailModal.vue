<script setup lang="ts">
import { computed } from 'vue'
import { X, Eye, Bookmark, BookOpen, Star, Users, ArrowRight } from 'lucide-vue-next'
import StarRating from './StarRating.vue'
import type { BookTopic, Book, UserBookProgress } from '@/types'
import { TOPIC_CATEGORY_LABELS } from '@/types'

interface Props {
  topic: BookTopic
  books: Book[]
  isSaved?: boolean
  darkMode?: boolean
  getBookProgress?: (bookId: string) => UserBookProgress | undefined
}

const props = withDefaults(defineProps<Props>(), {
  isSaved: false
})

const emit = defineEmits<{
  close: []
  save: []
  selectBook: [book: Book]
}>()

const categoryLabel = computed(() => TOPIC_CATEGORY_LABELS[props.topic.category])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

    <!-- 彈窗內容 -->
    <div
      :class="[
        'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl',
        darkMode ? 'bg-slate-800' : 'bg-white'
      ]"
    >
      <!-- 頂部漸層區域 -->
      <div :class="['relative p-6 pb-8 bg-gradient-to-br text-white', topic.color]">
        <!-- 關閉按鈕 -->
        <button
          class="absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- 標頭 -->
        <div class="flex items-center gap-3 mb-4">
          <span class="text-4xl">{{ topic.icon }}</span>
          <span class="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
            {{ categoryLabel }}
          </span>
        </div>

        <!-- 痛點標題 -->
        <h2 class="text-2xl font-bold mb-3">
          {{ topic.painPoint }}
        </h2>

        <!-- 統計 -->
        <div class="flex items-center gap-6 text-white/90">
          <div class="flex items-center gap-1.5">
            <Eye class="w-4 h-4" />
            <span>{{ topic.viewCount }} 次瀏覽</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Bookmark class="w-4 h-4" />
            <span>{{ topic.saveCount }} 人收藏</span>
          </div>
          <div class="flex items-center gap-1.5">
            <BookOpen class="w-4 h-4" />
            <span>{{ books.length }} 本推薦書籍</span>
          </div>
        </div>
      </div>

      <!-- 內容區域 -->
      <div class="p-6">
        <!-- 痛點描述 -->
        <div class="mb-6">
          <h3 :class="['font-bold mb-2 flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
            <span class="text-xl">😣</span>
            你是不是也有這樣的困擾？
          </h3>
          <p :class="['leading-relaxed', darkMode ? 'text-slate-300' : 'text-slate-600']">
            {{ topic.painDescription }}
          </p>
        </div>

        <!-- 解決方案 -->
        <div
          :class="[
            'p-4 rounded-xl mb-6',
            darkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-fuchsia-50 to-pink-50'
          ]"
        >
          <h3 :class="['font-bold mb-2 flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
            <span class="text-xl">💡</span>
            解決方案
          </h3>
          <p :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
            {{ topic.solution }}
          </p>
        </div>

        <!-- 推薦書籍列表 -->
        <div class="mb-6">
          <h3 :class="['font-bold mb-4 flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
            <span class="text-xl">📚</span>
            推薦閱讀
          </h3>

          <div class="space-y-4">
            <div
              v-for="book in books"
              :key="book.id"
              :class="[
                'flex gap-4 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md',
                darkMode
                  ? 'bg-slate-700/50 hover:bg-slate-700'
                  : 'bg-slate-50 hover:bg-slate-100'
              ]"
              @click="emit('selectBook', book)"
            >
              <!-- 書籍封面 -->
              <div
                :class="[
                  'flex-shrink-0 w-16 h-22 rounded-lg overflow-hidden shadow',
                  darkMode ? 'bg-slate-600' : 'bg-slate-200'
                ]"
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
                  <BookOpen :class="['w-6 h-6', darkMode ? 'text-slate-500' : 'text-slate-400']" />
                </div>
              </div>

              <!-- 書籍資訊 -->
              <div class="flex-1 min-w-0">
                <h4 :class="['font-bold mb-1', darkMode ? 'text-white' : 'text-slate-800']">
                  {{ book.title }}
                </h4>
                <p :class="['text-sm mb-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
                  {{ book.author }}
                </p>

                <div class="flex items-center gap-3">
                  <StarRating
                    :model-value="book.avgRating"
                    :dark-mode="darkMode"
                    readonly
                    size="sm"
                    show-value
                  />
                  <span
                    :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']"
                  >
                    {{ book.reviewCount }} 則評論
                  </span>
                </div>

                <!-- 閱讀進度標籤 -->
                <div
                  v-if="getBookProgress?.(book.id)"
                  :class="[
                    'inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium',
                    getBookProgress(book.id)?.status === 'finished'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : getBookProgress(book.id)?.status === 'reading'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  ]"
                >
                  {{ getBookProgress(book.id)?.status === 'finished' ? '已讀完' : getBookProgress(book.id)?.status === 'reading' ? '閱讀中' : '想讀' }}
                </div>
              </div>

              <!-- 箭頭 -->
              <div class="flex items-center">
                <ArrowRight :class="['w-5 h-5', darkMode ? 'text-slate-500' : 'text-slate-400']" />
              </div>
            </div>
          </div>
        </div>

        <!-- 收藏按鈕 -->
        <div class="flex justify-center">
          <button
            :class="[
              'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
              isSaved
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            ]"
            @click="emit('save')"
          >
            <Bookmark class="w-5 h-5" :class="isSaved ? 'fill-current' : ''" />
            {{ isSaved ? '已收藏此議題' : '收藏此議題' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
