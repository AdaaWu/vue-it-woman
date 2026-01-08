import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type {
  MentorProfile,
  MentorProfileInput,
  MenteeProfile,
  MenteeProfileInput,
  MentorPost,
  MentorPostInput,
  MentorPostType,
  Mentorship,
  MentorshipRequest,
  UserProfile
} from '../types'

// Mock 資料
const MOCK_POSTS: MentorPost[] = [
  {
    id: 'post-1',
    userId: 'mock-mentor-1',
    type: 'offer',
    title: '想幫助前端新手成長',
    areas: ['Vue.js', 'TypeScript', 'React'],
    description: '我有5年前端開發經驗，目前在新創公司擔任 Tech Lead。希望能幫助剛入行的朋友避開一些坑，分享實戰經驗。每週可以安排1-2小時線上討論。',
    status: 'active',
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: { seconds: Date.now() / 1000 - 86400 },
    userName: 'Alice Chen',
    userRole: 'Frontend Dev'
  },
  {
    id: 'post-2',
    userId: 'mock-mentor-2',
    type: 'offer',
    title: '後端架構設計指導',
    areas: ['Node.js', 'PostgreSQL', 'AWS'],
    description: '專注於後端系統設計與雲端架構，可以指導 API 設計、資料庫優化、微服務架構等主題。',
    status: 'active',
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: { seconds: Date.now() / 1000 - 172800 },
    userName: 'Emily Wang',
    userRole: 'Backend Dev'
  },
  {
    id: 'post-3',
    userId: 'mock-mentee-1',
    type: 'request',
    title: '想學習 Vue.js 和前端開發',
    areas: ['Vue.js', 'JavaScript', 'HTML/CSS'],
    description: '我是後端工程師，想轉型全端。目前自學 Vue.js 中，希望找到有經驗的前輩指導，加速學習進度。',
    status: 'active',
    createdAt: { seconds: Date.now() / 1000 - 43200 },
    updatedAt: { seconds: Date.now() / 1000 - 43200 },
    userName: '小明',
    userRole: 'Backend Dev'
  },
  {
    id: 'post-4',
    userId: 'mock-mentee-2',
    type: 'request',
    title: '求職面試準備指導',
    areas: ['Agile/Scrum', 'Product Management'],
    description: '即將畢業，想進入科技業當 PM。希望有前輩能分享面試經驗和職涯建議。',
    status: 'active',
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: { seconds: Date.now() / 1000 - 259200 },
    userName: '轉職中的 Cathy',
    userRole: 'Student/Learner'
  }
]

