<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import {
  Users, Search, FileText, Heart, Plus,
  GraduationCap, BookOpen, Settings, RefreshCw
} from 'lucide-vue-next'
import MentorPostCard from './MentorPostCard.vue'
import MentorPostEditor from './MentorPostEditor.vue'
import MentorshipCard from './MentorshipCard.vue'
import MentorshipRequestModal from './MentorshipRequestModal.vue'
import MentorProfileSetup from './MentorProfileSetup.vue'
import MenteeProfileSetup from './MenteeProfileSetup.vue'
import type {
  MentorPost, MentorPostInput, Mentorship, MentorshipRequest,
  MentorProfile, MenteeProfile, MentorProfileInput, MenteeProfileInput,
  UserProfile
} from '../../types'

interface Props {
  darkMode: boolean
  userId: string
  userProfile: UserProfile | null
  // 資料
  mentorPosts: MentorPost[]
  myMentorships: Mentorship[]
  myMentorProfile: MentorProfile | null
  myMenteeProfile: MenteeProfile | null
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  // 貼文操作
  createPost: [data: MentorPostInput]
  deletePost: [id: string]
  // 配對操作
  requestMentorship: [data: MentorshipRequest, postType: 'offer' | 'request']
  acceptMentorship: [id: string]
  rejectMentorship: [id: string]
  completeMentorship: [id: string]
  // Profile 操作
  updateMentorProfile: [data: MentorProfileInput]
  updateMenteeProfile: [data: MenteeProfileInput]
  // 其他
  viewProfile: [userId: string]
  refresh: []
}>()

// 分頁
type TabType = 'explore' | 'myPosts' | 'myMentorships' | 'settings'
const activeTab: Ref<TabType> = ref('explore')

// 篩選
const filterType: Ref<'all' | 'offer' | 'request'> = ref('all')

// Modal 狀態
const showPostEditor: Ref<boolean> = ref(false)
const showRequestModal: Ref<boolean> = ref(false)
const selectedPost: Ref<MentorPost | null> = ref(null)
const showMentorSetup: Ref<boolean> = ref(false)
const showMenteeSetup: Ref<boolean> = ref(false)
const defaultPostType: Ref<'offer' | 'request'> = ref('offer')

// 篩選後的貼文
const filteredPosts: ComputedRef<MentorPost[]> = computed(() => {
  let posts = props.mentorPosts.filter(p => p.status === 'active')
  if (filterType.value !== 'all') {
    posts = posts.filter(p => p.type === filterType.value)
  }
  return posts
})

// 我的貼文
const myPosts: ComputedRef<MentorPost[]> = computed(() => {
  return props.mentorPosts.filter(p => p.userId === props.userId)
})

// 等待回應的配對
const pendingMentorships: ComputedRef<Mentorship[]> = computed(() => {
  return props.myMentorships.filter(m =>
    m.status === 'pending_mentor' || m.status === 'pending_mentee'
  )
})

// 進行中的配對
const activeMentorships: ComputedRef<Mentorship[]> = computed(() => {
  return props.myMentorships.filter(m => m.status === 'active')
})

// 已結束的配對
const completedMentorships: ComputedRef<Mentorship[]> = computed(() => {
  return props.myMentorships.filter(m =>
    m.status === 'completed' || m.status === 'rejected'
  )
})

// 開啟發布編輯器
const openPostEditor = (type: 'offer' | 'request' = 'offer'): void => {
  defaultPostType.value = type
  showPostEditor.value = true
}

// 開啟配對請求 Modal
const openRequestModal = (post: MentorPost): void => {
  selectedPost.value = post
  showRequestModal.value = true
}

// 處理發布儲存
const handlePostSave = (data: MentorPostInput): void => {
  emit('createPost', data)
  showPostEditor.value = false
}

// 處理配對請求
const handleRequestSend = (data: MentorshipRequest): void => {
  if (selectedPost.value) {
    emit('requestMentorship', data, selectedPost.value.type)
  }
  showRequestModal.value = false
  selectedPost.value = null
}

// 處理導師 Profile 儲存
const handleMentorProfileSave = (data: MentorProfileInput): void => {
  emit('updateMentorProfile', data)
  showMentorSetup.value = false
}

// 處理學員 Profile 儲存
const handleMenteeProfileSave = (data: MenteeProfileInput): void => {
  emit('updateMenteeProfile', data)
  showMenteeSetup.value = false
}

