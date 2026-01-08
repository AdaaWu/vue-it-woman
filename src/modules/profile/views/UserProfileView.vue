<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import {
  ArrowLeft, Pencil, Github, Linkedin, Twitter, Globe,
  MapPin, Briefcase, Clock, ChevronRight
} from 'lucide-vue-next'
import ProfileGoalsEditor from '../components/ProfileGoalsEditor.vue'
import ProfileStatsCard from '../components/ProfileStatsCard.vue'
import ProfileActivityCard from '../components/ProfileActivityCard.vue'
import type { UserProfile, UserGoal, UserActivity, UserStats, UserSocialLinks } from '@/types'
import { USER_STATUS_OPTIONS } from '@/types'

interface Props {
  profile: UserProfile
  activities: UserActivity[]
  stats: UserStats
  darkMode: boolean
  isOwnProfile: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  back: []
  edit: []
  addGoal: [goal: Omit<UserGoal, 'id' | 'createdAt'>]
  toggleGoal: [goalId: string]
  deleteGoal: [goalId: string]
  updateStatus: [status: string]
  updateSocialLinks: [links: UserSocialLinks]
  clickActivity: [activity: UserActivity]
}>()

const showStatusSelector: Ref<boolean> = ref(false)
const showSocialLinksEditor: Ref<boolean> = ref(false)
const editingSocialLinks: Ref<UserSocialLinks> = ref({})

const getAvatarColor = (userId: string): string => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-indigo-500 to-blue-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-green-500',
    'from-amber-500 to-orange-500'
  ]
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

const formatJoinDate = (timestamp: { seconds: number } | null): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })
}

const handleStatusSelect = (status: string): void => {
  emit('updateStatus', status)
  showStatusSelector.value = false
}

const openSocialLinksEditor = (): void => {
  editingSocialLinks.value = { ...props.profile.socialLinks }
  showSocialLinksEditor.value = true
}

const saveSocialLinks = (): void => {
  emit('updateSocialLinks', editingSocialLinks.value)
  showSocialLinksEditor.value = false
}

const hasSocialLinks = computed(() => {
  const links = props.profile.socialLinks
  return links && (links.github || links.linkedin || links.twitter || links.website)
})
</script>

