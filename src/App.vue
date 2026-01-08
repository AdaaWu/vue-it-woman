<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import {
  Briefcase,
  Heart,
  Code,
  Menu,
  X,
  Send,
  Smile,
  Hash,
  Coffee,
  Sun,
  Moon,
  Pencil,
  Users
} from 'lucide-vue-next'
import WelcomeScreen from './components/WelcomeScreen.vue'
import EmojiPicker from './components/EmojiPicker.vue'
import UserProfileModal from './components/UserProfileModal.vue'
import MentorshipView from './components/mentorship/MentorshipView.vue'
import { useMentorship } from './composables/useMentorship'
import type {
  Message, FirebaseUser, Channel, UserProfile, UserProfileInput,
  MentorPostInput, MentorshipRequest, MentorProfileInput, MenteeProfileInput
} from './types'
import type { FirebaseApp } from 'firebase/app'
import type { Auth, Unsubscribe as AuthUnsubscribe } from 'firebase/auth'
import type { Firestore, Unsubscribe as FirestoreUnsubscribe } from 'firebase/firestore'

// --- 檢查是否為 Mock 模式 ---
const MOCK_MODE: boolean = !import.meta.env.VITE_FIREBASE_API_KEY

// --- Firebase 變數 ---
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
const appId: string = import.meta.env.VITE_APP_ID || 'default-app-id'

// --- 預設留言 ---
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', channelId: 'tech', text: '最近在研究 Next.js 14 的 Server Actions，大家覺得好用嗎？', userName: 'Sophia', userRole: 'Frontend Dev', userId: 'mock-1', timestamp: { seconds: Date.now()/1000 - 3600 } },
  { id: 'm2', channelId: 'tech', text: '我覺得搭配 TypeScript 開發起來快很多，但學習曲線真的有一點。', userName: '科技小白', userRole: 'Fullstack', userId: 'mock-2', timestamp: { seconds: Date.now()/1000 - 3500 } },
  { id: 'm3', channelId: 'tech', text: '有人試過 Bun 嗎？聽說比 Node.js 快很多！', userName: 'Alice', userRole: 'Backend Dev', userId: 'mock-7', timestamp: { seconds: Date.now()/1000 - 3400 } },
  { id: 'm4', channelId: 'career', text: '大家在跟 HR 談薪水的時候，會參考哪些薪資網站？', userName: '職場小菜鳥', userRole: 'QA Engineer', userId: 'mock-3', timestamp: { seconds: Date.now()/1000 - 7200 } },
  { id: 'm5', channelId: 'career', text: '我個人會參考 Levels.fyi，雖然主要偏向外企，但趨勢蠻準的。', userName: 'Emily', userRole: 'Engineering Manager', userId: 'mock-4', timestamp: { seconds: Date.now()/1000 - 7100 } },
  { id: 'm6', channelId: 'career', text: '面試前記得做功課，了解公司的技術棧和文化很重要！', userName: '資深前輩', userRole: 'Tech Lead', userId: 'mock-8', timestamp: { seconds: Date.now()/1000 - 7000 } },
  { id: 'm7', channelId: 'life', text: '今天小孩感冒，臨時要請假處理，還好主管也是媽媽，很能體諒。', userName: '忙碌的媽咪', userRole: 'Backend Dev', userId: 'mock-5', timestamp: { seconds: Date.now()/1000 - 5000 } },
  { id: 'm8', channelId: 'life', text: '真的，WLB 在選公司時真的比薪水還重要啊... (握手)', userName: '過來人', userRole: 'Product Manager', userId: 'mock-6', timestamp: { seconds: Date.now()/1000 - 4800 } },
  { id: 'm9', channelId: 'lobby', text: '有人要一起揪團購嗎？看到一個很棒的機械鍵盤團！', userName: '鍵盤控', userRole: 'Frontend Dev', userId: 'mock-9', timestamp: { seconds: Date.now()/1000 - 2000 } },
  { id: 'm10', channelId: 'lobby', text: '推薦大家一個好喝的咖啡店，在信義區，很適合遠端工作～', userName: '咖啡愛好者', userRole: 'UI/UX Designer', userId: 'mock-10', timestamp: { seconds: Date.now()/1000 - 1800 } },
]

