import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { MOCK_MODE, firebaseDb, appId } from '@/shared/services/firebase'
import type {
  Book, BookInput, BookReview, BookReviewInput, BookShare,
  UserBookProgress, BookCategory, ReadingStatus, UserProfile
} from '@/types'

// Mock 資料
const MOCK_BOOKS: Book[] = [
  {
    id: 'book-1',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    title: '重構：改善既有程式的設計',
    author: 'Martin Fowler',
    category: 'tech',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop',
    description: '這本書是軟體開發的經典之作，教你如何有系統地改善程式碼品質。適合所有想要寫出更好程式碼的開發者閱讀。',
    tags: ['重構', '程式設計', '軟體工程'],
    avgRating: 4.8,
    reviewCount: 23,
    wantToReadCount: 45,
    readingCount: 12,
    finishedCount: 56,
    shareCount: 18,
    createdAt: { seconds: Date.now() / 1000 - 2592000 },
    updatedAt: null
  },
  {
    id: 'book-2',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    title: '原子習慣',
    author: 'James Clear',
    category: 'self-growth',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    description: '透過微小的習慣改變，創造驚人的成果。這本書提供了實用的框架，幫助你建立好習慣、戒除壞習慣。',
    tags: ['習慣', '自我成長', '生產力'],
    avgRating: 4.6,
    reviewCount: 89,
    wantToReadCount: 120,
    readingCount: 34,
    finishedCount: 156,
    shareCount: 67,
    createdAt: { seconds: Date.now() / 1000 - 1296000 },
    updatedAt: null
  },
  {
    id: 'book-3',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    title: '軟技能：代碼之外的生存指南',
    author: 'John Sonmez',
    category: 'career',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop',
    description: '程式設計師的職涯發展不只是寫程式。這本書涵蓋了職涯規劃、學習方法、理財等軟技能主題。',
    tags: ['軟技能', '職涯發展', '程式設計師'],
    avgRating: 4.2,
    reviewCount: 34,
    wantToReadCount: 67,
    readingCount: 21,
    finishedCount: 89,
    shareCount: 23,
    createdAt: { seconds: Date.now() / 1000 - 864000 },
    updatedAt: null
  },
  {
    id: 'book-4',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    title: '高效能人士的七個習慣',
    author: 'Stephen Covey',
    category: 'business',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
    description: '經典的個人效能書籍，教你如何成為一個高效能的人。從依賴到獨立再到互賴的成長路徑。',
    tags: ['效能', '領導力', '習慣'],
    avgRating: 4.5,
    reviewCount: 156,
    wantToReadCount: 89,
    readingCount: 45,
    finishedCount: 234,
    shareCount: 89,
    createdAt: { seconds: Date.now() / 1000 - 432000 },
    updatedAt: null
  }
]

