<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// --- 模組匯入 ---
import { useAuth, WelcomeScreen } from '@/modules/auth'
import { useProfile, UserProfileModal } from '@/modules/profile'
import { useChat, ChatView, CHANNELS } from '@/modules/chat'
import { useMentorship, MentorshipView } from '@/modules/mentorship'
import { ForumView } from '@/modules/forum'
import { BooklistView } from '@/modules/booklist'
import { MarketplaceView } from '@/modules/marketplace'
import { MOCK_MODE, initializeFirebase } from '@/shared/services/firebase'
import AppSidebar from '@/shared/layout/AppSidebar.vue'

import type {
  UserProfile, UserProfileInput,
  MentorPostInput, MentorshipRequest, MentorProfileInput, MenteeProfileInput
} from '@/types'

// --- Auth 模組 ---
const { user, isInitialized, initialize: initAuth, cleanup: cleanupAuth } = useAuth()

// --- 初始化 Firebase ---
onMounted(async () => {
  await initializeFirebase()
  await initAuth()

  // 初始化 Dark Mode
  const saved = localStorage.getItem('techshe-dark-mode')
  darkMode.value = saved === 'true'
})

onUnmounted(() => {
  cleanupAuth()
  cleanupChat()
})

// --- Profile 模組 ---
const userId = computed(() => user.value?.uid || null)
const {
  userProfile,
  isLoading: profileLoading,
  loadUserProfile,
  saveUserProfile,
  loadOtherUserProfile
} = useProfile(userId)

// 載入 Profile
watch(user, async (u) => {
  if (u) {
    await loadUserProfile()
  }
}, { immediate: true })

// --- Chat 模組 ---
const {
  messages,
  currentChannel,
  activeChannel,
  channels,
  sendMessage,
  selectChannel,
  cleanup: cleanupChat
} = useChat(userId, userProfile)

// --- Mentorship 模組 ---
const mentorship = useMentorship(userId, userProfile)

// 初始化導師計畫資料
watch([user, userProfile], async ([u, p]) => {
  if (u && p) {
    await mentorship.loadMentorPosts()
    await mentorship.loadMyMentorships()
    await mentorship.loadMyProfiles()
  }
}, { immediate: true })

// --- UI State ---
const darkMode: Ref<boolean> = ref(false)
const isSidebarOpen: Ref<boolean> = ref(false)
const currentView: Ref<'chat' | 'mentorship' | 'forum' | 'booklist' | 'marketplace'> = ref('chat')

// --- Profile Modal State ---
const profileModalShow: Ref<boolean> = ref(false)
const profileModalMode: Ref<'view' | 'edit'> = ref('view')
const profileModalTarget: Ref<UserProfile | null> = ref(null)
const profileModalIsOwn: Ref<boolean> = ref(false)

// --- Computed ---
const isLoggedIn = computed<boolean>(() => !!(user.value && userProfile.value))

// --- Dark Mode ---
const toggleDarkMode = (): void => {
  darkMode.value = !darkMode.value
  localStorage.setItem('techshe-dark-mode', String(darkMode.value))
}

// --- 處理加入 (從 WelcomeScreen) ---
const handleJoin = async (profileData: UserProfileInput): Promise<void> => {
  const success = await saveUserProfile(profileData)
  if (success) {
    profileModalShow.value = false
  }
}

// --- Sidebar 事件處理 ---
const handleSelectChannel = (channelId: string): void => {
  selectChannel(channelId)
  currentView.value = 'chat'
  isSidebarOpen.value = false
}

const handleSelectMentorship = (): void => {
  currentView.value = 'mentorship'
  isSidebarOpen.value = false
}

const handleSelectForum = (): void => {
  currentView.value = 'forum'
  isSidebarOpen.value = false
}

const handleSelectBooklist = (): void => {
  currentView.value = 'booklist'
  isSidebarOpen.value = false
}

const handleSelectMarketplace = (): void => {
  currentView.value = 'marketplace'
  isSidebarOpen.value = false
}

// --- Chat 事件處理 ---
const handleSendMessage = async (text: string): Promise<void> => {
  await sendMessage(text)
}

// --- Profile Modal 操作 ---
const openOwnProfileView = (): void => {
  profileModalTarget.value = userProfile.value
  profileModalMode.value = 'view'
  profileModalIsOwn.value = true
  profileModalShow.value = true
}

const openOtherProfile = async (targetUserId: string): Promise<void> => {
  if (targetUserId === user.value?.uid) {
    openOwnProfileView()
    return
  }

  const profile = await loadOtherUserProfile(targetUserId)
  if (profile) {
    profileModalTarget.value = profile
    profileModalMode.value = 'view'
    profileModalIsOwn.value = false
    profileModalShow.value = true
  }
}

const handleProfileSave = async (data: UserProfileInput): Promise<void> => {
  const success = await saveUserProfile(data)
  if (success) {
    profileModalShow.value = false
  }
}

// --- 導師計畫事件處理 ---
const handleCreatePost = async (data: MentorPostInput): Promise<void> => {
  await mentorship.createPost(data)
}

const handleDeletePost = async (id: string): Promise<void> => {
  await mentorship.deletePost(id)
}

const handleRequestMentorship = async (data: MentorshipRequest, postType: 'offer' | 'request'): Promise<void> => {
  await mentorship.requestMentorship(data, postType === 'request')
}