// --- 頻道定義 ---
const channels: Channel[] = [
  { id: 'tech', name: '技術研討', icon: Code, desc: '前端、後端、AI 與新技術分享' },
  { id: 'career', name: '職涯攻略', icon: Briefcase, desc: '面試、薪資談判、升遷與轉職' },
  { id: 'life', name: '家庭與生活', icon: Heart, desc: '育兒、Work-Life Balance、情感支持' },
  { id: 'lobby', name: '閒聊休息區', icon: Coffee, desc: '輕鬆閒聊、團購、好物分享' },
]

// --- State ---
const user: Ref<FirebaseUser | null> = ref(MOCK_MODE ? { uid: 'mock-user-me' } : null)
const userProfile: Ref<UserProfile | null> = ref(null)
const currentChannel: Ref<string> = ref('tech')
const messages: Ref<Message[]> = ref([])
const newMessage: Ref<string> = ref('')
const isSidebarOpen: Ref<boolean> = ref(false)
const isEmojiPickerOpen: Ref<boolean> = ref(false)
const localMessages: Ref<Message[]> = ref([])
const darkMode: Ref<boolean> = ref(false)

// --- 導師計畫 State ---
const currentView: Ref<'chat' | 'mentorship'> = ref('chat')

// --- 使用 useMentorship composable ---
const mentorship = useMentorship(
  computed(() => user.value?.uid || null),
  userProfile,
  db,
  appId,
  MOCK_MODE
)

// 初始化導師計畫資料
watch([user, userProfile], async ([u, p]) => {
  if (u && p) {
    await mentorship.loadMentorPosts()
    await mentorship.loadMyMentorships()
    await mentorship.loadMyProfiles()
  }
}, { immediate: true })

// --- 導師計畫事件處理 ---
const handleCreatePost = async (data: MentorPostInput): Promise<void> => {
  await mentorship.createPost(data)
}

const handleDeletePost = async (id: string): Promise<void> => {
  await mentorship.deletePost(id)
}

const handleRequestMentorship = async (data: MentorshipRequest, postType: 'offer' | 'request'): Promise<void> => {
  // postType === 'offer' 表示對方是導師，我想成為學員 → 我不是導師
  // postType === 'request' 表示對方是學員，我想成為導師 → 我是導師
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

// --- Profile Modal State ---
const profileModalShow: Ref<boolean> = ref(false)
const profileModalMode: Ref<'view' | 'edit'> = ref('view')
const profileModalTarget: Ref<UserProfile | null> = ref(null)
const profileModalIsOwn: Ref<boolean> = ref(false)

// --- Refs ---
const messagesEndRef: Ref<HTMLElement | null> = ref(null)
const emojiPickerRef: Ref<HTMLElement | null> = ref(null)
const inputRef: Ref<HTMLInputElement | null> = ref(null)

// --- Computed ---
const activeChannelInfo = computed<Channel | undefined>(() => channels.find(c => c.id === currentChannel.value))

const isLoggedIn = computed<boolean>(() => !!(user.value && userProfile.value))

// --- 初始化 Dark Mode ---
onMounted((): void => {
  const saved = localStorage.getItem('techshe-dark-mode')
  darkMode.value = saved === 'true'
})

// --- 切換 Dark Mode ---
const toggleDarkMode = (): void => {
  darkMode.value = !darkMode.value
  localStorage.setItem('techshe-dark-mode', String(darkMode.value))
}

// --- 點擊外部關閉 Emoji Picker ---
const handleClickOutside = (event: MouseEvent): void => {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(event.target as Node)) {
    isEmojiPickerOpen.value = false
  }
}

