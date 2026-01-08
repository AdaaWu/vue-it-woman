<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { X, Send, GraduationCap, BookOpen } from 'lucide-vue-next'
import SkillTagInput from '../SkillTagInput.vue'
import type { MentorPost, MentorshipRequest } from '../../types'

interface Props {
  post: MentorPost | null
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  send: [data: MentorshipRequest]
  cancel: []
}>()

// 表單資料
const areas: Ref<string[]> = ref([])
const message: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)

// 初始化表單
watch(() => props.post, (newPost) => {
  if (newPost) {
    areas.value = [...newPost.areas]
    message.value = ''
  }
}, { immediate: true })

const isValid = computed((): boolean => {
  return areas.value.length > 0 && message.value.trim().length >= 10
})

const handleSubmit = (): void => {
  if (!isValid.value || isSubmitting.value || !props.post) return
  isSubmitting.value = true
  emit('send', {
    targetUserId: props.post.userId,
    areas: areas.value,
    message: message.value.trim()
  })
}

const messageMaxLength = 300

const typeLabel = computed(() => {
  if (!props.post) return ''
  return props.post.type === 'offer' ? '申請成為學員' : '申請成為導師'
})

const typeIcon = computed(() => {
  if (!props.post) return GraduationCap
  return props.post.type === 'offer' ? BookOpen : GraduationCap
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="post"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- 背景遮罩 -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="emit('cancel')"
      />

      <!-- Modal 內容 -->
      <div :class="[
        'relative w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden',
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      ]">
        <!-- Header -->
        <div :class="[
          'flex items-center justify-between px-6 py-4 border-b',
          darkMode ? 'border-slate-800' : 'border-slate-100'
        ]">
          <div class="flex items-center gap-3">
            <div :class="[
              'p-2 rounded-lg',
              post.type === 'offer'
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-indigo-100 dark:bg-indigo-900/30'
            ]">
              <component
                :is="typeIcon"
                :class="[
                  'w-5 h-5',
                  post.type === 'offer' ? 'text-emerald-600' : 'text-indigo-600'
                ]"
              />
            </div>
            <div>
              <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
                {{ typeLabel }}
              </h2>
              <p :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
                向 {{ post.userName }} 發送配對請求
              </p>
            </div>
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

        <!-- 原貼文摘要 -->
        <div :class="[
          'px-6 py-4 border-b',
          darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        ]">
          <h3 :class="['font-medium mb-1', darkMode ? 'text-white' : 'text-slate-800']">
            {{ post.title }}
          </h3>
          <p :class="['text-sm line-clamp-2', darkMode ? 'text-slate-400' : 'text-slate-600']">
            {{ post.description }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <!-- 相關領域 -->
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              希望學習/指導的領域 <span class="text-red-500">*</span>
            </label>
            <SkillTagInput
              v-model="areas"
              :dark-mode="darkMode"
              :max-tags="5"
            />
            <p :class="['text-xs mt-1', darkMode ? 'text-slate-500' : 'text-slate-400']">
              從對方的領域中選擇你感興趣的
            </p>
          </div>

          <!-- 訊息 -->
          <div>
            <label :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-700']">
              自我介紹與動機 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="message"
              rows="4"
              :maxlength="messageMaxLength"
              :placeholder="post.type === 'offer'
                ? '介紹一下自己，說明為什麼想跟這位導師學習...'
                : '介紹你的背景經驗，說明為什麼想指導這位學員...'"
              :class="[
                'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none',
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
              ]"
            />
            <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
              {{ message.length }}/{{ messageMaxLength }} (至少 10 字)
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
              :disabled="!isValid || isSubmitting"
              :class="[
                'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                isValid && !isSubmitting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : (darkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
              ]"
            >
              <Send v-if="!isSubmitting" class="w-4 h-4" />
              {{ isSubmitting ? '發送中...' : '發送請求' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