<template>
  <div :class="['flex-1 flex flex-col h-full overflow-hidden', darkMode ? 'bg-slate-950' : 'bg-slate-50']">
    <!-- Header -->
    <header :class="[
      'h-16 border-b flex items-center px-4 gap-4 flex-shrink-0',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    ]">
      <button
        @click="emit('back')"
        :class="[
          'p-2 rounded-full transition-colors',
          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        ]"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h2 :class="['font-bold text-lg flex-1', darkMode ? 'text-white' : 'text-slate-800']">
        {{ isOwnProfile ? '我的檔案' : profile.nickname }}
      </h2>
      <button
        v-if="isOwnProfile"
        @click="emit('edit')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
          darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        ]"
      >
        <Pencil class="w-4 h-4" />
        編輯
      </button>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto p-4 space-y-4">
        <!-- Profile Card -->
        <div :class="[
          'rounded-2xl border overflow-hidden',
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        ]">
          <!-- Banner -->
          <div :class="['h-24 bg-gradient-to-r', getAvatarColor(profile.userId)]" />

          <!-- Avatar & Info -->
          <div class="px-6 pb-6">
            <div class="flex items-end gap-4 -mt-10">
              <div :class="[
                'w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-4 bg-gradient-to-br shadow-lg',
                darkMode ? 'border-slate-900' : 'border-white',
                getAvatarColor(profile.userId)
              ]">
                {{ profile.nickname.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 pb-1">
                <h1 :class="['text-xl font-bold', darkMode ? 'text-white' : 'text-slate-800']">
                  {{ profile.nickname }}
                </h1>
                <p :class="['text-sm', darkMode ? 'text-indigo-400' : 'text-indigo-600']">
                  {{ profile.role }}
                </p>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="mt-4">
              <button
                v-if="isOwnProfile"
                @click="showStatusSelector = !showStatusSelector"
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  profile.currentStatus
                    ? (darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                    : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                ]"
              >
                {{ profile.currentStatus || '+ 設定目前狀態' }}
              </button>
              <span
                v-else-if="profile.currentStatus"
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                  darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                ]"
              >
                {{ profile.currentStatus }}
              </span>

              <!-- Status Selector Dropdown -->
              <div
                v-if="showStatusSelector && isOwnProfile"
                :class="[
                  'mt-2 p-2 rounded-xl border shadow-lg',
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                ]"
              >
                <button
                  v-for="status in USER_STATUS_OPTIONS"
                  :key="status"
                  @click="handleStatusSelect(status)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    profile.currentStatus === status
                      ? (darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                      : (darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100')
                  ]"
                >
                  {{ status }}
                </button>
              </div>
            </div>

            <!-- Title & Bio -->
            <div v-if="profile.title" class="mt-4 flex items-center gap-2">
              <Briefcase :class="['w-4 h-4', darkMode ? 'text-slate-500' : 'text-slate-400']" />
              <span :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-600']">
                {{ profile.title }}
              </span>
            </div>

            <p v-if="profile.bio" :class="['mt-3 text-sm leading-relaxed', darkMode ? 'text-slate-300' : 'text-slate-700']">
              {{ profile.bio }}
            </p>

            <!-- Skills -->
            <div v-if="profile.skills && profile.skills.length > 0" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="skill in profile.skills"
                :key="skill"
                :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-medium',
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ skill }}
              </span>
            </div>

            <!-- Social Links -->
            <div class="mt-4 flex items-center gap-3">
              <template v-if="hasSocialLinks">
                <a
                  v-if="profile.socialLinks?.github"
                  :href="profile.socialLinks.github"
                  target="_blank"
                  :class="['p-2 rounded-lg transition-colors', darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800']"
                >
                  <Github class="w-5 h-5" />
                </a>
                <a
                  v-if="profile.socialLinks?.linkedin"
                  :href="profile.socialLinks.linkedin"
                  target="_blank"
                  :class="['p-2 rounded-lg transition-colors', darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800']"
                >
                  <Linkedin class="w-5 h-5" />
                </a>
                <a
                  v-if="profile.socialLinks?.twitter"
                  :href="profile.socialLinks.twitter"
                  target="_blank"
                  :class="['p-2 rounded-lg transition-colors', darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800']"
                >
                  <Twitter class="w-5 h-5" />
                </a>
                <a
                  v-if="profile.socialLinks?.website"
                  :href="profile.socialLinks.website"
                  target="_blank"
                  :class="['p-2 rounded-lg transition-colors', darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800']"
                >
                  <Globe class="w-5 h-5" />
                </a>
              </template>
              <button
                v-if="isOwnProfile"
                @click="openSocialLinksEditor"
                :class="[
                  'text-xs px-2 py-1 rounded-lg transition-colors',
                  darkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                ]"
              >
                {{ hasSocialLinks ? '編輯連結' : '+ 新增社群連結' }}
              </button>
            </div>

            <!-- Join Date -->
            <div class="mt-4 flex items-center gap-2">
              <Clock :class="['w-4 h-4', darkMode ? 'text-slate-500' : 'text-slate-400']" />
              <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                {{ formatJoinDate(profile.createdAt) }} 加入
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <ProfileStatsCard :stats="stats" :dark-mode="darkMode" />

        <!-- Goals Card -->
        <ProfileGoalsEditor
          :goals="profile.currentGoals || []"
          :dark-mode="darkMode"
          :editable="isOwnProfile"
          @add="emit('addGoal', $event)"
          @toggle="emit('toggleGoal', $event)"
          @delete="emit('deleteGoal', $event)"
        />

        <!-- Recent Activities -->
        <div :class="[
          'rounded-2xl border overflow-hidden',
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        ]">
          <div :class="[
            'flex items-center justify-between px-4 py-3 border-b',
            darkMode ? 'border-slate-800' : 'border-slate-100'
          ]">
            <h3 :class="['font-bold', darkMode ? 'text-white' : 'text-slate-800']">
              近期活動
            </h3>
            <button
              v-if="activities.length > 5"
              :class="[
                'flex items-center gap-1 text-xs font-medium transition-colors',
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              ]"
            >
              查看全部 <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <div v-if="activities.length > 0" class="divide-y" :class="darkMode ? 'divide-slate-800' : 'divide-slate-100'">
            <ProfileActivityCard
              v-for="activity in activities.slice(0, 5)"
              :key="activity.id"
              :activity="activity"
              :dark-mode="darkMode"
              @click="emit('clickActivity', $event)"
            />
          </div>

          <div v-else :class="['text-center py-8', darkMode ? 'text-slate-500' : 'text-slate-400']">
            <p class="text-sm">尚無活動紀錄</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Social Links Editor Modal -->
    <Teleport to="body">
      <div
        v-if="showSocialLinksEditor"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showSocialLinksEditor = false" />
        <div :class="[
          'relative w-full max-w-md rounded-2xl border p-6 shadow-xl',
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        ]">
          <h3 :class="['text-lg font-bold mb-4', darkMode ? 'text-white' : 'text-slate-800']">
            社群連結
          </h3>

          <div class="space-y-4">
            <div>
              <label class="flex items-center gap-2 text-sm font-medium mb-2">
                <Github :class="['w-4 h-4', darkMode ? 'text-slate-400' : 'text-slate-500']" />
                GitHub
              </label>
              <input
                v-model="editingSocialLinks.github"
                type="url"
                placeholder="https://github.com/username"
                :class="[
                  'w-full px-4 py-2 rounded-xl border text-sm outline-none',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                ]"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium mb-2">
                <Linkedin :class="['w-4 h-4', darkMode ? 'text-slate-400' : 'text-slate-500']" />
                LinkedIn
              </label>
              <input
                v-model="editingSocialLinks.linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                :class="[
                  'w-full px-4 py-2 rounded-xl border text-sm outline-none',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                ]"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium mb-2">
                <Twitter :class="['w-4 h-4', darkMode ? 'text-slate-400' : 'text-slate-500']" />
                Twitter / X
              </label>
              <input
                v-model="editingSocialLinks.twitter"
                type="url"
                placeholder="https://twitter.com/username"
                :class="[
                  'w-full px-4 py-2 rounded-xl border text-sm outline-none',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                ]"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium mb-2">
                <Globe :class="['w-4 h-4', darkMode ? 'text-slate-400' : 'text-slate-500']" />
                個人網站
              </label>
              <input
                v-model="editingSocialLinks.website"
                type="url"
                placeholder="https://yoursite.com"
                :class="[
                  'w-full px-4 py-2 rounded-xl border text-sm outline-none',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                ]"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showSocialLinksEditor = false"
              :class="[
                'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              ]"
            >
              取消
            </button>
            <button
              @click="saveSocialLinks"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