onMounted((): void => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted((): void => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// --- Firebase 認證 ---
let authUnsubscribe: AuthUnsubscribe | null = null

onMounted(async (): Promise<void> => {
  if (MOCK_MODE) {
    // Mock 模式: 從 localStorage 讀取 profile
    const saved = localStorage.getItem('ither-user-profile')
    if (saved) {
      userProfile.value = JSON.parse(saved)
    }
    return
  }

  try {
    const { initializeApp } = await import('firebase/app')
    const { getAuth, signInAnonymously, onAuthStateChanged } = await import('firebase/auth')
    const { getFirestore } = await import('firebase/firestore')

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }

    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    await signInAnonymously(auth)
    authUnsubscribe = onAuthStateChanged(auth, async (u): Promise<void> => {
      user.value = u ? { uid: u.uid } : null
      if (u) {
        await loadUserProfile()
      }
    })
  } catch (error) {
    console.error("Auth error:", error)
  }
})

onUnmounted((): void => {
  authUnsubscribe?.()
})

// --- 載入自己的 Profile ---
const loadUserProfile = async (): Promise<void> => {
  if (!user.value || !db || MOCK_MODE) return

  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', user.value.uid)
    const snapshot = await getDoc(profileRef)

    if (snapshot.exists()) {
      userProfile.value = { userId: snapshot.id, ...snapshot.data() } as UserProfile
    }
  } catch (error) {
    console.error("Load profile error:", error)
  }
}

// --- 儲存 Profile ---
const saveUserProfile = async (profileData: UserProfileInput): Promise<void> => {
  if (!user.value) return

  const profile: UserProfile = {
    userId: user.value.uid,
    nickname: profileData.nickname,
    role: profileData.role,
    title: profileData.title || '',
    bio: profileData.bio || '',
    skills: profileData.skills || [],
    createdAt: userProfile.value?.createdAt || { seconds: Date.now() / 1000 },
    updatedAt: { seconds: Date.now() / 1000 }
  }

  if (MOCK_MODE) {
    localStorage.setItem('ither-user-profile', JSON.stringify(profile))
    userProfile.value = profile
    profileModalShow.value = false
    return
  }

  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    if (!db) return

    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', user.value.uid)
    await setDoc(profileRef, {
      ...profileData,
      title: profileData.title || '',
      bio: profileData.bio || '',
      skills: profileData.skills || [],
      updatedAt: serverTimestamp(),
      createdAt: userProfile.value?.createdAt || serverTimestamp()
    }, { merge: true })

    userProfile.value = profile
    profileModalShow.value = false
  } catch (error) {
    console.error("Save profile error:", error)
  }
}

// --- 載入其他使用者 Profile ---
const loadOtherUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (MOCK_MODE) {
    // Mock 模式: 返回假資料
    return {
      userId,
      nickname: MOCK_MESSAGES.find(m => m.userId === userId)?.userName || 'Unknown',
      role: MOCK_MESSAGES.find(m => m.userId === userId)?.userRole || 'Guest',
      title: '',
      bio: '',
      skills: [],
      createdAt: null,
      updatedAt: null
    }
  }

  if (!db) return null

  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', userId)
    const snapshot = await getDoc(profileRef)

    if (snapshot.exists()) {
      return { userId: snapshot.id, ...snapshot.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Load other profile error:", error)
    return null
  }
}

// --- 訊息載入 ---
let messagesUnsubscribe: FirestoreUnsubscribe | null = null

const loadMessages = async (): Promise<void> => {
  if (!user.value) return

  // Mock 模式
  if (MOCK_MODE) {
    const allMessages: Message[] = [...MOCK_MESSAGES, ...localMessages.value]
    messages.value = allMessages
      .filter(m => m.channelId === currentChannel.value)
      .sort((a, b) => {
        const t1 = (a.timestamp?.seconds ?? 0) * 1000 || Date.now()
        const t2 = (b.timestamp?.seconds ?? 0) * 1000 || Date.now()
        return t1 - t2
      })
    return
  }

  // Firebase 模式
  try {
    const { collection, onSnapshot } = await import('firebase/firestore')
    if (!db) return

    const q = collection(db, 'artifacts', appId, 'public', 'data', 'messages')

    messagesUnsubscribe?.()
    messagesUnsubscribe = onSnapshot(q, (snapshot): void => {
      const realMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message))
      const allMessagesCombined: Message[] = [...MOCK_MESSAGES, ...realMessages]
      messages.value = allMessagesCombined
        .filter(m => m.channelId === currentChannel.value)
        .sort((a, b) => {
          const t1 = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp.seconds * 1000) : Date.now()
          const t2 = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp.seconds * 1000) : Date.now()
          return t1 - t2
        })
    }, (error): void => console.error("Error:", error))
  } catch (error) {
    console.error("Load messages error:", error)
  }
}