// Tab 定義
const tabs = [
  { id: 'explore' as TabType, label: '探索', icon: Search },
  { id: 'myPosts' as TabType, label: '我的發布', icon: FileText },
  { id: 'myMentorships' as TabType, label: '我的配對', icon: Heart },
  { id: 'settings' as TabType, label: '設定', icon: Settings }
]
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div :class="[
      'flex-shrink-0 px-4 py-3 border-b',
      darkMode ? 'border-slate-800' : 'border-slate-200'
    ]">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Users :class="['w-5 h-5', darkMode ? 'text-indigo-400' : 'text-indigo-600']" />
          <h1 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
            導師計畫
          </h1>
        </div>
        <button
          @click="emit('refresh')"
          :class="[
            'p-2 rounded-lg transition-colors',
            darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
          ]"
          :disabled="isLoading"
        >
          <RefreshCw :class="['w-4 h-4', isLoading && 'animate-spin']" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-indigo-600 text-white'
              : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- 探索 Tab -->
      <div v-if="activeTab === 'explore'" class="p-4 space-y-4">
        <!-- 篩選 & 發布按鈕 -->
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button
              v-for="filter in [
                { value: 'all', label: '全部' },
                { value: 'offer', label: '找學員' },
                { value: 'request', label: '找導師' }
              ]"
              :key="filter.value"
              @click="filterType = filter.value as typeof filterType"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                filterType === filter.value
                  ? (darkMode ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800')
                  : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100')
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
          <button
            @click="openPostEditor()"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              'bg-indigo-600 text-white hover:bg-indigo-700'
            ]"
          >
            <Plus class="w-4 h-4" />
            發布
          </button>
        </div>

        <!-- 貼文列表 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <RefreshCw :class="['w-6 h-6 animate-spin', darkMode ? 'text-slate-400' : 'text-slate-500']" />
        </div>
        <div v-else-if="filteredPosts.length === 0" :class="[
          'text-center py-12',
          darkMode ? 'text-slate-500' : 'text-slate-400'
        ]">
          <Users class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>目前沒有發布</p>
          <p class="text-sm mt-1">成為第一個發布的人吧！</p>
        </div>
        <div v-else class="space-y-3">
          <MentorPostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
            :current-user-id="userId"
            :dark-mode="darkMode"
            @request="openRequestModal(post)"
            @delete="emit('deletePost', $event)"
          />
        </div>
      </div>

      <!-- 我的發布 Tab -->
      <div v-else-if="activeTab === 'myPosts'" class="p-4 space-y-4">
        <!-- 快速發布按鈕 -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="openPostEditor('offer')"
            :class="[
              'flex items-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all',
              darkMode
                ? 'border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20'
                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
            ]"
          >
            <GraduationCap :class="['w-5 h-5', darkMode ? 'text-slate-400' : 'text-slate-500']" />
            <div class="text-left">
              <p :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-700']">
                發布指導邀請
              </p>
              <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                我想當導師
              </p>
            </div>
          </button>
          <button
            @click="openPostEditor('request')"
            :class="[
              'flex items-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all',
              darkMode
                ? 'border-slate-700 hover:border-emerald-500 hover:bg-emerald-900/20'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'
            ]"
          >
            <BookOpen :class="['w-5 h-5', darkMode ? 'text-slate-400' : 'text-slate-500']" />
            <div class="text-left">
              <p :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-700']">
                發布學習需求
              </p>
              <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                我想找導師
              </p>
            </div>
          </button>
        </div>

        <!-- 我的貼文列表 -->
        <div v-if="myPosts.length === 0" :class="[
          'text-center py-8',
          darkMode ? 'text-slate-500' : 'text-slate-400'
        ]">
          <FileText class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p class="text-sm">你還沒有發布任何貼文</p>
        </div>
        <div v-else class="space-y-3">
          <MentorPostCard
            v-for="post in myPosts"
            :key="post.id"
            :post="post"
            :current-user-id="userId"
            :dark-mode="darkMode"
            @delete="emit('deletePost', $event)"
          />
        </div>
      </div>

      <!-- 我的配對 Tab -->
      <div v-else-if="activeTab === 'myMentorships'" class="p-4 space-y-4">
        <!-- 等待回應 -->
        <div v-if="pendingMentorships.length > 0">
          <h3 :class="['text-sm font-medium mb-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
            等待回應 ({{ pendingMentorships.length }})
          </h3>
          <div class="space-y-3">
            <MentorshipCard
              v-for="m in pendingMentorships"
              :key="m.id"
              :mentorship="m"
              :current-user-id="userId"
              :dark-mode="darkMode"
              @accept="emit('acceptMentorship', $event)"
              @reject="emit('rejectMentorship', $event)"
              @view-profile="emit('viewProfile', $event)"
            />
          </div>
        </div>

        <!-- 進行中 -->
        <div v-if="activeMentorships.length > 0">
          <h3 :class="['text-sm font-medium mb-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
            進行中 ({{ activeMentorships.length }})
          </h3>
          <div class="space-y-3">
            <MentorshipCard
              v-for="m in activeMentorships"
              :key="m.id"
              :mentorship="m"
              :current-user-id="userId"
              :dark-mode="darkMode"
              @complete="emit('completeMentorship', $event)"
              @view-profile="emit('viewProfile', $event)"
            />
          </div>
        </div>

        <!-- 已結束 -->
        <div v-if="completedMentorships.length > 0">
          <h3 :class="['text-sm font-medium mb-2', darkMode ? 'text-slate-400' : 'text-slate-500']">
            已結束 ({{ completedMentorships.length }})
          </h3>
          <div class="space-y-3">
            <MentorshipCard
              v-for="m in completedMentorships"
              :key="m.id"
              :mentorship="m"
              :current-user-id="userId"
              :dark-mode="darkMode"
              @view-profile="emit('viewProfile', $event)"
            />
          </div>
        </div>

        <!-- 空狀態 -->
        <div v-if="myMentorships.length === 0" :class="[
          'text-center py-8',
          darkMode ? 'text-slate-500' : 'text-slate-400'
        ]">
          <Heart class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p class="text-sm">還沒有任何配對</p>
          <p class="text-xs mt-1">去探索看看，發送配對請求吧！</p>
        </div>
      </div>

      <!-- 設定 Tab -->
      <div v-else-if="activeTab === 'settings'" class="p-4 space-y-4">
        <!-- 導師設定 -->
        <div :class="[
          'rounded-xl border p-4',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        ]">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <GraduationCap :class="['w-5 h-5', darkMode ? 'text-indigo-400' : 'text-indigo-600']" />
              <h3 :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">
                導師身份
              </h3>
            </div>
            <button
              @click="showMentorSetup = true"
              :class="[
                'text-sm px-3 py-1 rounded-lg transition-colors',
                darkMode
                  ? 'text-indigo-400 hover:bg-slate-700'
                  : 'text-indigo-600 hover:bg-indigo-50'
              ]"
            >
              {{ myMentorProfile ? '編輯' : '設定' }}
            </button>
          </div>
          <div v-if="myMentorProfile">
            <div class="flex items-center gap-2 mb-2">
              <span :class="[
                'px-2 py-0.5 rounded-full text-xs',
                myMentorProfile.isAvailable
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              ]">
                {{ myMentorProfile.isAvailable ? '開放中' : '暫停接收' }}
              </span>
              <span :class="['text-xs', darkMode ? 'text-slate-400' : 'text-slate-500']">
                最多 {{ myMentorProfile.maxMentees }} 位學員
              </span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="area in myMentorProfile.teachingAreas"
                :key="area"
                :class="[
                  'px-2 py-0.5 rounded-full text-xs',
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ area }}
              </span>
            </div>
          </div>
          <p v-else :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
            尚未設定導師資料
          </p>
        </div>

        <!-- 學員設定 -->
        <div :class="[
          'rounded-xl border p-4',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
        ]">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <BookOpen :class="['w-5 h-5', darkMode ? 'text-emerald-400' : 'text-emerald-600']" />
              <h3 :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">
                學員身份
              </h3>
            </div>
            <button
              @click="showMenteeSetup = true"
              :class="[
                'text-sm px-3 py-1 rounded-lg transition-colors',
                darkMode
                  ? 'text-emerald-400 hover:bg-slate-700'
                  : 'text-emerald-600 hover:bg-emerald-50'
              ]"
            >
              {{ myMenteeProfile ? '編輯' : '設定' }}
            </button>
          </div>
          <div v-if="myMenteeProfile">
            <div class="flex items-center gap-2 mb-2">
              <span :class="[
                'px-2 py-0.5 rounded-full text-xs',
                myMenteeProfile.isLooking
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              ]">
                {{ myMenteeProfile.isLooking ? '尋找中' : '暫停尋找' }}
              </span>
              <span :class="['text-xs', darkMode ? 'text-slate-400' : 'text-slate-500']">
                {{ myMenteeProfile.currentLevel }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="goal in myMenteeProfile.learningGoals"
                :key="goal"
                :class="[
                  'px-2 py-0.5 rounded-full text-xs',
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ goal }}
              </span>
            </div>
          </div>
          <p v-else :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
            尚未設定學員資料
          </p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 發布編輯器 -->
    <Teleport to="body">
      <div
        v-if="showPostEditor"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showPostEditor = false" />
        <div class="relative">
          <MentorPostEditor
            :dark-mode="darkMode"
            :default-type="defaultPostType"
            @save="handlePostSave"
            @cancel="showPostEditor = false"
          />
        </div>
      </div>
    </Teleport>

    <!-- 配對請求 Modal -->
    <MentorshipRequestModal
      :post="selectedPost"
      :dark-mode="darkMode"
      @send="handleRequestSend"
      @cancel="showRequestModal = false; selectedPost = null"
    />

    <!-- 導師設定 Modal -->
    <Teleport to="body">
      <div
        v-if="showMentorSetup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showMentorSetup = false" />
        <div class="relative">
          <MentorProfileSetup
            :profile="myMentorProfile"
            :dark-mode="darkMode"
            @save="handleMentorProfileSave"
            @cancel="showMentorSetup = false"
          />
        </div>
      </div>
    </Teleport>

    <!-- 學員設定 Modal -->
    <Teleport to="body">
      <div
        v-if="showMenteeSetup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showMenteeSetup = false" />
        <div class="relative">
          <MenteeProfileSetup
            :profile="myMenteeProfile"
            :dark-mode="darkMode"
            @save="handleMenteeProfileSave"
            @cancel="showMenteeSetup = false"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
