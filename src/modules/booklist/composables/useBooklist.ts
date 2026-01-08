import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { MOCK_MODE, firebaseDb, appId } from '@/shared/services/firebase'
import type {
  Book, BookInput, BookReview, BookReviewInput, BookShare,
  UserBookProgress, BookCategory, ReadingStatus, UserProfile,
  BookTopic, TopicCategory
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
    description: '這本書是軟體開發的經典之作，教你如何有系統地改善程式碼品質。每個重構手法都有清楚的說明和程式碼範例，讓你能夠一步步學習如何識別程式碼中的「壞味道」，並運用適當的重構技術來改善它們。無論你是剛入門的程式設計師，還是有多年經驗的資深開發者，這本書都能幫助你寫出更乾淨、更容易維護的程式碼。',
    tags: ['重構', '程式設計', '軟體工程', 'Clean Code'],
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
    description: '透過微小的習慣改變，創造驚人的成果。這本書提供了實用的框架，幫助你建立好習慣、戒除壞習慣。作者 James Clear 透過科學研究和真實案例，解釋了為什麼微小的改變能帶來巨大的影響。書中的「1% 進步法則」、「習慣堆疊」等概念都非常實用，適合想要改變生活的每個人閱讀。',
    tags: ['習慣', '自我成長', '生產力', '心理學'],
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
    description: '程式設計師的職涯發展不只是寫程式。這本書涵蓋了職涯規劃、學習方法、理財、健康管理等軟技能主題。作者以自己的經驗告訴你，如何在技術之外建立個人品牌、如何談判薪資、如何保持學習動力。對於想要在科技業長期發展的人來說，這本書提供了很多實用的建議。',
    tags: ['軟技能', '職涯發展', '程式設計師', '個人品牌'],
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
    description: '經典的個人效能書籍，教你如何成為一個高效能的人。從依賴到獨立再到互賴的成長路徑。七個習慣分別是：主動積極、以終為始、要事第一、雙贏思維、知彼解己、統合綜效、不斷更新。這本書不只是時間管理技巧，更是一套完整的人生哲學。',
    tags: ['效能', '領導力', '習慣', '自我管理'],
    avgRating: 4.5,
    reviewCount: 156,
    wantToReadCount: 89,
    readingCount: 45,
    finishedCount: 234,
    shareCount: 89,
    createdAt: { seconds: Date.now() / 1000 - 432000 },
    updatedAt: null
  },
  {
    id: 'book-5',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    title: 'Vue.js 設計與實現',
    author: '霍春陽',
    category: 'tech',
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop',
    description: '深入解析 Vue.js 3 的設計思想與實現細節。這本書從響應式系統、渲染器、編譯器等核心模組出發，帶你理解 Vue.js 的運作原理。適合想要深入了解前端框架設計的開發者，讀完後你會對 Vue.js 有更深刻的認識。',
    tags: ['Vue.js', '前端', '框架設計', 'JavaScript'],
    avgRating: 4.7,
    reviewCount: 45,
    wantToReadCount: 78,
    readingCount: 23,
    finishedCount: 67,
    shareCount: 34,
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'book-6',
    userId: 'mock-5',
    userName: '忙碌的媽咪',
    userRole: 'Backend Dev',
    title: '被討厭的勇氣',
    author: '岸見一郎、古賀史健',
    category: 'self-growth',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=300&fit=crop',
    description: '以阿德勒心理學為基礎，透過哲學家與年輕人的對話，探討人生的意義與幸福。書中提出「所有煩惱都來自人際關係」、「課題分離」等概念，幫助你從他人的期待中解放出來，找到屬於自己的人生道路。',
    tags: ['心理學', '阿德勒', '自我成長', '人際關係'],
    avgRating: 4.4,
    reviewCount: 112,
    wantToReadCount: 145,
    readingCount: 56,
    finishedCount: 189,
    shareCount: 78,
    createdAt: { seconds: Date.now() / 1000 - 518400 },
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
    content: '這本書徹底改變了我寫程式的方式！每個重構手法都有清楚的範例，超級實用。強烈推薦給所有開發者！我現在每次 code review 都會想到書中的概念。',
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
    content: '內容很棒，但有些範例用的是 Java，對於主要寫 JavaScript 的我來說需要轉換一下思維。整體還是很值得一讀！特別是「提煉函式」和「以查詢取代暫時變數」這兩個技巧超實用。',
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
    content: '讀完這本書後，我開始用「原子習慣」的方法建立每天學習的習慣。真的很有效！書中的 1% 進步法則讓我不再焦慮，每天只要進步一點點就好。',
    readingStatus: 'finished',
    likeCount: 23,
    likedBy: ['mock-2', 'mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  },
  {
    id: 'review-4',
    bookId: 'book-2',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    rating: 5,
    content: '我把這本書推薦給我的團隊成員！習慣堆疊的概念非常實用，可以幫助建立新的工作流程。身為 Manager，我覺得這本書對團隊效能提升也很有幫助。',
    readingStatus: 'finished',
    likeCount: 18,
    likedBy: ['mock-1', 'mock-2'],
    createdAt: { seconds: Date.now() / 1000 - 345600 },
    updatedAt: null
  },
  {
    id: 'review-5',
    bookId: 'book-3',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    rating: 4,
    content: '這本書讓我意識到程式設計師不只是寫程式！裡面關於建立個人品牌、經營部落格的建議都很實用。唯一缺點是有些內容比較美國導向。',
    readingStatus: 'finished',
    likeCount: 8,
    likedBy: ['mock-3'],
    createdAt: { seconds: Date.now() / 1000 - 604800 },
    updatedAt: null
  },
  {
    id: 'review-6',
    bookId: 'book-4',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    rating: 5,
    content: '經典中的經典！雖然是幾十年前的書，但書中的智慧到現在都還很受用。「以終為始」這個習慣對我的職涯規劃幫助很大。',
    readingStatus: 'finished',
    likeCount: 15,
    likedBy: ['mock-1', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 432000 },
    updatedAt: null
  },
  {
    id: 'review-7',
    bookId: 'book-5',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    rating: 5,
    content: '看完這本書對 Vue.js 的理解提升了一個層次！原來響應式系統是這樣設計的，作者解釋得非常清楚。推薦給所有 Vue 開發者！',
    readingStatus: 'finished',
    likeCount: 21,
    likedBy: ['mock-1', 'mock-2', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: null
  },
  {
    id: 'review-8',
    bookId: 'book-5',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    rating: 4,
    content: '很硬核的一本書，需要有一定的 JavaScript 基礎才能讀懂。但讀完後對框架設計有更深的理解，面試時也更有信心了！',
    readingStatus: 'reading',
    likeCount: 9,
    likedBy: ['mock-1'],
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'review-9',
    bookId: 'book-6',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    rating: 5,
    content: '這本書改變了我看待人際關係的方式！「課題分離」的概念讓我不再為別人的想法而煩惱。強烈推薦給容易在意他人眼光的人。',
    readingStatus: 'finished',
    likeCount: 34,
    likedBy: ['mock-1', 'mock-3', 'mock-4', 'mock-5'],
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  },
  {
    id: 'review-10',
    bookId: 'book-6',
    userId: 'mock-5',
    userName: '忙碌的媽咪',
    userRole: 'Backend Dev',
    rating: 4,
    content: '對話形式的寫法讓這本書讀起來很輕鬆。阿德勒心理學的觀點很有啟發性，雖然有些觀點我還需要時間消化，但整體來說是一本值得反覆閱讀的好書。',
    readingStatus: 'finished',
    likeCount: 12,
    likedBy: ['mock-2', 'mock-3'],
    createdAt: { seconds: Date.now() / 1000 - 518400 },
    updatedAt: null
  }
]

// 議題輸入型別
interface TopicInput {
  category: TopicCategory
  painPoint: string
  painDescription: string
  solution: string
  bookIds: string[]
  icon: string
  color: string
}

// Mock 議題資料
const MOCK_TOPICS: BookTopic[] = [
  {
    id: 'topic-1',
    category: 'career',
    painPoint: '工作好幾年了，但不知道下一步該怎麼走',
    painDescription: '每天上班重複做一樣的事，感覺技術成長停滯，想轉職又不知道該往哪個方向。看著同期的人都升遷或跳槽，自己卻還在原地踏步...',
    solution: '這些書能幫你釐清職涯方向、建立個人品牌，找到屬於自己的成長路徑。',
    bookIds: ['book-3', 'book-4'],
    icon: '🧭',
    color: 'from-blue-500 to-indigo-600',
    viewCount: 234,
    saveCount: 45,
    savedBy: ['mock-1', 'mock-2'],
    createdAt: { seconds: Date.now() / 1000 - 604800 },
    updatedAt: null
  },
  {
    id: 'topic-2',
    category: 'skills',
    painPoint: '程式碼越寫越亂，改 bug 改到懷疑人生',
    painDescription: '專案越來越大，程式碼變得難以維護。每次要加新功能就很痛苦，改一個地方壞三個地方。技術債越欠越多，不知道該怎麼還...',
    solution: '學習重構的藝術，讓你的程式碼從義大利麵變成優雅的架構。',
    bookIds: ['book-1', 'book-5'],
    icon: '🛠️',
    color: 'from-emerald-500 to-teal-600',
    viewCount: 189,
    saveCount: 67,
    savedBy: ['mock-1', 'mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 432000 },
    updatedAt: null
  },
  {
    id: 'topic-3',
    category: 'mindset',
    painPoint: '總是在意別人的眼光，不敢表達自己的想法',
    painDescription: '開會時有想法但不敢說，怕說錯被笑。主管交代的事就算不合理也不敢拒絕。每天活在別人的期待中，感覺很累...',
    solution: '這些書教你如何建立健康的心理邊界，活出自己的人生。',
    bookIds: ['book-6'],
    icon: '💭',
    color: 'from-purple-500 to-pink-600',
    viewCount: 312,
    saveCount: 89,
    savedBy: ['mock-1', 'mock-2', 'mock-5'],
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  },
  {
    id: 'topic-4',
    category: 'life',
    painPoint: '想養成好習慣，但總是三分鐘熱度',
    painDescription: '每次年初都立下雄心壯志，要運動、要學英文、要早睡。但過沒多久就放棄了。看著別人那麼自律，覺得自己很沒用...',
    solution: '別再靠意志力硬撐！這些書教你用科學方法輕鬆建立好習慣。',
    bookIds: ['book-2', 'book-4'],
    icon: '🎯',
    color: 'from-amber-500 to-orange-600',
    viewCount: 456,
    saveCount: 123,
    savedBy: ['mock-1', 'mock-2', 'mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'topic-5',
    category: 'skills',
    painPoint: '想深入學習 Vue.js，但官方文件看不懂',
    painDescription: '用 Vue 寫了一陣子，但總覺得只會表面功夫。想了解底層原理，但看原始碼又看不懂。面試被問到響應式原理就答不出來...',
    solution: '這本書帶你從零開始理解 Vue.js 的設計思想與實現細節。',
    bookIds: ['book-5'],
    icon: '💚',
    color: 'from-green-500 to-emerald-600',
    viewCount: 178,
    saveCount: 56,
    savedBy: ['mock-3', 'mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: null
  },
  {
    id: 'topic-6',
    category: 'leadership',
    painPoint: '剛升主管，不知道怎麼帶人',
    painDescription: '從工程師升到 Tech Lead，卻發現帶人比寫程式難多了。不知道怎麼分配任務、怎麼給 feedback、怎麼處理團隊衝突...',
    solution: '這些書幫助你從 IC 成功轉型為領導者，建立高效團隊。',
    bookIds: ['book-4', 'book-3'],
    icon: '👥',
    color: 'from-rose-500 to-red-600',
    viewCount: 145,
    saveCount: 34,
    savedBy: ['mock-4'],
    createdAt: { seconds: Date.now() / 1000 - 345600 },
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

  // 議題相關狀態
  const currentTopic: Ref<BookTopic | null> = ref(null)
  const localTopics: Ref<BookTopic[]> = ref([])

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

  // 議題列表 (依熱門程度排序)
  const topics: ComputedRef<BookTopic[]> = computed(() => {
    const allTopics = [...MOCK_TOPICS, ...localTopics.value]
    // 去重
    const uniqueTopics = allTopics.filter((topic, index, self) =>
      index === self.findIndex(t => t.id === topic.id)
    )
    return uniqueTopics.sort((a, b) => b.viewCount - a.viewCount)
  })

  // 熱門議題 (前 3 個)
  const hotTopics: ComputedRef<BookTopic[]> = computed(() => {
    return topics.value.slice(0, 3)
  })

  // 根據議題取得相關書籍
  const getBooksByTopic = (topic: BookTopic): Book[] => {
    return topic.bookIds
      .map(id => sortedBooks.value.find(b => b.id === id))
      .filter((book): book is Book => book !== undefined)
  }

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
    // 先從已載入的書籍中尋找 (包含 Mock 資料)
    const existingBook = sortedBooks.value.find(b => b.id === bookId)
    if (existingBook) {
      currentBook.value = existingBook
      return existingBook
    }

    if (MOCK_MODE) {
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

  // --- 載入議題 ---
  const loadTopic = (topicId: string): BookTopic | null => {
    const topic = MOCK_TOPICS.find(t => t.id === topicId)
    if (topic) {
      currentTopic.value = topic
      return topic
    }
    return null
  }

  // --- 收藏議題 ---
  const toggleTopicSave = (topicId: string): boolean => {
    if (!userId.value) return false

    const topic = [...MOCK_TOPICS, ...localTopics.value].find(t => t.id === topicId)
    if (topic) {
      const isSaved = topic.savedBy.includes(userId.value)
      if (isSaved) {
        topic.savedBy = topic.savedBy.filter(id => id !== userId.value)
        topic.saveCount--
      } else {
        topic.savedBy.push(userId.value)
        topic.saveCount++
      }
      return true
    }
    return false
  }

  // --- 檢查議題是否已收藏 ---
  const isTopicSaved = (topicId: string): boolean => {
    if (!userId.value) return false
    const topic = [...MOCK_TOPICS, ...localTopics.value].find(t => t.id === topicId)
    return topic?.savedBy.includes(userId.value) || false
  }

  // --- 新增議題 ---
  const createTopic = async (data: TopicInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newTopic: BookTopic = {
      id: `local-topic-${Date.now()}`,
      category: data.category,
      painPoint: data.painPoint,
      painDescription: data.painDescription,
      solution: data.solution,
      bookIds: data.bookIds,
      icon: data.icon,
      color: data.color,
      viewCount: 0,
      saveCount: 0,
      savedBy: [],
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localTopics.value = [newTopic, ...localTopics.value]
      return newTopic.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'bookTopics'),
        {
          ...data,
          viewCount: 0,
          saveCount: 0,
          savedBy: [],
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      return docRef.id
    } catch (error) {
      console.error('[Booklist] Create topic error:', error)
      return null
    }
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
    // 議題相關
    topics,
    hotTopics,
    currentTopic,
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
    getBookProgress,
    // 議題 Actions
    getBooksByTopic,
    loadTopic,
    toggleTopicSave,
    isTopicSaved,
    createTopic
  }
}
