import { ref } from 'vue'
import type { Ref } from 'vue'
import { MOCK_MODE, firebaseDb, appId } from '@/shared/services/firebase'
import type { UserProfile, UserProfileInput, UserGoal, UserActivity, UserStats, UserSocialLinks } from '@/types'

// Mock 活動資料
const MOCK_ACTIVITIES: UserActivity[] = [
  {
    id: '1',
    userId: 'mock-user',
    type: 'forum_post',
    targetId: 'post-1',
    targetTitle: '如何在職場上建立自信？',
    preview: '分享一些我在科技業工作的心得...',
    createdAt: { seconds: Date.now() / 1000 - 3600 }
  },
  {
    id: '2',
    userId: 'mock-user',
    type: 'mentorship_offer',
    targetId: 'mentor-1',
    targetTitle: '前端開發入門指導',
    preview: '願意幫助想要轉職的夥伴',
    createdAt: { seconds: Date.now() / 1000 - 86400 }
  },
  {
    id: '3',
    userId: 'mock-user',
    type: 'book_review',
    targetId: 'book-1',
    targetTitle: '原子習慣',
    preview: '這本書改變了我的工作方式...',
    createdAt: { seconds: Date.now() / 1000 - 172800 }
  }
]

const MOCK_STATS: UserStats = {
  forumPosts: 5,
  forumComments: 23,
  mentorshipActive: 2,
  booksReviewed: 8,
  marketplaceListings: 3,
  marketplaceSold: 1
}