const MOCK_REVIEWS: BookReview[] = [
  {
    id: 'review-1',
    bookId: 'book-1',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    rating: 5,
    content: '這本書徹底改變了我寫程式的方式！每個重構手法都有清楚的範例，超級實用。強烈推薦給所有開發者！',
    readingStatus: 'finished',
    likeCount: 12,
    likedBy: ['mock-1', 'mock-3'],
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'review-2',
    bookId: 'book-1',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    rating: 4,
    content: '內容很棒，但有些範例用的是 Java，對於主要寫 JavaScript 的我來說需要轉換一下思維。整體還是很值得一讀！',
    readingStatus: 'finished',
    likeCount: 5,
    likedBy: ['mock-1'],
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: null
  },
  {
    id: 'review-3',
    bookId: 'book-2',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    rating: 5,
    content: '讀完這本書後，我開始用「原子習慣」的方法建立每天學習的習慣。真的很有效！書中的 1% 進步法則讓我不再焦慮。',
    readingStatus: 'finished',
    likeCount: 23,
    likedBy: ['mock-2', 'mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  }
]

export function useBooklist(
  userId: Ref<string | null>,
  userProfile: Ref<UserProfile | null>
) {
  // --- State ---
  const books: Ref<Book[]> = ref([])
  const currentBook: Ref<Book | null> = ref(null)
  const reviews: Ref<BookReview[]> = ref([])
  const myProgress: Ref<UserBookProgress[]> = ref([])
  const isLoading: Ref<boolean> = ref(false)
  const localBooks: Ref<Book[]> = ref([])
  const localReviews: Ref<BookReview[]> = ref([])
  const localProgress: Ref<UserBookProgress[]> = ref([])

  // --- Computed ---
  const sortedBooks: ComputedRef<Book[]> = computed(() => {
    const allBooks = [...MOCK_BOOKS, ...localBooks.value, ...books.value]
    // 去重
    const uniqueBooks = allBooks.filter((book, index, self) =>
      index === self.findIndex(b => b.id === book.id)
    )
    return uniqueBooks.sort((a, b) => {
      const t1 = a.createdAt?.seconds || 0
      const t2 = b.createdAt?.seconds || 0
      return t2 - t1 // 最新在前
    })
  })

  // 依評分排序
  const topRatedBooks: ComputedRef<Book[]> = computed(() => {
    return [...sortedBooks.value].sort((a, b) => b.avgRating - a.avgRating)
  })

  // 依熱門程度排序 (閱讀人數)
  const popularBooks: ComputedRef<Book[]> = computed(() => {
    return [...sortedBooks.value].sort((a, b) =>
      (b.finishedCount + b.readingCount) - (a.finishedCount + a.readingCount)
    )
  })

  // 我加入書單的書
  const myBooklist: ComputedRef<{ book: Book; progress: UserBookProgress }[]> = computed(() => {
    const progressList = [...localProgress.value, ...myProgress.value]
    return progressList
      .map(progress => {
        const book = sortedBooks.value.find(b => b.id === progress.bookId)
        return book ? { book, progress } : null
      })
      .filter((item): item is { book: Book; progress: UserBookProgress } => item !== null)
  })

  // --- 載入書籍列表 ---
  const loadBooks = async (category?: BookCategory): Promise<void> => {
    if (MOCK_MODE) {
      return // Mock 模式已經在 sortedBooks 中處理
    }

    if (!firebaseDb.value) return

    try {
      isLoading.value = true
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')

      let q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books'),
        orderBy('createdAt', 'desc')
      )

      if (category) {
        q = query(
          collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books'),
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      books.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Book))
    } catch (error) {
      console.error('[Booklist] Load books error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // --- 載入單一書籍 ---
  const loadBook = async (bookId: string): Promise<Book | null> => {
    if (MOCK_MODE) {
      const book = [...MOCK_BOOKS, ...localBooks.value].find(b => b.id === bookId)
      if (book) {
        currentBook.value = book
        return book
      }
      return null
    }

    if (!firebaseDb.value) return null

    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const bookRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books', bookId)
      const snapshot = await getDoc(bookRef)

      if (snapshot.exists()) {
        const book = { id: snapshot.id, ...snapshot.data() } as Book
        currentBook.value = book
        return book
      }
      return null
    } catch (error) {
      console.error('[Booklist] Load book error:', error)
      return null
    }
  }

  // --- 新增書籍 ---
  const createBook = async (data: BookInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newBook: Book = {
      id: `local-book-${Date.now()}`,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      title: data.title,
      author: data.author,
      category: data.category,
      coverUrl: data.coverUrl,
      description: data.description,
      tags: data.tags,
      avgRating: 0,
      reviewCount: 0,
      wantToReadCount: 0,
      readingCount: 0,
      finishedCount: 0,
      shareCount: 0,
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localBooks.value = [newBook, ...localBooks.value]
      return newBook.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books'),
        {
          ...data,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          avgRating: 0,
          reviewCount: 0,
          wantToReadCount: 0,
          readingCount: 0,
          finishedCount: 0,
          shareCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      await loadBooks()
      return docRef.id
    } catch (error) {
      console.error('[Booklist] Create book error:', error)
      return null
    }
  }

  // --- 載入書評 ---
  const loadReviews = async (bookId: string): Promise<void> => {
    if (MOCK_MODE) {
      reviews.value = [...MOCK_REVIEWS, ...localReviews.value]
        .filter(r => r.bookId === bookId)
        .sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0
          const t2 = b.createdAt?.seconds || 0
          return t2 - t1 // 最新在前
        })
      return
    }

    if (!firebaseDb.value) return

    try {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')

      const q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'bookReviews'),
        where('bookId', '==', bookId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      reviews.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BookReview))
    } catch (error) {
      console.error('[Booklist] Load reviews error:', error)
    }
  }

  // --- 新增書評 ---
  const addReview = async (data: BookReviewInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newReview: BookReview = {
      id: `local-review-${Date.now()}`,
      bookId: data.bookId,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      rating: data.rating,
      content: data.content,
      readingStatus: data.readingStatus,
      likeCount: 0,
      likedBy: [],
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localReviews.value = [newReview, ...localReviews.value]
      // 更新書籍評分
      const book = [...MOCK_BOOKS, ...localBooks.value].find(b => b.id === data.bookId)
      if (book) {
        const allReviews = [...MOCK_REVIEWS, ...localReviews.value].filter(r => r.bookId === data.bookId)
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
        book.avgRating = Math.round((totalRating / allReviews.length) * 10) / 10
        book.reviewCount = allReviews.length
      }
      await loadReviews(data.bookId)
      return newReview.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, doc, updateDoc, increment, serverTimestamp, getDoc } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'bookReviews'),
        {
          bookId: data.bookId,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          rating: data.rating,
          content: data.content,
          readingStatus: data.readingStatus,
          likeCount: 0,
          likedBy: [],
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      // 更新書籍統計
      const bookRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books', data.bookId)
      const bookSnap = await getDoc(bookRef)
      if (bookSnap.exists()) {
        const bookData = bookSnap.data()
        const newCount = (bookData.reviewCount || 0) + 1
        const newAvg = ((bookData.avgRating || 0) * (newCount - 1) + data.rating) / newCount
        await updateDoc(bookRef, {
          reviewCount: increment(1),
          avgRating: Math.round(newAvg * 10) / 10
        })
      }

      await loadReviews(data.bookId)
      return docRef.id
    } catch (error) {
      console.error('[Booklist] Add review error:', error)
      return null
    }
  }

  // --- 按讚書評 ---
  const toggleReviewLike = async (reviewId: string): Promise<boolean> => {
    if (!userId.value) return false

    if (MOCK_MODE) {
      const review = [...MOCK_REVIEWS, ...localReviews.value].find(r => r.id === reviewId)
      if (review) {
        const isLiked = review.likedBy.includes(userId.value)
        if (isLiked) {
          review.likedBy = review.likedBy.filter(id => id !== userId.value)
          review.likeCount--
        } else {
          review.likedBy.push(userId.value)
          review.likeCount++
        }
      }
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, arrayUnion, arrayRemove, increment } = await import('firebase/firestore')
      const reviewRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'bookReviews', reviewId)

      const review = reviews.value.find(r => r.id === reviewId)
      const isLiked = review?.likedBy.includes(userId.value) || false

      if (isLiked) {
        await updateDoc(reviewRef, {
          likedBy: arrayRemove(userId.value),
          likeCount: increment(-1)
        })
      } else {
        await updateDoc(reviewRef, {
          likedBy: arrayUnion(userId.value),
          likeCount: increment(1)
        })
      }

      if (currentBook.value) {
        await loadReviews(currentBook.value.id)
      }
      return true
    } catch (error) {
      console.error('[Booklist] Toggle review like error:', error)
      return false
    }
  }

  // --- 更新閱讀進度 ---
  const updateProgress = async (bookId: string, status: ReadingStatus): Promise<boolean> => {
    if (!userId.value) return false

    const existingProgress = [...localProgress.value, ...myProgress.value].find(
      p => p.bookId === bookId && p.userId === userId.value
    )

    if (MOCK_MODE) {
      if (existingProgress) {
        // 更新進度
        const oldStatus = existingProgress.status
        existingProgress.status = status
        existingProgress.updatedAt = { seconds: Date.now() / 1000 }
        if (status === 'finished' && oldStatus !== 'finished') {
          existingProgress.finishedAt = { seconds: Date.now() / 1000 }
        }
        // 更新書籍統計
        const book = [...MOCK_BOOKS, ...localBooks.value].find(b => b.id === bookId)
        if (book) {
          if (oldStatus === 'want-to-read') book.wantToReadCount--
          if (oldStatus === 'reading') book.readingCount--
          if (oldStatus === 'finished') book.finishedCount--
          if (status === 'want-to-read') book.wantToReadCount++
          if (status === 'reading') book.readingCount++
          if (status === 'finished') book.finishedCount++
        }
      } else {
        // 新增進度
        const newProgress: UserBookProgress = {
          id: `local-progress-${Date.now()}`,
          userId: userId.value,
          bookId,
          status,
          startedAt: status === 'reading' ? { seconds: Date.now() / 1000 } : null,
          finishedAt: status === 'finished' ? { seconds: Date.now() / 1000 } : null,
          createdAt: { seconds: Date.now() / 1000 },
          updatedAt: null
        }
        localProgress.value = [...localProgress.value, newProgress]
        // 更新書籍統計
        const book = [...MOCK_BOOKS, ...localBooks.value].find(b => b.id === bookId)
        if (book) {
          if (status === 'want-to-read') book.wantToReadCount++
          if (status === 'reading') book.readingCount++
          if (status === 'finished') book.finishedCount++
        }
      }
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, setDoc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')

      const progressId = `${userId.value}_${bookId}`
      const progressRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userBookProgress', progressId)

      const bookRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books', bookId)

      if (existingProgress) {
        const oldStatus = existingProgress.status
        await updateDoc(progressRef, {
          status,
          updatedAt: serverTimestamp(),
          ...(status === 'finished' ? { finishedAt: serverTimestamp() } : {})
        })

        // 更新書籍統計
        const decrements: Record<string, unknown> = {}
        const increments: Record<string, unknown> = {}

        if (oldStatus === 'want-to-read') decrements.wantToReadCount = increment(-1)
        if (oldStatus === 'reading') decrements.readingCount = increment(-1)
        if (oldStatus === 'finished') decrements.finishedCount = increment(-1)
        if (status === 'want-to-read') increments.wantToReadCount = increment(1)
        if (status === 'reading') increments.readingCount = increment(1)
        if (status === 'finished') increments.finishedCount = increment(1)

        await updateDoc(bookRef, { ...decrements, ...increments })
      } else {
        await setDoc(progressRef, {
          userId: userId.value,
          bookId,
          status,
          startedAt: status === 'reading' ? serverTimestamp() : null,
          finishedAt: status === 'finished' ? serverTimestamp() : null,
          createdAt: serverTimestamp(),
          updatedAt: null
        })

        // 更新書籍統計
        const increments: Record<string, unknown> = {}
        if (status === 'want-to-read') increments.wantToReadCount = increment(1)
        if (status === 'reading') increments.readingCount = increment(1)
        if (status === 'finished') increments.finishedCount = increment(1)

        await updateDoc(bookRef, increments)
      }

      await loadMyProgress()
      return true
    } catch (error) {
      console.error('[Booklist] Update progress error:', error)
      return false
    }
  }

  // --- 載入我的閱讀進度 ---
  const loadMyProgress = async (): Promise<void> => {
    if (!userId.value) return

    if (MOCK_MODE) {
      // Mock 模式下從 localProgress 讀取
      return
    }

    if (!firebaseDb.value) return

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')

      const q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'userBookProgress'),
        where('userId', '==', userId.value)
      )

      const snapshot = await getDocs(q)
      myProgress.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserBookProgress))
    } catch (error) {
      console.error('[Booklist] Load my progress error:', error)
    }
  }

  // --- 分享書籍 ---
  const shareBook = async (bookId: string, platform: BookShare['platform']): Promise<boolean> => {
    if (!userId.value || !userProfile.value) return false

    const book = sortedBooks.value.find(b => b.id === bookId)
    if (!book) return false

    // 產生分享連結
    const shareUrl = `${window.location.origin}/ither/#/book/${bookId}`
    const shareText = `我推薦《${book.title}》- ${book.author}\n\n${book.description.slice(0, 100)}...\n\n`

    try {
      switch (platform) {
        case 'copy-link':
          await navigator.clipboard.writeText(shareUrl)
          break
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
          break
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
          break
        case 'line':
          window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
          break
      }

      // 記錄分享
      if (MOCK_MODE) {
        const bookToUpdate = [...MOCK_BOOKS, ...localBooks.value].find(b => b.id === bookId)
        if (bookToUpdate) {
          bookToUpdate.shareCount++
        }
      } else if (firebaseDb.value) {
        const { doc, updateDoc, increment, collection, addDoc, serverTimestamp } = await import('firebase/firestore')

        // 記錄分享紀錄
        await addDoc(
          collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'bookShares'),
          {
            bookId,
            userId: userId.value,
            userName: userProfile.value.nickname,
            platform,
            createdAt: serverTimestamp()
          }
        )

        // 更新分享計數
        const bookRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'books', bookId)
        await updateDoc(bookRef, { shareCount: increment(1) })
      }

      return true
    } catch (error) {
      console.error('[Booklist] Share book error:', error)
      return false
    }
  }

  // --- 取得書籍的閱讀進度 ---
  const getBookProgress = (bookId: string): UserBookProgress | undefined => {
    return [...localProgress.value, ...myProgress.value].find(
      p => p.bookId === bookId && p.userId === userId.value
    )
  }

  return {
    // State
    books: sortedBooks,
    topRatedBooks,
    popularBooks,
    myBooklist,
    currentBook,
    reviews,
    isLoading,
    // Actions
    loadBooks,
    loadBook,
    createBook,
    loadReviews,
    addReview,
    toggleReviewLike,
    updateProgress,
    loadMyProgress,
    shareBook,
    getBookProgress
  }
}
