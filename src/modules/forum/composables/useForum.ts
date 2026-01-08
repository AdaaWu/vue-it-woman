import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { MOCK_MODE, firebaseDb, appId } from '@/shared/services/firebase'
import type {
  ForumPost, ForumPostInput, ForumComment, ForumCommentInput,
  ForumCategory, UserProfile
} from '@/types'

// Mock 資料
const MOCK_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    category: 'tech',
    title: '大家怎麼看 Vue 3.4 的新功能？',
    content: '最近 Vue 3.4 發布了，新增了很多實用的功能，像是 defineModel 的穩定版。大家有開始用了嗎？覺得哪些功能最實用？\n\n我個人覺得 v-bind 同名簡寫超方便的！',
    tags: ['Vue.js', 'Frontend', '新功能'],
    status: 'active',
    viewCount: 128,
    likeCount: 15,
    commentCount: 8,
    likedBy: ['mock-2', 'mock-3'],
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: null
  },
  {
    id: 'post-2',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    category: 'career',
    title: '從小公司跳到大公司的心得分享',
    content: '最近剛完成轉職，從 10 人的新創跳到 500+ 人的外商。想跟大家分享一些心得：\n\n1. 面試準備真的很重要\n2. 軟實力比你想像的更重要\n3. 薪水談判要有自信\n\n有問題歡迎問我！',
    tags: ['轉職', '面試', '外商'],
    status: 'active',
    viewCount: 256,
    likeCount: 42,
    commentCount: 23,
    likedBy: ['mock-1', 'mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'post-3',
    userId: 'mock-5',
    userName: '忙碌的媽咪',
    userRole: 'Backend Dev',
    category: 'life',
    title: '工程師媽媽的一天是怎麼過的？',
    content: '常常有人問我怎麼兼顧工作和家庭，今天來分享一下我的日常：\n\n6:00 起床準備早餐\n7:30 送小孩上學\n8:30 開始工作\n...\n\n其實最重要的是找到支持你的公司和隊友！',
    tags: ['WLB', '育兒', '工程師媽媽'],
    status: 'active',
    viewCount: 189,
    likeCount: 67,
    commentCount: 31,
    likedBy: ['mock-1', 'mock-2', 'mock-4', 'mock-6'],
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  },
  {
    id: 'post-4',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    category: 'learning',
    title: '推薦幾個學習系統設計的資源',
    content: '最近在準備 Senior 面試，整理了一些學習系統設計的好資源：\n\n1. System Design Primer (GitHub)\n2. Designing Data-Intensive Applications\n3. ByteByteGo 的 YouTube 頻道\n\n大家有其他推薦嗎？',
    tags: ['系統設計', '面試', '學習資源'],
    status: 'active',
    viewCount: 312,
    likeCount: 89,
    commentCount: 15,
    likedBy: ['mock-1', 'mock-2', 'mock-3', 'mock-5'],
    createdAt: { seconds: Date.now() / 1000 - 345600 },
    updatedAt: null
  }
]

const MOCK_COMMENTS: ForumComment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    content: 'defineModel 真的很方便！省去很多 boilerplate code',
    likeCount: 3,
    likedBy: ['mock-1'],
    createdAt: { seconds: Date.now() / 1000 - 82800 },
    updatedAt: null
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    content: '我也覺得！而且 IDE 的支援也越來越好了',
    likeCount: 1,
    likedBy: [],
    createdAt: { seconds: Date.now() / 1000 - 79200 },
    updatedAt: null
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    content: '謝謝分享！請問面試準備大概花了多久時間？',
    likeCount: 2,
    likedBy: ['mock-2'],
    createdAt: { seconds: Date.now() / 1000 - 169200 },
    updatedAt: null
  },
  {
    id: 'comment-4',
    postId: 'post-2',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    content: '@Sophia 大概準備了 2 個月左右，主要刷題和練習系統設計',
    likeCount: 5,
    likedBy: ['mock-1', 'mock-4'],
    parentId: 'comment-3',
    createdAt: { seconds: Date.now() / 1000 - 165600 },
    updatedAt: null
  }
]

