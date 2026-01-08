<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { X, GraduationCap, BookOpen } from 'lucide-vue-next'
import SkillTagInput from '../SkillTagInput.vue'
import type { MentorPostInput, MentorPostType } from '../../types'

interface Props {
  darkMode: boolean
  defaultType?: MentorPostType
}

const props = withDefaults(defineProps<Props>(), {
  defaultType: 'offer'
})

const emit = defineEmits<{
  save: [data: MentorPostInput]
  cancel: []
}>()

// 表單資料
const postType: Ref<MentorPostType> = ref(props.defaultType)
const title: Ref<string> = ref('')
const areas: Ref<string[]> = ref([])
const description: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)

const isValid = (): boolean => {
  return title.value.trim().length >= 5 &&
    areas.value.length > 0 &&
    description.value.trim().length >= 20
}

const handleSubmit = (): void => {
  if (!isValid() || isSubmitting.value) return
  isSubmitting.value = true
  emit('save', {
    type: postType.value,
    title: title.value.trim(),
    areas: areas.value,
    description: description.value.trim()
  })
}

const titleMaxLength = 50
const descMaxLength = 500
</script>

<template>
  <div :class="[
    'w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div :class="[
      'flex items-center justify-between px-6 py-4 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-100'
    ]">
      <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
        發布新貼文
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
    <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
      <!-- 類型選擇 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          發布類型
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="postType = 'offer'"
            :class="[
              'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
              postType === 'offer'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : (darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300')
            ]"
          >
            <GraduationCap :class="[
              'w-5 h-5',
              postType === 'offer' ? 'text-indigo-600' : (darkMode ? 'text-slate-400' : 'text-slate-500')
            ]" />
            <div class="text-left">
              <p :class="[
                'text-sm font-medium',
                postType === 'offer'
                  ? (darkMode ? 'text-indigo-400' : 'text-indigo-700')
                  : (darkMode ? 'text-slate-300' : 'text-slate-700')
              ]">
                我想當導師
              </p>
              <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                發布指導邀請
              </p>
            </div>
          </button>

          <button
            type="button"
            @click="postType = 'request'"
            :class="[
              'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
              postType === 'request'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : (darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300')
            ]"
          >
            <BookOpen :class="[
              'w-5 h-5',
              postType === 'request' ? 'text-emerald-600' : (darkMode ? 'text-slate-400' : 'text-slate-500')
            ]" />
            <div class="text-left">
              <p :class="[
                'text-sm font-medium',
                postType === 'request'
                  ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                  : (darkMode ? 'text-slate-300' : 'text-slate-700')
              ]">
                我想找導師
              </p>
              <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                發布學習需求
              </p>
            </div>
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
          :placeholder="postType === 'offer' ? '例如：想幫助前端新手成長' : '例如：想學習 Vue.js 和前端開發'"
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

      <!-- 相關領域 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          {{ postType === 'offer' ? '可指導領域' : '想學習領域' }} <span class="text-red-500">*</span>
        </label>
        <SkillTagInput
          v-model="areas"
          :dark-mode="darkMode"
          :max-tags="6"
        />
      </div>

      <!-- 詳細說明 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          詳細說明 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="description"
          rows="5"
          :maxlength="descMaxLength"
          :placeholder="postType === 'offer'
            ? '介紹你的經驗背景、指導方式、可安排的時間...'
            : '說明你的學習目標、目前程度、期望獲得什麼幫助...'"
          :class="[
            'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ description.length }}/{{ descMaxLength }} (至少 20 字)
        </p>
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