export function useMentorship(
  userId: Ref<string | null>,
  userProfile: Ref<UserProfile | null>,
  db: any,
  appId: string,
  mockMode: boolean
) {
  // === State ===
  const mentorPosts: Ref<MentorPost[]> = ref([])
  const myMentorships: Ref<Mentorship[]> = ref([])
  const myMentorProfile: Ref<MentorProfile | null> = ref(null)
  const myMenteeProfile: Ref<MenteeProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(false)

  // === Computed ===
  const pendingRequests = computed(() =>
    myMentorships.value.filter(m =>
      (m.status === 'pending_mentor' && m.mentorId === userId.value) ||
      (m.status === 'pending_mentee' && m.menteeId === userId.value)
    )
  )

  const activeMentorships = computed(() =>
    myMentorships.value.filter(m => m.status === 'active')
  )

  const myPosts = computed(() =>
    mentorPosts.value.filter(p => p.userId === userId.value)
  )

  // === Methods ===

  // 載入所有發布
  const loadMentorPosts = async (filter?: { type?: MentorPostType }): Promise<void> => {
    isLoading.value = true

    if (mockMode) {
      let posts = [...MOCK_POSTS]
      if (filter?.type) {
        posts = posts.filter(p => p.type === filter.type)
      }
      mentorPosts.value = posts.sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      isLoading.value = false
      return
    }

    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      if (!db) return

      let q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'mentorPosts'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )

      if (filter?.type) {
        q = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'mentorPosts'),
          where('status', '==', 'active'),
          where('type', '==', filter.type),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      mentorPosts.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MentorPost))
    } catch (error) {
      console.error('Load posts error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 載入我的配對關係
  const loadMyMentorships = async (): Promise<void> => {
    if (!userId.value) return

    if (mockMode) {
      // Mock 資料從 localStorage 讀取
      const saved = localStorage.getItem('ither-mentorships')
      if (saved) {
        myMentorships.value = JSON.parse(saved)
      }
      return
    }

    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore')
      if (!db) return

      // 查詢我是導師或學員的配對
      const mentorQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'mentorships'),
        where('mentorId', '==', userId.value)
      )
      const menteeQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'mentorships'),
        where('menteeId', '==', userId.value)
      )

      const [mentorSnap, menteeSnap] = await Promise.all([
        getDocs(mentorQuery),
        getDocs(menteeQuery)
      ])

      const mentorships: Mentorship[] = []
      mentorSnap.docs.forEach(doc => {
        mentorships.push({ id: doc.id, ...doc.data() } as Mentorship)
      })
      menteeSnap.docs.forEach(doc => {
        if (!mentorships.find(m => m.id === doc.id)) {
          mentorships.push({ id: doc.id, ...doc.data() } as Mentorship)
        }
      })

      myMentorships.value = mentorships.sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
    } catch (error) {
      console.error('Load mentorships error:', error)
    }
  }

  // 發布導師邀請或學員需求
  const createPost = async (input: MentorPostInput): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const post: MentorPost = {
      id: `post-${Date.now()}`,
      userId: userId.value,
      type: input.type,
      title: input.title,
      areas: input.areas,
      description: input.description,
      status: 'active',
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: { seconds: Date.now() / 1000 },
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role
    }

    if (mockMode) {
      mentorPosts.value = [post, ...mentorPosts.value]
      return true
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mentorPosts'), {
        ...input,
        userId: userId.value,
        status: 'active',
        userName: userProfile.value.nickname,
        userRole: userProfile.value.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      await loadMentorPosts()
      return true
    } catch (error) {
      console.error('Create post error:', error)
      return false
    }
  }

  // 發起配對請求
  const requestMentorship = async (
    request: MentorshipRequest,
    asMentor: boolean
  ): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const mentorship: Mentorship = {
      id: `mentorship-${Date.now()}`,
      mentorId: asMentor ? userId.value : request.targetUserId,
      menteeId: asMentor ? request.targetUserId : userId.value,
      status: asMentor ? 'pending_mentee' : 'pending_mentor',
      initiatedBy: userId.value,
      areas: request.areas,
      message: request.message,
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: { seconds: Date.now() / 1000 },
      mentorName: asMentor ? userProfile.value.nickname : undefined,
      menteeName: asMentor ? undefined : userProfile.value.nickname
    }

    if (mockMode) {
      myMentorships.value = [mentorship, ...myMentorships.value]
      localStorage.setItem('ither-mentorships', JSON.stringify(myMentorships.value))
      return true
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mentorships'), {
        mentorId: mentorship.mentorId,
        menteeId: mentorship.menteeId,
        status: mentorship.status,
        initiatedBy: userId.value,
        areas: request.areas,
        message: request.message,
        mentorName: mentorship.mentorName,
        menteeName: mentorship.menteeName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      await loadMyMentorships()
      return true
    } catch (error) {
      console.error('Request mentorship error:', error)
      return false
    }
  }

  // 接受配對
  const acceptMentorship = async (mentorshipId: string): Promise<boolean> => {
    if (mockMode) {
      const idx = myMentorships.value.findIndex(m => m.id === mentorshipId)
      if (idx !== -1) {
        myMentorships.value[idx].status = 'active'
        myMentorships.value[idx].acceptedAt = { seconds: Date.now() / 1000 }
        localStorage.setItem('ither-mentorships', JSON.stringify(myMentorships.value))
      }
      return true
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await updateDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'mentorships', mentorshipId),
        {
          status: 'active',
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      )

      await loadMyMentorships()
      return true
    } catch (error) {
      console.error('Accept mentorship error:', error)
      return false
    }
  }

  // 拒絕配對
  const rejectMentorship = async (mentorshipId: string, reason?: string): Promise<boolean> => {
    if (mockMode) {
      const idx = myMentorships.value.findIndex(m => m.id === mentorshipId)
      if (idx !== -1) {
        myMentorships.value[idx].status = 'rejected'
        myMentorships.value[idx].rejectionReason = reason
        localStorage.setItem('ither-mentorships', JSON.stringify(myMentorships.value))
      }
      return true
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await updateDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'mentorships', mentorshipId),
        {
          status: 'rejected',
          rejectionReason: reason || '',
          updatedAt: serverTimestamp()
        }
      )

      await loadMyMentorships()
      return true
    } catch (error) {
      console.error('Reject mentorship error:', error)
      return false
    }
  }

  // 結束配對
  const completeMentorship = async (mentorshipId: string): Promise<boolean> => {
    if (mockMode) {
      const idx = myMentorships.value.findIndex(m => m.id === mentorshipId)
      if (idx !== -1) {
        myMentorships.value[idx].status = 'completed'
        myMentorships.value[idx].completedAt = { seconds: Date.now() / 1000 }
        localStorage.setItem('ither-mentorships', JSON.stringify(myMentorships.value))
      }
      return true
    }

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await updateDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'mentorships', mentorshipId),
        {
          status: 'completed',
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      )

      await loadMyMentorships()
      return true
    } catch (error) {
      console.error('Complete mentorship error:', error)
      return false
    }
  }

  // 更新導師資料
  const updateMentorProfile = async (input: MentorProfileInput): Promise<boolean> => {
    if (!userId.value) return false

    const profile: MentorProfile = {
      ...input,
      createdAt: myMentorProfile.value?.createdAt || { seconds: Date.now() / 1000 },
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (mockMode) {
      myMentorProfile.value = profile
      localStorage.setItem('ither-mentor-profile', JSON.stringify(profile))
      return true
    }

    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value),
        {
          mentorProfile: {
            ...input,
            createdAt: myMentorProfile.value?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        },
        { merge: true }
      )

      myMentorProfile.value = profile
      return true
    } catch (error) {
      console.error('Update mentor profile error:', error)
      return false
    }
  }

  // 更新學員資料
  const updateMenteeProfile = async (input: MenteeProfileInput): Promise<boolean> => {
    if (!userId.value) return false

    const profile: MenteeProfile = {
      ...input,
      createdAt: myMenteeProfile.value?.createdAt || { seconds: Date.now() / 1000 },
      updatedAt: { seconds: Date.now() / 1000 }
    }

    if (mockMode) {
      myMenteeProfile.value = profile
      localStorage.setItem('ither-mentee-profile', JSON.stringify(profile))
      return true
    }

    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      if (!db) return false

      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value),
        {
          menteeProfile: {
            ...input,
            createdAt: myMenteeProfile.value?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        },
        { merge: true }
      )

      myMenteeProfile.value = profile
      return true
    } catch (error) {
      console.error('Update mentee profile error:', error)
      return false
    }
  }

  // 載入我的導師/學員資料
  const loadMyProfiles = async (): Promise<void> => {
    if (mockMode) {
      const mentorSaved = localStorage.getItem('ither-mentor-profile')
      const menteeSaved = localStorage.getItem('ither-mentee-profile')
      if (mentorSaved) myMentorProfile.value = JSON.parse(mentorSaved)
      if (menteeSaved) myMenteeProfile.value = JSON.parse(menteeSaved)
      return
    }

    if (!userId.value || !db) return

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const profileDoc = await getDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'userProfiles', userId.value)
      )

      if (profileDoc.exists()) {
        const data = profileDoc.data()
        if (data.mentorProfile) myMentorProfile.value = data.mentorProfile
        if (data.menteeProfile) myMenteeProfile.value = data.menteeProfile
      }
    } catch (error) {
      console.error('Load profiles error:', error)
    }
  }

  // 刪除發布
  const deletePost = async (postId: string): Promise<boolean> => {
    if (mockMode) {
      mentorPosts.value = mentorPosts.value.filter(p => p.id !== postId)
      return true
    }

    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      if (!db) return false

      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mentorPosts', postId))
      await loadMentorPosts()
      return true
    } catch (error) {
      console.error('Delete post error:', error)
      return false
    }
  }

  return {
    // State
    mentorPosts,
    myMentorships,
    myMentorProfile,
    myMenteeProfile,
    isLoading,
    // Computed
    pendingRequests,
    activeMentorships,
    myPosts,
    // Methods
    loadMentorPosts,
    loadMyMentorships,
    loadMyProfiles,
    createPost,
    deletePost,
    requestMentorship,
    acceptMentorship,
    rejectMentorship,
    completeMentorship,
    updateMentorProfile,
    updateMenteeProfile
  }
}