watch([user, currentChannel, localMessages], loadMessages, { immediate: true, deep: true })

onUnmounted((): void => {
  messagesUnsubscribe?.()
})

// --- 自動捲動到底部 ---
watch(messages, async (): Promise<void> => {
  await nextTick()
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
}, { deep: true })

// --- 處理加入 (從 WelcomeScreen) ---
const handleJoin = (profileData: UserProfileInput): void => {
  saveUserProfile(profileData)
}

// --- 選擇 Emoji ---
const handleEmojiSelect = (emoji: string): void => {
  newMessage.value += emoji
  isEmojiPickerOpen.value = false
  inputRef.value?.focus()
}

// --- 發送訊息 ---
const handleSendMessage = async (): Promise<void> => {
  if (!newMessage.value.trim() || !user.value || !userProfile.value) return

  // Mock 模式
  if (MOCK_MODE) {
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      text: newMessage.value,
      channelId: currentChannel.value,
      userId: user.value.uid,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      timestamp: { seconds: Date.now() / 1000 },
      type: 'text'
    }
    localMessages.value = [...localMessages.value, newMsg]
    newMessage.value = ''
    return
  }

  // Firebase 模式
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    if (!db) return

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
      text: newMessage.value,
      channelId: currentChannel.value,
      userId: user.value.uid,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      timestamp: serverTimestamp(),
      type: 'text'
    })
    newMessage.value = ''
  } catch (err) {
    console.error("Failed:", err)
  }
}

// --- 切換頻道 ---
const selectChannel = (channelId: string): void => {
  currentChannel.value = channelId
  isSidebarOpen.value = false
}

