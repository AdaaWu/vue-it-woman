<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Lightbulb, BookOpen, Sparkles, Plus, Trash2 } from 'lucide-vue-next'
import type { Book, TopicCategory } from '@/types'
import { TOPIC_CATEGORY_LABELS } from '@/types'

interface TopicInput {
  category: TopicCategory
  painPoint: string
  painDescription: string
  solution: string
  bookIds: string[]
  icon: string
  color: string
}

interface Props {
  darkMode?: boolean
  books: Book[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: TopicInput]
}>()

// 表單資料
const category = ref<TopicCategory>('career')
const painPoint = ref('')
const painDescription = ref('')
const solution = ref('')
const selectedBookIds = ref<string[]>([])
const selectedIcon = ref('💡')
const selectedColor = ref('from-blue-500 to-indigo-600')

// 分類選項
const categoryOptions = Object.entries(TOPIC_CATEGORY_LABELS).map(([value, label]) => ({
  value: value as TopicCategory,
  label
}))

// 圖示選項
const iconOptions = ['💡', '🧭', '🛠️', '💭', '🎯', '💚', '👥', '🚀', '💪', '📈', '🔥', '⭐']

// 顏色選項
const colorOptions = [
  { value: 'from-blue-500 to-indigo-600', label: '藍色' },
  { value: 'from-emerald-500 to-teal-600', label: '綠色' },
  { value: 'from-purple-500 to-pink-600', label: '紫色' },
  { value: 'from-amber-500 to-orange-600', label: '橘色' },
  { value: 'from-green-500 to-emerald-600', label: '深綠' },
  { value: 'from-rose-500 to-red-600', label: '紅色' },
  { value: 'from-cyan-500 to-blue-600', label: '青色' },
  { value: 'from-fuchsia-500 to-purple-600', label: '桃紅' }
]

// 書籍搜尋
const bookSearchQuery = ref('')
const filteredBooks = computed(() => {
  if (!bookSearchQuery.value.trim()) {
    return props.books.slice(0, 10)
  }
  const query = bookSearchQuery.value.toLowerCase()
  return props.books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  ).slice(0, 10)
})

// 已選書籍
const selectedBooks = computed(() => {
  return selectedBookIds.value
    .map(id => props.books.find(b => b.id === id))
    .filter((book): book is Book => book !== undefined)
})

// 新增書籍
const addBook = (bookId: string) => {
  if (!selectedBookIds.value.includes(bookId)) {
    selectedBookIds.value.push(bookId)
  }
  bookSearchQuery.value = ''
}

// 移除書籍
const removeBook = (bookId: string) => {
  selectedBookIds.value = selectedBookIds.value.filter(id => id !== bookId)
}

// 表單驗證
const isValid = computed(() => {
  return (
    painPoint.value.trim().length > 0 &&
    painDescription.value.trim().length > 0 &&
    solution.value.trim().length > 0 &&
    selectedBookIds.value.length > 0
  )
})