export function useForum(
  userId: Ref<string | null>,
  userProfile: Ref<UserProfile | null>
) {
  // --- State ---
  const posts: Ref<ForumPost[]> = ref([])
  const currentPost: Ref<ForumPost | null> = ref(null)
  const comments: Ref<ForumComment[]> = ref([])
  const isLoading: Ref<boolean> = ref(false)
  const localPosts: Ref<ForumPost[]> = ref([])
  const localComments: Ref<ForumComment[]> = ref([])

  // --- Computed ---
  const sortedPosts: ComputedRef<ForumPost[]> = computed(() => {
    const allPosts = [...MOCK_POSTS, ...localPosts.value, ...posts.value]
    return allPosts
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0
        const t2 = b.createdAt?.seconds || 0
        return t2 - t1 // 最新在前
      })
  })

  const myPosts: ComputedRef<ForumPost[]> = computed(() => {
    return sortedPosts.value.filter(p => p.userId === userId.value)
  })

  // --- 載入貼文列表 ---
  const loadPosts = async (category?: ForumCategory): Promise<void> => {
    if (MOCK_MODE) {
      // Mock 模式已經在 sortedPosts 中處理
      return
    }

    if (!firebaseDb.value) return

    try {
      isLoading.value = true
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')

      let q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )

      if (category) {
        q = query(q, where('category', '==', category))
      }

      const snapshot = await getDocs(q)
      posts.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumPost))
    } catch (error) {
      console.error('[Forum] Load posts error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // --- 載入單一貼文 ---
  const loadPost = async (postId: string): Promise<ForumPost | null> => {
    if (MOCK_MODE) {
      const post = [...MOCK_POSTS, ...localPosts.value].find(p => p.id === postId)
      if (post) {
        currentPost.value = post
        return post
      }
      return null
    }

    if (!firebaseDb.value) return null

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const postRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts', postId)
      const snapshot = await getDoc(postRef)

      if (snapshot.exists()) {
        const post = { id: snapshot.id, ...snapshot.data() } as ForumPost
        currentPost.value = post
        return post
      }
      return null
    } catch (error) {
      console.error('[Forum] Load post error:', error)
      return null
    }
  }

  // --- 建立貼文 ---
  const createPost = async (data: ForumPostInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newPost: ForumPost = {
      id: `local-post-${Date.now()}`,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      category: data.category,
      title: data.title,
      content: data.content,
      tags: data.tags,
      status: 'active',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      likedBy: [],
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localPosts.value = [newPost, ...localPosts.value]
      return newPost.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts'),
        {
          ...data,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          status: 'active',
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          likedBy: [],
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      await loadPosts()
      return docRef.id
    } catch (error) {
      console.error('[Forum] Create post error:', error)
      return null
    }
  }

  // --- 刪除貼文 ---
  const deletePost = async (postId: string): Promise<boolean> => {
    if (MOCK_MODE) {
      localPosts.value = localPosts.value.filter(p => p.id !== postId)
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const postRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts', postId)
      await updateDoc(postRef, { status: 'deleted' })
      await loadPosts()
      return true
    } catch (error) {
      console.error('[Forum] Delete post error:', error)
      return false
    }
  }

  // --- 按讚貼文 ---
  const togglePostLike = async (postId: string): Promise<boolean> => {
    if (!userId.value) return false

    if (MOCK_MODE) {
      const post = [...MOCK_POSTS, ...localPosts.value].find(p => p.id === postId)
      if (post) {
        const isLiked = post.likedBy.includes(userId.value)
        if (isLiked) {
          post.likedBy = post.likedBy.filter(id => id !== userId.value)
          post.likeCount--
        } else {
          post.likedBy.push(userId.value)
          post.likeCount++
        }
      }
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, arrayUnion, arrayRemove, increment } = await import('firebase/firestore')
      const postRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts', postId)

      const post = posts.value.find(p => p.id === postId)
      const isLiked = post?.likedBy.includes(userId.value) || false

      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(userId.value),
          likeCount: increment(-1)
        })
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(userId.value),
          likeCount: increment(1)
        })
      }

      await loadPosts()
      return true
    } catch (error) {
      console.error('[Forum] Toggle like error:', error)
      return false
    }
  }

  // --- 載入留言 ---
  const loadComments = async (postId: string): Promise<void> => {
    if (MOCK_MODE) {
      comments.value = [...MOCK_COMMENTS, ...localComments.value]
        .filter(c => c.postId === postId)
        .sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0
          const t2 = b.createdAt?.seconds || 0
          return t1 - t2 // 時間順序
        })
      return
    }

    if (!firebaseDb.value) return

    try {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')

      const q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      )

      const snapshot = await getDocs(q)
      comments.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumComment))
    } catch (error) {
      console.error('[Forum] Load comments error:', error)
    }
  }

  // --- 新增留言 ---
  const addComment = async (data: ForumCommentInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newComment: ForumComment = {
      id: `local-comment-${Date.now()}`,
      postId: data.postId,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      content: data.content,
      likeCount: 0,
      likedBy: [],
      parentId: data.parentId,
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localComments.value = [...localComments.value, newComment]
      // 更新貼文留言數
      const post = [...MOCK_POSTS, ...localPosts.value].find(p => p.id === data.postId)
      if (post) {
        post.commentCount++
      }
      await loadComments(data.postId)
      return newComment.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumComments'),
        {
          postId: data.postId,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          content: data.content,
          likeCount: 0,
          likedBy: [],
          parentId: data.parentId || null,
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      // 更新貼文留言數
      const postRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumPosts', data.postId)
      await updateDoc(postRef, {
        commentCount: increment(1)
      })

      await loadComments(data.postId)
      return docRef.id
    } catch (error) {
      console.error('[Forum] Add comment error:', error)
      return null
    }
  }

  // --- 按讚留言 ---
  const toggleCommentLike = async (commentId: string): Promise<boolean> => {
    if (!userId.value) return false

    if (MOCK_MODE) {
      const comment = [...MOCK_COMMENTS, ...localComments.value].find(c => c.id === commentId)
      if (comment) {
        const isLiked = comment.likedBy.includes(userId.value)
        if (isLiked) {
          comment.likedBy = comment.likedBy.filter(id => id !== userId.value)
          comment.likeCount--
        } else {
          comment.likedBy.push(userId.value)
          comment.likeCount++
        }
      }
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, arrayUnion, arrayRemove, increment } = await import('firebase/firestore')
      const commentRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'forumComments', commentId)

      const comment = comments.value.find(c => c.id === commentId)
      const isLiked = comment?.likedBy.includes(userId.value) || false

      if (isLiked) {
        await updateDoc(commentRef, {
          likedBy: arrayRemove(userId.value),
          likeCount: increment(-1)
        })
      } else {
        await updateDoc(commentRef, {
          likedBy: arrayUnion(userId.value),
          likeCount: increment(1)
        })
      }

      if (currentPost.value) {
        await loadComments(currentPost.value.id)
      }
      return true
    } catch (error) {
      console.error('[Forum] Toggle comment like error:', error)
      return false
    }
  }

  return {
    // State
    posts: sortedPosts,
    myPosts,
    currentPost,
    comments,
    isLoading,
    // Actions
    loadPosts,
    loadPost,
    createPost,
    deletePost,
    togglePostLike,
    loadComments,
    addComment,
    toggleCommentLike
  }
}