// --- 格式化時間 ---
const formatTime = (timestamp: Message['timestamp']): string => {
  if (!timestamp) return "傳送中..."
  const ms = timestamp.toMillis ? timestamp.toMillis() : timestamp.seconds * 1000
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// --- 檢查是否為自己的訊息 ---
const isMyMessage = (msg: Message): boolean => msg.userId === user.value?.uid

// --- 檢查是否顯示頭像 ---
const shouldShowAvatar = (index: number): boolean => {
  return index === 0 || messages.value[index - 1].userId !== messages.value[index].userId
}

// --- Profile Modal 操作 ---
const openOwnProfileView = (): void => {
  profileModalTarget.value = userProfile.value
  profileModalMode.value = 'view'
  profileModalIsOwn.value = true
  profileModalShow.value = true
}

const openOtherProfile = async (userId: string): Promise<void> => {
  if (userId === user.value?.uid) {
    openOwnProfileView()
    return
  }

  const profile = await loadOtherUserProfile(userId)
  if (profile) {
    profileModalTarget.value = profile
    profileModalMode.value = 'view'
    profileModalIsOwn.value = false
    profileModalShow.value = true
  }
}

const handleProfileSave = (data: UserProfileInput): void => {
  saveUserProfile(data)
}

const handleSwitchToEdit = (): void => {
  profileModalMode.value = 'edit'
}

const closeProfileModal = (): void => {
  profileModalShow.value = false
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
      @close="closeProfileModal"
      @save="handleProfileSave"
      @switch-to-edit="handleSwitchToEdit"
    />

    <!-- 行動版側邊欄遮罩 -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
      @click="isSidebarOpen = false"
    />

    <!-- 側邊欄 -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-30 w-72 transform transition-all duration-300 ease-in-out border-r',
      'md:relative md:translate-x-0',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
    ]">
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div :class="['p-6 border-b flex items-center gap-3', darkMode ? 'border-slate-800' : 'border-slate-200']">
          <div class="bg-indigo-600 w-11 h-11 rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <span class="text-white font-bold text-sm tracking-wide">&lt;/&gt;</span>
          </div>
          <h1 class="font-extrabold text-2xl tracking-tight flex items-baseline">
            <span :class="darkMode ? 'text-slate-100' : 'text-slate-800'">IT</span>
            <span class="text-indigo-600 ml-0.5 relative">
              Her
              <span class="absolute -right-3 bottom-1 w-2 h-2 bg-indigo-400 rounded-full"></span>
            </span>
          </h1>
          <button @click="isSidebarOpen = false" class="md:hidden ml-auto p-1 text-slate-400">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- 用戶資訊 (可點擊) -->
        <button
          @click="openOwnProfileView"
          :class="[
            'p-4 mx-4 mt-4 border rounded-xl shadow-sm transition-all text-left group',
            darkMode
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
              {{ userProfile?.nickname[0].toUpperCase() }}
            </div>
            <div class="overflow-hidden flex-1">
              <p class="font-semibold text-sm truncate">{{ userProfile?.nickname }}</p>
              <p class="text-xs text-indigo-400 font-medium truncate">{{ userProfile?.role }}</p>
            </div>
            <Pencil :class="[
              'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity',
              darkMode ? 'text-slate-500' : 'text-slate-400'
            ]" />
          </div>
          <!-- 職位顯示 -->
          <p v-if="userProfile?.title" :class="['text-xs mt-2 truncate', darkMode ? 'text-slate-500' : 'text-slate-400']">
            {{ userProfile.title }}
          </p>
          <!-- 技能標籤 (最多顯示3個) -->
          <div v-if="userProfile?.skills && userProfile.skills.length > 0" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="skill in userProfile.skills.slice(0, 3)"
              :key="skill"
              :class="[
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ skill }}
            </span>
            <span
              v-if="userProfile.skills.length > 3"
              :class="['text-[10px]', darkMode ? 'text-slate-500' : 'text-slate-400']"
            >
              +{{ userProfile.skills.length - 3 }}
            </span>
          </div>
        </button>

        <!-- Demo 模式標示 -->
        <div v-if="MOCK_MODE" class="mx-4 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p class="text-xs text-amber-500 text-center">Demo 模式</p>
        </div>

        <!-- 頻道列表 -->
        <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">討論頻道</p>
          <button
            v-for="channel in channels"
            :key="channel.id"
            @click="selectChannel(channel.id); currentView = 'chat'"
            :class="[
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
              currentView === 'chat' && currentChannel === channel.id
                ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
            ]"
          >
            <component :is="channel.icon" :class="['w-5 h-5', currentView === 'chat' && currentChannel === channel.id ? 'text-indigo-500' : 'text-slate-500']" />
            <span class="flex-1 text-left">{{ channel.name }}</span>
          </button>

          <!-- 導師計畫 -->
          <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">社群功能</p>
          <button
            @click="currentView = 'mentorship'; isSidebarOpen = false"
            :class="[
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
              currentView === 'mentorship'
                ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
            ]"
          >
            <Users :class="['w-5 h-5', currentView === 'mentorship' ? 'text-indigo-500' : 'text-slate-500']" />
            <span class="flex-1 text-left">導師計畫</span>
            <span
              v-if="mentorship.pendingRequests.value.length > 0"
              class="px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white"
            >
              {{ mentorship.pendingRequests.value.length }}
            </span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- 主內容區 -->
    <main :class="['flex-1 flex flex-col min-w-0 transition-colors duration-300', darkMode ? 'bg-slate-950' : 'bg-white']">

      <!-- 導師計畫頁面 -->
      <MentorshipView
        v-if="currentView === 'mentorship'"
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
      <template v-else>
        <!-- Header -->
        <header :class="['h-16 border-b flex items-center px-4 justify-between flex-shrink-0 z-10 shadow-sm', darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200']">
          <div class="flex items-center gap-3">
            <button @click="isSidebarOpen = true" class="md:hidden p-2 text-slate-500">
              <Menu class="w-6 h-6" />
            </button>
            <div class="flex items-center gap-2">
              <Hash class="w-5 h-5 text-slate-400" />
              <h2 class="font-bold text-lg">{{ activeChannelInfo?.name }}</h2>
            </div>
          </div>

          <!-- Dark Mode 切換 -->
          <button
            @click="toggleDarkMode"
            :class="['p-2 rounded-full transition-all', darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
            :title="darkMode ? '切換至淺色模式' : '切換至深色模式'"
          >
            <Sun v-if="darkMode" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </header>

        <!-- 訊息列表 -->
      <div :class="['flex-1 overflow-y-auto p-4 space-y-6 transition-colors duration-300', darkMode ? 'bg-slate-950/50' : 'bg-slate-50/50']">
        <div
          v-for="(msg, index) in messages"
          :key="msg.id"
          :class="['flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300', isMyMessage(msg) ? 'flex-row-reverse' : '']"
        >
          <!-- 頭像 (非自己的訊息, 可點擊) -->
          <div v-if="!isMyMessage(msg)" :class="['flex-shrink-0 w-10 h-10', !shouldShowAvatar(index) ? 'invisible' : '']">
            <button
              @click="openOtherProfile(msg.userId)"
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-slate-400 hover:ring-2 hover:ring-indigo-400 transition-all"
            >
              {{ msg.userName ? msg.userName[0].toUpperCase() : '?' }}
            </button>
          </div>

          <div :class="['flex flex-col max-w-[80%]', isMyMessage(msg) ? 'items-end' : 'items-start']">
            <!-- 名稱與時間 -->
            <div v-if="shouldShowAvatar(index)" :class="['flex items-baseline gap-2 mb-1', isMyMessage(msg) ? 'flex-row-reverse' : '']">
              <template v-if="!isMyMessage(msg)">
                <button
                  @click="openOtherProfile(msg.userId)"
                  :class="['text-sm font-semibold hover:underline', darkMode ? 'text-slate-200' : 'text-slate-700']"
                >
                  {{ msg.userName }}
                </button>
                <span :class="['text-[10px] px-1.5 py-0.5 rounded', darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600']">{{ msg.userRole }}</span>
              </template>
              <span class="text-[10px] text-slate-500 ml-1">{{ formatTime(msg.timestamp) }}</span>
            </div>

            <!-- 訊息氣泡 -->
            <div :class="[
              'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors',
              isMyMessage(msg)
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : (darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm')
            ]">
              {{ msg.text }}
            </div>
          </div>
        </div>
        <div ref="messagesEndRef" />
      </div>

      <!-- 輸入區 -->
      <div :class="['p-4 border-t relative transition-colors duration-300', darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200']">

        <!-- Emoji Picker -->
        <EmojiPicker
          v-if="isEmojiPickerOpen"
          ref="emojiPickerRef"
          :dark-mode="darkMode"
          @select="handleEmojiSelect"
          @close="isEmojiPickerOpen = false"
        />

        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            @click="isEmojiPickerOpen = !isEmojiPickerOpen"
            :class="['p-2 rounded-full transition', isEmojiPickerOpen ? (darkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : 'text-slate-400 hover:text-indigo-500']"
          >
            <Smile class="w-6 h-6" />
          </button>
          <input
            ref="inputRef"
            v-model="newMessage"
            type="text"
            :placeholder="`在 #${activeChannelInfo?.name} 發送訊息...`"
            :class="['flex-1 px-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition outline-none', darkMode ? 'bg-slate-800 text-white placeholder-slate-500 focus:bg-slate-700' : 'bg-slate-100 text-slate-800 focus:bg-white']"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim()"
            :class="['p-3 rounded-xl transition-all shadow-sm', !newMessage.trim() ? (darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400') : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95']"
          >
            <Send class="w-5 h-5" />
          </button>
        </form>
      </div>
      </template>
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