// 提交表單
const handleSubmit = () => {
  if (!isValid.value) return

  emit('submit', {
    category: category.value,
    painPoint: painPoint.value.trim(),
    painDescription: painDescription.value.trim(),
    solution: solution.value.trim(),
    bookIds: selectedBookIds.value,
    icon: selectedIcon.value,
    color: selectedColor.value
  })
}
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
      <!-- 標題 -->
      <div
        :class="[
          'sticky top-0 z-10 flex items-center justify-between p-4 border-b',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        ]"
      >
        <h2 :class="['text-lg font-bold flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
          <Sparkles class="w-5 h-5 text-fuchsia-500" />
          新增議題
        </h2>
        <button
          :class="[
            'p-2 rounded-lg transition-colors',
            darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
          ]"
          @click="emit('close')"
        >
          <X :class="['w-5 h-5', darkMode ? 'text-slate-400' : 'text-slate-500']" />
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- 分類與圖示 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              分類
            </label>
            <select
              v-model="category"
              :class="[
                'w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-800'
              ]"
            >
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              圖示
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                :class="[
                  'w-10 h-10 rounded-lg text-xl transition-all',
                  selectedIcon === icon
                    ? 'bg-fuchsia-500 ring-2 ring-fuchsia-300'
                    : darkMode
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-slate-100 hover:bg-slate-200'
                ]"
                @click="selectedIcon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>
        </div>

        <!-- 主題色 -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            主題色
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              :class="[
                'w-12 h-8 rounded-lg bg-gradient-to-r transition-all',
                color.value,
                selectedColor === color.value
                  ? 'ring-2 ring-offset-2 ring-fuchsia-500'
                  : ''
              ]"
              :title="color.label"
              @click="selectedColor = color.value"
            />
          </div>
        </div>

        <!-- 痛點標題 -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            <span class="flex items-center gap-2">
              <Lightbulb class="w-4 h-4 text-amber-500" />
              痛點標題
            </span>
          </label>
          <input
            v-model="painPoint"
            type="text"
            placeholder="例如：工作好幾年了，但不知道下一步該怎麼走"
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
          <p :class="['mt-1 text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
            用一句話描述讀者可能遇到的困擾
          </p>
        </div>

        <!-- 痛點描述 -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            痛點描述
          </label>
          <textarea
            v-model="painDescription"
            rows="3"
            placeholder="詳細描述這個痛點，讓讀者產生共鳴..."
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
        </div>

        <!-- 解決方案 -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            解決方案概述
          </label>
          <textarea
            v-model="solution"
            rows="2"
            placeholder="說明推薦的書籍能如何幫助解決這個問題..."
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
        </div>

        <!-- 推薦書籍 -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            <span class="flex items-center gap-2">
              <BookOpen class="w-4 h-4 text-fuchsia-500" />
              推薦書籍 ({{ selectedBookIds.length }} 本已選)
            </span>
          </label>

          <!-- 已選書籍 -->
          <div v-if="selectedBooks.length > 0" class="mb-3 space-y-2">
            <div
              v-for="book in selectedBooks"
              :key="book.id"
              :class="[
                'flex items-center justify-between p-3 rounded-xl',
                darkMode ? 'bg-slate-700' : 'bg-slate-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'w-8 h-10 rounded overflow-hidden flex-shrink-0',
                    darkMode ? 'bg-slate-600' : 'bg-slate-200'
                  ]"
                >
                  <img
                    v-if="book.coverUrl"
                    :src="book.coverUrl"
                    :alt="book.title"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p :class="['font-medium text-sm', darkMode ? 'text-white' : 'text-slate-800']">
                    {{ book.title }}
                  </p>
                  <p :class="['text-xs', darkMode ? 'text-slate-400' : 'text-slate-500']">
                    {{ book.author }}
                  </p>
                </div>
              </div>
              <button
                :class="[
                  'p-1.5 rounded-lg transition-colors',
                  darkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                ]"
                @click="removeBook(book.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 書籍搜尋 -->
          <div class="relative">
            <input
              v-model="bookSearchQuery"
              type="text"
              placeholder="搜尋書籍..."
              :class="[
                'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
              ]"
            />

            <!-- 搜尋結果 -->
            <div
              v-if="bookSearchQuery.trim() || filteredBooks.length > 0"
              :class="[
                'mt-2 max-h-48 overflow-y-auto rounded-xl border',
                darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
              ]"
            >
              <button
                v-for="book in filteredBooks"
                :key="book.id"
                :disabled="selectedBookIds.includes(book.id)"
                :class="[
                  'w-full flex items-center gap-3 p-3 text-left transition-colors',
                  selectedBookIds.includes(book.id)
                    ? darkMode
                      ? 'bg-slate-600/50 opacity-50 cursor-not-allowed'
                      : 'bg-slate-100 opacity-50 cursor-not-allowed'
                    : darkMode
                      ? 'hover:bg-slate-600'
                      : 'hover:bg-slate-50'
                ]"
                @click="addBook(book.id)"
              >
                <div
                  :class="[
                    'w-8 h-10 rounded overflow-hidden flex-shrink-0',
                    darkMode ? 'bg-slate-600' : 'bg-slate-200'
                  ]"
                >
                  <img
                    v-if="book.coverUrl"
                    :src="book.coverUrl"
                    :alt="book.title"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p :class="['font-medium text-sm truncate', darkMode ? 'text-white' : 'text-slate-800']">
                    {{ book.title }}
                  </p>
                  <p :class="['text-xs truncate', darkMode ? 'text-slate-400' : 'text-slate-500']">
                    {{ book.author }}
                  </p>
                </div>
                <Plus
                  v-if="!selectedBookIds.includes(book.id)"
                  :class="['w-5 h-5 flex-shrink-0', darkMode ? 'text-slate-400' : 'text-slate-400']"
                />
              </button>
            </div>
          </div>

          <p :class="['mt-2 text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
            選擇與這個議題相關的書籍，至少選擇一本
          </p>
        </div>

        <!-- 預覽 -->
        <div
          v-if="painPoint"
          :class="[
            'p-4 rounded-xl bg-gradient-to-br text-white',
            selectedColor
          ]"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{{ selectedIcon }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">
              {{ TOPIC_CATEGORY_LABELS[category] }}
            </span>
          </div>
          <h3 class="font-bold text-lg mb-1">{{ painPoint || '痛點標題預覽' }}</h3>
          <p class="text-sm text-white/80">{{ selectedBooks.length }} 本推薦書籍</p>
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div
        :class="[
          'sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        ]"
      >
        <button
          :class="[
            'px-4 py-2.5 rounded-xl font-medium transition-colors',
            darkMode
              ? 'text-slate-300 hover:bg-slate-700'
              : 'text-slate-600 hover:bg-slate-100'
          ]"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          :disabled="!isValid"
          :class="[
            'px-6 py-2.5 rounded-xl font-medium transition-all',
            isValid
              ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25'
              : darkMode
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          ]"
          @click="handleSubmit"
        >
          發布議題
        </button>
      </div>
    </div>
  </div>
</template>
