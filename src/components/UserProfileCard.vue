<script setup lang="ts">
import { X, Pencil, Briefcase } from 'lucide-vue-next'
import type { UserProfile } from '../types'

interface Props {
  profile: UserProfile
  darkMode: boolean
  isOwnProfile: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  close: []
}>()
</script>

<template>
  <div :class="[
    'w-full max-w-md rounded-2xl shadow-xl border overflow-hidden',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div :class="[
      'relative px-6 pt-6 pb-4 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-100'
    ]">
      <!-- 關閉按鈕 -->
      <button
        @click="emit('close')"
        :class="[
          'absolute top-4 right-4 p-1.5 rounded-full transition-colors',
          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        ]"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="flex items-start gap-4">
        <!-- 頭像 -->
        <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {{ profile.nickname ? profile.nickname[0].toUpperCase() : '?' }}
        </div>

        <div class="flex-1 min-w-0">
          <!-- 暱稱 -->
          <h3 :class="[
            'text-xl font-bold truncate',
            darkMode ? 'text-white' : 'text-slate-800'
          ]">
            {{ profile.nickname }}
          </h3>

          <!-- 職業角色 -->
          <span :class="[
            'inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
            darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
          ]">
            {{ profile.role }}
          </span>

          <!-- 職位/頭銜 -->
          <div v-if="profile.title" class="flex items-center gap-1.5 mt-2">
            <Briefcase :class="['w-3.5 h-3.5', darkMode ? 'text-slate-500' : 'text-slate-400']" />
            <span :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-600']">
              {{ profile.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自我介紹 -->
    <div v-if="profile.bio" :class="[
      'px-6 py-4 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-100'
    ]">
      <h4 :class="[
        'text-xs font-semibold uppercase tracking-wider mb-2',
        darkMode ? 'text-slate-500' : 'text-slate-400'
      ]">
        關於我
      </h4>
      <p :class="[
        'text-sm leading-relaxed',
        darkMode ? 'text-slate-300' : 'text-slate-600'
      ]">
        {{ profile.bio }}
      </p>
    </div>

    <!-- 技能標籤 -->
    <div v-if="profile.skills && profile.skills.length > 0" :class="[
      'px-6 py-4',
      (isOwnProfile) ? (darkMode ? 'border-b border-slate-800' : 'border-b border-slate-100') : ''
    ]">
      <h4 :class="[
        'text-xs font-semibold uppercase tracking-wider mb-3',
        darkMode ? 'text-slate-500' : 'text-slate-400'
      ]">
        技能
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in profile.skills"
          :key="skill"
          :class="[
            'px-2.5 py-1 rounded-md text-xs font-medium',
            darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
          ]"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <!-- 無資料提示 -->
    <div
      v-if="!profile.bio && (!profile.skills || profile.skills.length === 0)"
      :class="[
        'px-6 py-8 text-center',
        isOwnProfile ? (darkMode ? 'border-b border-slate-800' : 'border-b border-slate-100') : ''
      ]"
    >
      <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
        {{ isOwnProfile ? '點擊下方按鈕完善你的個人檔案' : '這位使用者尚未填寫詳細資料' }}
      </p>
    </div>

    <!-- 編輯按鈕 (自己的檔案才顯示) -->
    <div v-if="isOwnProfile" class="px-6 py-4">
      <button
        @click="emit('edit')"
        :class="[
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          darkMode
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        ]"
      >
        <Pencil class="w-4 h-4" />
        編輯個人檔案
      </button>
    </div>
  </div>
</template>
