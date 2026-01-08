<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { X } from 'lucide-vue-next'
import SkillTagInput from '../SkillTagInput.vue'
import type { MentorProfile, MentorProfileInput } from '../../types'
import { MAX_MENTEES_OPTIONS } from '../../types'

interface Props {
  profile: MentorProfile | null
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [data: MentorProfileInput]
  cancel: []
}>()

// 表單資料
const isAvailable: Ref<boolean> = ref(true)
const teachingAreas: Ref<string[]> = ref([])
const maxMentees: Ref<number> = ref(2)
const introduction: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)

// 初始化
watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    isAvailable.value = newProfile.isAvailable
    teachingAreas.value = [...newProfile.teachingAreas]
    maxMentees.value = newProfile.maxMentees
    introduction.value = newProfile.introduction
  }
}, { immediate: true })

const isValid = (): boolean => {
  return teachingAreas.value.length > 0 && introduction.value.trim().length >= 10
}

const handleSubmit = (): void => {
  if (!isValid() || isSubmitting.value) return
  isSubmitting.value = true
  emit('save', {
    isAvailable: isAvailable.value,
    teachingAreas: teachingAreas.value,
    maxMentees: maxMentees.value,
    introduction: introduction.value.trim()
  })
}

const introMaxLength = 300
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
          成為導師
        </h2>
        <p :class="['text-sm mt-0.5', darkMode ? 'text-slate-400' : 'text-slate-500']">
          設定你的指導資料，幫助學員找到你
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
      <!-- 開放接受學員 -->
      <div class="flex items-center justify-between">
        <div>
          <label :class="['block text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-700']">
            開放接受學員
          </label>
          <p :class="['text-xs mt-0.5', darkMode ? 'text-slate-500' : 'text-slate-400']">
            關閉後不會出現在導師列表中
          </p>
        </div>
        <button
          type="button"
          @click="isAvailable = !isAvailable"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isAvailable ? 'bg-indigo-600' : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isAvailable ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>

      <!-- 可指導領域 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          可指導領域 <span class="text-red-500">*</span>
        </label>
        <SkillTagInput
          v-model="teachingAreas"
          :dark-mode="darkMode"
          :max-tags="8"
        />
      </div>

      <!-- 最多同時指導人數 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          最多同時指導人數
        </label>
        <div class="flex gap-2">
          <button
            v-for="num in MAX_MENTEES_OPTIONS"
            :key="num"
            type="button"
            @click="maxMentees = num"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              maxMentees === num
                ? 'bg-indigo-600 text-white'
                : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
            ]"
          >
            {{ num }} 人
          </button>
        </div>
      </div>

      <!-- 指導方式介紹 -->
      <div>
        <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
          指導方式介紹 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="introduction"
          rows="4"
          :maxlength="introMaxLength"
          placeholder="例如：我的指導風格、可以幫助的方向、每週可安排的時間..."
          :class="[
            'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ introduction.length }}/{{ introMaxLength }} (至少 10 字)
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