export function useProfile(userId: Ref<string | null>) {
  // --- State ---
  const userProfile: Ref<UserProfile | null> = ref(null)
  const userActivities: Ref<UserActivity[]> = ref([])
  const userStats: Ref<UserStats> = ref(MOCK_STATS)
  const isLoading: Ref<boolean> = ref(false)

  // --- 載入自己的 Profile ---
  const loadUserProfile = async (): Promise<void> => {
    if (!userId.value) return

    if (MOCK_MODE) {
      const saved = localStorage.getItem('ither-user-profile')
      if (saved) {
        userProfile.value = JSON.parse(saved)
      }
      return
    }

    if (!firebaseDb.value) return

    try {
      isLoading.value = true
      const { doc, getDoc } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      const snapshot = await getDoc(profileRef)

      if (snapshot.exists()) {
        userProfile.value = { userId: snapshot.id, ...snapshot.data() } as UserProfile
      }
    } catch (error) {
      console.error('[Profile] Load error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // --- 儲存 Profile ---
  const saveUserProfile = async (profileData: UserProfileInput): Promise<boolean> => {
    if (!userId.value) return false

    const profile: UserProfile = {
      userId: userId.value,
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
      return true
    }

    if (!firebaseDb.value) return false

    try {
      isLoading.value = true
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)

      await setDoc(profileRef, {
        ...profileData,
        title: profileData.title || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        updatedAt: serverTimestamp(),
        createdAt: userProfile.value?.createdAt || serverTimestamp()
      }, { merge: true })

      userProfile.value = profile
      return true
    } catch (error) {
      console.error('[Profile] Save error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // --- 載入其他使用者 Profile ---
  const loadOtherUserProfile = async (targetUserId: string): Promise<UserProfile | null> => {
    if (MOCK_MODE) {
      // Mock 模式: 返回假資料
      return {
        userId: targetUserId,
        nickname: 'User',
        role: 'Guest',
        title: '',
        bio: '',
        skills: [],
        createdAt: null,
        updatedAt: null
      }
    }

    if (!firebaseDb.value) return null

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', targetUserId)
      const snapshot = await getDoc(profileRef)

      if (snapshot.exists()) {
        return { userId: snapshot.id, ...snapshot.data() } as UserProfile
      }
      return null
    } catch (error) {
      console.error('[Profile] Load other error:', error)
      return null
    }
  }

  // --- 載入使用者活動 ---
  const loadUserActivities = async (targetUserId?: string): Promise<void> => {
    const uid = targetUserId || userId.value
    if (!uid) return

    if (MOCK_MODE) {
      userActivities.value = MOCK_ACTIVITIES
      return
    }

    // TODO: 實作 Firebase 查詢
    userActivities.value = []
  }

  // --- 載入使用者統計 ---
  const loadUserStats = async (targetUserId?: string): Promise<void> => {
    const uid = targetUserId || userId.value
    if (!uid) return

    if (MOCK_MODE) {
      userStats.value = MOCK_STATS
      return
    }

    // TODO: 實作 Firebase 查詢
  }

  // --- 更新狀態 ---
  const updateStatus = async (status: string): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const updatedProfile = {
      ...userProfile.value,
      currentStatus: status,
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localStorage.setItem('ither-user-profile', JSON.stringify(updatedProfile))
      userProfile.value = updatedProfile
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      await updateDoc(profileRef, {
        currentStatus: status,
        updatedAt: serverTimestamp()
      })
      userProfile.value = updatedProfile
      return true
    } catch (error) {
      console.error('[Profile] Update status error:', error)
      return false
    }
  }

  // --- 新增目標 ---
  const addGoal = async (goal: Omit<UserGoal, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const newGoal: UserGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: { seconds: Date.now() / 1000 }
    }

    const currentGoals = userProfile.value.currentGoals || []
    const updatedProfile = {
      ...userProfile.value,
      currentGoals: [...currentGoals, newGoal],
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localStorage.setItem('ither-user-profile', JSON.stringify(updatedProfile))
      userProfile.value = updatedProfile
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      await updateDoc(profileRef, {
        currentGoals: updatedProfile.currentGoals,
        updatedAt: serverTimestamp()
      })
      userProfile.value = updatedProfile
      return true
    } catch (error) {
      console.error('[Profile] Add goal error:', error)
      return false
    }
  }

  // --- 切換目標完成狀態 ---
  const toggleGoal = async (goalId: string): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const currentGoals = userProfile.value.currentGoals || []
    const updatedGoals = currentGoals.map(g =>
      g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g
    )

    const updatedProfile = {
      ...userProfile.value,
      currentGoals: updatedGoals,
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localStorage.setItem('ither-user-profile', JSON.stringify(updatedProfile))
      userProfile.value = updatedProfile
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      await updateDoc(profileRef, {
        currentGoals: updatedGoals,
        updatedAt: serverTimestamp()
      })
      userProfile.value = updatedProfile
      return true
    } catch (error) {
      console.error('[Profile] Toggle goal error:', error)
      return false
    }
  }

  // --- 刪除目標 ---
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const currentGoals = userProfile.value.currentGoals || []
    const updatedGoals = currentGoals.filter(g => g.id !== goalId)

    const updatedProfile = {
      ...userProfile.value,
      currentGoals: updatedGoals,
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localStorage.setItem('ither-user-profile', JSON.stringify(updatedProfile))
      userProfile.value = updatedProfile
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      await updateDoc(profileRef, {
        currentGoals: updatedGoals,
        updatedAt: serverTimestamp()
      })
      userProfile.value = updatedProfile
      return true
    } catch (error) {
      console.error('[Profile] Delete goal error:', error)
      return false
    }
  }

  // --- 更新社群連結 ---
  const updateSocialLinks = async (links: UserSocialLinks): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const updatedProfile = {
      ...userProfile.value,
      socialLinks: links,
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localStorage.setItem('ither-user-profile', JSON.stringify(updatedProfile))
      userProfile.value = updatedProfile
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const profileRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      await updateDoc(profileRef, {
        socialLinks: links,
        updatedAt: serverTimestamp()
      })
      userProfile.value = updatedProfile
      return true
    } catch (error) {
      console.error('[Profile] Update social links error:', error)
      return false
    }
  }

  return {
    userProfile,
    userActivities,
    userStats,
    isLoading,
    loadUserProfile,
    saveUserProfile,
    loadOtherUserProfile,
    loadUserActivities,
    loadUserStats,
    updateStatus,
    addGoal,
    toggleGoal,
    deleteGoal,
    updateSocialLinks
  }
}