const handleAcceptMentorship = async (id: string): Promise<void> => {
  await mentorship.acceptMentorship(id)
}

const handleRejectMentorship = async (id: string): Promise<void> => {
  await mentorship.rejectMentorship(id)
}

const handleCompleteMentorship = async (id: string): Promise<void> => {
  await mentorship.completeMentorship(id)
}

const handleUpdateMentorProfile = async (data: MentorProfileInput): Promise<void> => {
  await mentorship.updateMentorProfile(data)
}

const handleUpdateMenteeProfile = async (data: MenteeProfileInput): Promise<void> => {
  await mentorship.updateMenteeProfile(data)
}

const handleMentorshipRefresh = async (): Promise<void> => {
  await mentorship.loadMentorPosts()
  await mentorship.loadMyMentorships()
}
</script>

<template>
  <!-- 歡迎畫面 -->
  <WelcomeScreen
    v-if="!isLoggedIn"
    :dark-mode="darkMode"
    :mock-mode="MOCK_MODE"
    @join="handleJoin"
  />

  <!-- 主應用程式 -->
  <div v-else :class="[
    'flex h-screen overflow-hidden font-sans transition-colors duration-300',
    darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-white text-slate-800'
  ]">

    <!-- Profile Modal -->
    <UserProfileModal
      :show="profileModalShow"
      :profile="profileModalTarget"
      :dark-mode="darkMode"
      :mode="profileModalMode"
      :is-own-profile="profileModalIsOwn"
      @close="profileModalShow = false"
      @save="handleProfileSave"
      @switch-to-edit="profileModalMode = 'edit'"
    />

    <!-- 行動版側邊欄遮罩 -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
      @click="isSidebarOpen = false"
    />

    <!-- 側邊欄 -->
    <AppSidebar
      :dark-mode="darkMode"
      :mock-mode="MOCK_MODE"
      :is-sidebar-open="isSidebarOpen"
      :user-profile="userProfile"
      :channels="channels"
      :current-channel="currentChannel"
      :current-view="currentView"
      :pending-requests-count="mentorship.pendingRequests.value.length"
      @close="isSidebarOpen = false"
      @select-channel="handleSelectChannel"
      @select-mentorship="handleSelectMentorship"
      @select-forum="handleSelectForum"
      @select-booklist="handleSelectBooklist"
      @select-marketplace="handleSelectMarketplace"
      @open-profile="openOwnProfileView"
    />

    <!-- 主內容區 -->
    <main :class="['flex-1 flex flex-col min-w-0 transition-colors duration-300', darkMode ? 'bg-slate-950' : 'bg-white']">

      <!-- 論壇頁面 -->
      <ForumView
        v-if="currentView === 'forum'"
        :user-id="user?.uid || ''"
        :user-name="userProfile?.nickname || ''"
        :user-role="userProfile?.role || ''"
        :dark-mode="darkMode"
        @toggle-dark-mode="toggleDarkMode"
        @open-sidebar="isSidebarOpen = true"
      />

      <!-- 書單頁面 -->
      <BooklistView
        v-else-if="currentView === 'booklist'"
        :user-id="user?.uid || null"
        :user-profile="userProfile"
        :dark-mode="darkMode"
      />

      <!-- 二手物交流頁面 -->
      <MarketplaceView
        v-else-if="currentView === 'marketplace'"
        :user-id="user?.uid || null"
        :user-profile="userProfile"
        :dark-mode="darkMode"
        @view-user-profile="openOtherProfile"
      />

      <!-- 導師計畫頁面 -->
      <MentorshipView
        v-else-if="currentView === 'mentorship'"
        :dark-mode="darkMode"
        :user-id="user?.uid || ''"
        :user-profile="userProfile"
        :mentor-posts="mentorship.mentorPosts.value"
        :my-mentorships="mentorship.myMentorships.value"
        :my-mentor-profile="mentorship.myMentorProfile.value"
        :my-mentee-profile="mentorship.myMenteeProfile.value"
        :is-loading="mentorship.isLoading.value"
        @create-post="handleCreatePost"
        @delete-post="handleDeletePost"
        @request-mentorship="handleRequestMentorship"
        @accept-mentorship="handleAcceptMentorship"
        @reject-mentorship="handleRejectMentorship"
        @complete-mentorship="handleCompleteMentorship"
        @update-mentor-profile="handleUpdateMentorProfile"
        @update-mentee-profile="handleUpdateMenteeProfile"
        @view-profile="openOtherProfile"
        @refresh="handleMentorshipRefresh"
      />

      <!-- 聊天室 -->
      <ChatView
        v-else
        :messages="messages"
        :current-user-id="user?.uid || ''"
        :active-channel="activeChannel"
        :dark-mode="darkMode"
        @send="handleSendMessage"
        @click-avatar="openOtherProfile"
        @toggle-dark-mode="toggleDarkMode"
        @open-sidebar="isSidebarOpen = true"
      />
    </main>
  </div>
</template>

<style>
/* 動畫 */
.animate-in {
  animation-duration: 300ms;
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fade-in;
}

.slide-in-from-bottom-2 {
  animation-name: slide-in-from-bottom-2;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom-2 {
  from { transform: translateY(0.5rem); }
  to { transform: translateY(0); }
}
</style>
