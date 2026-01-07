<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'

interface Props {
  darkMode: boolean
  mockMode: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  join: [nickname: string, role: string]
}>()

const nickname: Ref<string> = ref('')
const role: Ref<string> = ref('Guest')
const isSubmitting: Ref<boolean> = ref(false)

const roles: string[] = [
  "Guest", "Frontend Dev", "Backend Dev", "Fullstack", "Mobile Dev",
  "Data Scientist", "Product Manager", "UI/UX Designer",
  "QA Engineer", "Engineering Manager", "Student/Learner"
]

const handleSubmit = (): void => {
  if (!nickname.value.trim()) return
  isSubmitting.value = true
  emit('join', nickname.value, role.value)
}
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

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            妳的暱稱
          </label>
          <input
            v-model="nickname"
            type="text"
            required
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition',
              darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'
            ]"
            placeholder="例如：Alice, 轉職中的C"
          />
        </div>

        <div>
          <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
            目前的角色/標籤
          </label>
          <select
            v-model="role"
            :class="[
              'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition',
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            ]"
          >
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <button
          :disabled="isSubmitting"
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-900/20 active:scale-95"
        >
          {{ isSubmitting ? '進入中...' : '加入討論' }}
        </button>
      </form>
    </div>
  </div>
</template>
