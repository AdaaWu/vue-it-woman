<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { X } from 'lucide-vue-next'
import SkillTagInput from '@/shared/components/SkillTagInput.vue'
import type { ForumPostInput, ForumCategory } from '@/types'
import { FORUM_CATEGORY_LABELS } from '@/types'

interface Props {
  darkMode: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  save: [data: ForumPostInput]
  cancel: []
}>()

// 表單資料
const category: Ref<ForumCategory> = ref('tech')
const title: Ref<string> = ref('')
const content: Ref<string> = ref('')
const tags: Ref<string[]> = ref([])
const isSubmitting: Ref<boolean> = ref(false)

const categories: { value: ForumCategory; label: string }[] = Object.entries(FORUM_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ForumCategory, label })
)

const isValid = (): boolean => {
  return title.value.trim().length >= 5 &&
    content.value.trim().length >= 10
}

const handleSubmit = (): void => {
  if (!isValid() || isSubmitting.value) return
  isSubmitting.value = true
  emit('save', {
    category: category.value,
    title: title.value.trim(),
    content: content.value.trim(),
    tags: tags.value
  })
}

const titleMaxLength = 100
const contentMaxLength = 2000
</script>

<template>
  <div :class="[
    'w-full max-w-2xl rounded-2xl shadow-xl border overflow-hidden',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div :class="[
      'flex items-center justify-between px-6 py-4 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-100'
    ]">
      <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
        發布新議題
      </h2>
      <button
        @click="emit('cancel')"
        :class="[
          'p-1.5 rounded-full transition-colors',
          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        ]"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
      <!-- 分類選擇 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          分類 <span class="text-red-500">*</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            @click="category = cat.value"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              category === cat.value
                ? 'bg-indigo-600 text-white'
                : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 標題 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          標題 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="title"
          type="text"
          :maxlength="titleMaxLength"
          placeholder="輸入一個吸引人的標題..."
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ title.length }}/{{ titleMaxLength }} (至少 5 字)
        </p>
      </div>

      <!-- 內容 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          內容 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="content"
          rows="8"
          :maxlength="contentMaxLength"
          placeholder="分享你的想法、經驗或問題..."
          :class="[
            'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ content.length }}/{{ contentMaxLength }} (至少 10 字)
        </p>
      </div>

      <!-- 標籤 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          標籤 (選填)
        </label>
        <SkillTagInput
          v-model="tags"
          :dark-mode="darkMode"
          :max-tags="5"
        />
      </div>

      <!-- 按鈕 -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          @click="emit('cancel')"
          :class="[
            'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          ]"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="!isValid() || isSubmitting"
          :class="[
            'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            isValid() && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
          ]"
        >
          {{ isSubmitting ? '發布中...' : '發布' }}
        </button>
      </div>
    </form>
  </div>
</template>
