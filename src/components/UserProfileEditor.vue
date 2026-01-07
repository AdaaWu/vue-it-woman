<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { X } from 'lucide-vue-next'
import SkillTagInput from './SkillTagInput.vue'
import type { UserProfile, UserProfileInput } from '../types'
import { ROLE_OPTIONS } from '../types'

interface Props {
  profile: UserProfile | null
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [data: UserProfileInput]
  cancel: []
}>()

// 表單資料
const nickname: Ref<string> = ref('')
const role: Ref<string> = ref('Guest')
const title: Ref<string> = ref('')
const bio: Ref<string> = ref('')
const skills: Ref<string[]> = ref([])
const isSubmitting: Ref<boolean> = ref(false)

// 初始化表單
watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    nickname.value = newProfile.nickname || ''
    role.value = newProfile.role || 'Guest'
    title.value = newProfile.title || ''
    bio.value = newProfile.bio || ''
    skills.value = newProfile.skills ? [...newProfile.skills] : []
  }
}, { immediate: true })

// 驗證
const isValid = (): boolean => {
  return nickname.value.trim().length >= 2 && nickname.value.trim().length <= 20
}

// 儲存
const handleSubmit = (): void => {
  if (!isValid() || isSubmitting.value) return

  isSubmitting.value = true

  emit('save', {
    nickname: nickname.value.trim(),
    role: role.value,
    title: title.value.trim(),
    bio: bio.value.trim(),
    skills: skills.value
  })
}

// 取消
const handleCancel = (): void => {
  emit('cancel')
}

// Bio 字數
const bioLength = (): number => bio.value.length
const bioMaxLength = 200
</script>

<template>
  <div :class="[
    'w-full max-w-md rounded-2xl shadow-xl border overflow-hidden',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div :class="[
      'flex items-center justify-between px-6 py-4 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-100'
    ]">
      <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
        編輯個人檔案
      </h2>
      <button
        @click="handleCancel"
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
      <!-- 暱稱 -->
      <div>
        <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
          暱稱 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="nickname"
          type="text"
          maxlength="20"
          placeholder="你的暱稱"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1', darkMode ? 'text-slate-500' : 'text-slate-400']">
          2-20 字元
        </p>
      </div>

      <!-- 職業角色 -->
      <div>
        <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
          職業角色 <span class="text-red-500">*</span>
        </label>
        <select
          v-model="role"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none appearance-none cursor-pointer',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
          ]"
        >
          <option v-for="opt in ROLE_OPTIONS" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>

      <!-- 職位/頭銜 -->
      <div>
        <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
          職位/頭銜
        </label>
        <input
          v-model="title"
          type="text"
          maxlength="50"
          placeholder="例如：Senior Frontend Engineer"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
      </div>

      <!-- 自我介紹 -->
      <div>
        <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
          自我介紹
        </label>
        <textarea
          v-model="bio"
          rows="3"
          :maxlength="bioMaxLength"
          placeholder="簡單介紹一下自己..."
          :class="[
            'w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none resize-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ bioLength() }}/{{ bioMaxLength }}
        </p>
      </div>

      <!-- 技能標籤 -->
      <div>
        <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
          技能標籤
        </label>
        <SkillTagInput
          v-model="skills"
          :dark-mode="darkMode"
          :max-tags="10"
        />
      </div>

      <!-- 按鈕 -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          @click="handleCancel"
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
          {{ isSubmitting ? '儲存中...' : '儲存變更' }}
        </button>
      </div>
    </form>
  </div>
</template>
