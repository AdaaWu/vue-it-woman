<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import SkillTagInput from './SkillTagInput.vue'
import type { UserProfileInput } from '../types'
import { ROLE_OPTIONS } from '../types'

interface Props {
  darkMode: boolean
  mockMode: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  join: [profile: UserProfileInput]
}>()

const nickname: Ref<string> = ref('')
const role: Ref<string> = ref('Guest')
const title: Ref<string> = ref('')
const bio: Ref<string> = ref('')
const skills: Ref<string[]> = ref([])
const isSubmitting: Ref<boolean> = ref(false)
const showOptional: Ref<boolean> = ref(false)

const handleSubmit = (): void => {
  if (!nickname.value.trim()) return
  isSubmitting.value = true
  emit('join', {
    nickname: nickname.value.trim(),
    role: role.value,
    title: title.value.trim(),
    bio: bio.value.trim(),
    skills: skills.value
  })
}

const bioMaxLength = 200
</script>

<template>
  <div :class="[
    'min-h-screen flex items-center justify-center p-4 transition-colors duration-500',
    darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 to-purple-100'
  ]">
    <div :class="[
      'rounded-2xl shadow-xl p-8 w-full max-w-md border transition-all',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-100'
    ]">
      <div class="text-center mb-8">
        <div class="bg-indigo-600 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <span class="text-white font-bold text-base tracking-wide">&lt;/&gt;</span>
        </div>
        <h1 :class="['text-4xl font-extrabold tracking-tight mb-2 flex items-baseline justify-center', darkMode ? 'text-white' : 'text-slate-800']">
          <span :class="darkMode ? 'text-slate-100' : 'text-slate-800'">IT</span>
          <span class="text-indigo-600 ml-0.5 relative">
            Her
            <span class="absolute -right-3 bottom-1 w-2 h-2 bg-indigo-400 rounded-full"></span>
          </span>
        </h1>
        <p :class="darkMode ? 'text-slate-400' : 'text-slate-500'">
          科技女性的專屬避風港
        </p>
        <p v-if="mockMode" class="mt-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full inline-block">
          Demo 模式 - 資料不會儲存
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- 暱稱 (必填) -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            妳的暱稱 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="nickname"
            type="text"
            required
            maxlength="20"
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition',
              darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'
            ]"
            placeholder="例如：Alice, 轉職中的C"
          />
        </div>

        <!-- 職業角色 (必填) -->
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            目前的角色 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="role"
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer',
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            ]"
          >
            <option v-for="r in ROLE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <!-- 展開選填欄位按鈕 -->
        <button
          type="button"
          @click="showOptional = !showOptional"
          :class="[
            'w-full flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors',
            darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
          ]"
        >
          {{ showOptional ? '收起選填資料' : '完善個人檔案 (選填)' }}
          <ChevronUp v-if="showOptional" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>

        <!-- 選填欄位 -->
        <div v-if="showOptional" class="space-y-5 pt-2">
          <!-- 職位/頭銜 -->
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              職位/頭銜
            </label>
            <input
              v-model="title"
              type="text"
              maxlength="50"
              :class="[
                'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition',
                darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'
              ]"
              placeholder="例如：Senior Frontend Engineer"
            />
          </div>

          <!-- 自我介紹 -->
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              自我介紹
            </label>
            <textarea
              v-model="bio"
              rows="3"
              :maxlength="bioMaxLength"
              :class="[
                'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none',
                darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'
              ]"
              placeholder="簡單介紹一下自己..."
            />
            <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
              {{ bio.length }}/{{ bioMaxLength }}
            </p>
          </div>

          <!-- 技能標籤 -->
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              技能標籤
            </label>
            <SkillTagInput
              v-model="skills"
              :dark-mode="darkMode"
              :max-tags="10"
            />
          </div>
        </div>

        <button
          :disabled="isSubmitting || !nickname.trim()"
          type="submit"
          :class="[
            'w-full font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-900/20 active:scale-95',
            isSubmitting || !nickname.trim()
              ? (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          ]"
        >
          {{ isSubmitting ? '進入中...' : '加入討論' }}
        </button>
      </form>
    </div>
  </div>
</template>
