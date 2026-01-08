<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { X } from 'lucide-vue-next'
import SkillTagInput from '../SkillTagInput.vue'
import type { MenteeProfile, MenteeProfileInput } from '../../types'
import { LEVEL_OPTIONS } from '../../types'

interface Props {
  profile: MenteeProfile | null
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [data: MenteeProfileInput]
  cancel: []
}>()

// 表單資料
const isLooking: Ref<boolean> = ref(true)
const learningGoals: Ref<string[]> = ref([])
const currentLevel: Ref<string> = ref(LEVEL_OPTIONS[1])
const expectations: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)

// 初始化
watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    isLooking.value = newProfile.isLooking
    learningGoals.value = [...newProfile.learningGoals]
    currentLevel.value = newProfile.currentLevel
    expectations.value = newProfile.expectations
  }
}, { immediate: true })

const isValid = (): boolean => {
  return learningGoals.value.length > 0 && expectations.value.trim().length >= 10
}

const handleSubmit = (): void => {
  if (!isValid() || isSubmitting.value) return
  isSubmitting.value = true
  emit('save', {
    isLooking: isLooking.value,
    learningGoals: learningGoals.value,
    currentLevel: currentLevel.value,
    expectations: expectations.value.trim()
  })
}

const expectationsMaxLength = 300
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
      <div>
        <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
          尋找導師
        </h2>
        <p :class="['text-sm mt-0.5', darkMode ? 'text-slate-400' : 'text-slate-500']">
          設定你的學習目標，讓導師認識你
        </p>
      </div>
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
      <!-- 正在尋找導師 -->
      <div class="flex items-center justify-between">
        <div>
          <label :class="['block text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-700']">
            正在尋找導師
          </label>
          <p :class="['text-xs mt-0.5', darkMode ? 'text-slate-500' : 'text-slate-400']">
            關閉後不會出現在學員列表中
          </p>
        </div>
        <button
          type="button"
          @click="isLooking = !isLooking"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isLooking ? 'bg-indigo-600' : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isLooking ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>

      <!-- 想學習的領域 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          想學習的領域 <span class="text-red-500">*</span>
        </label>
        <SkillTagInput
          v-model="learningGoals"
          :dark-mode="darkMode"
          :max-tags="8"
        />
      </div>

      <!-- 目前程度 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          目前程度
        </label>
        <select
          v-model="currentLevel"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none appearance-none cursor-pointer',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
          ]"
        >
          <option v-for="level in LEVEL_OPTIONS" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
      </div>

      <!-- 學習目標與期望 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          學習目標與期望 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="expectations"
          rows="4"
          :maxlength="expectationsMaxLength"
          placeholder="例如：你想達成什麼目標？希望導師如何幫助你？可以投入多少時間學習？"
          :class="[
            'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ expectations.length }}/{{ expectationsMaxLength }} (至少 10 字)
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
          {{ isSubmitting ? '儲存中...' : '儲存設定' }}
        </button>
      </div>
    </form>
  </div>
</template>
