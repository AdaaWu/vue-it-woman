<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, BookPlus, Image } from 'lucide-vue-next'
import SkillTagInput from '@/shared/components/SkillTagInput.vue'
import type { BookInput, BookCategory } from '@/types'
import { BOOK_CATEGORY_LABELS } from '@/types'

interface Props {
  darkMode?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: BookInput]
}>()

const title = ref('')
const author = ref('')
const category = ref<BookCategory>('tech')
const coverUrl = ref('')
const description = ref('')
const tags = ref<string[]>([])

const isValid = computed(() =>
  title.value.trim() &&
  author.value.trim() &&
  description.value.trim().length >= 10
)

const categories = Object.entries(BOOK_CATEGORY_LABELS) as [BookCategory, string][]

const suggestedTags = [
  '程式設計', '軟體工程', '前端', '後端', '資料庫',
  '職涯規劃', '面試', '領導力', '管理',
  '習慣養成', '時間管理', '生產力', '學習方法',
  '創業', '行銷', '產品設計', '使用者體驗'
]

const handleSubmit = () => {
  if (!isValid.value) return

  emit('submit', {
    title: title.value.trim(),
    author: author.value.trim(),
    category: category.value,
    coverUrl: coverUrl.value.trim() || undefined,
    description: description.value.trim(),
    tags: tags.value
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

    <!-- 編輯器 -->
    <div
      :class="[
        'relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl',
        darkMode ? 'bg-slate-800' : 'bg-white'
      ]"
    >
      <!-- 標題列 -->
      <div
        :class="[
          'sticky top-0 z-10 flex items-center justify-between p-4 border-b',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        ]"
      >
        <div class="flex items-center gap-2">
          <BookPlus :class="['w-5 h-5', darkMode ? 'text-fuchsia-400' : 'text-fuchsia-500']" />
          <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
            推薦好書
          </h2>
        </div>
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

      <!-- 表單內容 -->
      <form class="p-4 space-y-4" @submit.prevent="handleSubmit">
        <!-- 書名 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            書名 *
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="輸入書籍名稱"
            :class="[
              'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
        </div>

        <!-- 作者 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            作者 *
          </label>
          <input
            v-model="author"
            type="text"
            placeholder="輸入作者名稱"
            :class="[
              'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
        </div>

        <!-- 分類 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            分類
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="[value, label] in categories"
              :key="value"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                category === value
                  ? 'bg-fuchsia-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
              @click="category = value"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <!-- 封面圖片 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            封面圖片 (選填)
          </label>
          <div class="flex gap-3">
            <input
              v-model="coverUrl"
              type="url"
              placeholder="輸入圖片網址"
              :class="[
                'flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
              ]"
            />
            <div
              v-if="coverUrl"
              class="w-16 h-20 rounded-lg overflow-hidden border"
              :class="darkMode ? 'border-slate-600' : 'border-slate-300'"
            >
              <img :src="coverUrl" alt="封面預覽" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              :class="[
                'w-16 h-20 rounded-lg border-2 border-dashed flex items-center justify-center',
                darkMode ? 'border-slate-600' : 'border-slate-300'
              ]"
            >
              <Image :class="['w-6 h-6', darkMode ? 'text-slate-500' : 'text-slate-400']" />
            </div>
          </div>
        </div>

        <!-- 簡介 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            簡介 * (至少 10 字)
          </label>
          <textarea
            v-model="description"
            rows="4"
            placeholder="簡單介紹這本書的內容與你推薦的原因..."
            :class="[
              'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
            ]"
          />
          <p :class="['text-xs mt-1', darkMode ? 'text-slate-500' : 'text-slate-400']">
            {{ description.length }} / 10 字
          </p>
        </div>

        <!-- 標籤 -->
        <div>
          <label
            :class="['block text-sm font-medium mb-1', darkMode ? 'text-slate-300' : 'text-slate-700']"
          >
            標籤 (選填)
          </label>
          <SkillTagInput
            v-model="tags"
            :suggestions="suggestedTags"
            placeholder="新增標籤..."
            :dark-mode="darkMode"
          />
        </div>

        <!-- 提交按鈕 -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              darkMode
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="!isValid"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition-all',
              isValid
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25'
                : darkMode
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            ]"
          >
            推薦這本書
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
