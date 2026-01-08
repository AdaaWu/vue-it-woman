import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { MOCK_MODE, firebaseDb, appId } from '@/shared/services/firebase'
import type {
  MarketplaceItem, MarketplaceItemInput, MarketplaceComment, MarketplaceCommentInput,
  MarketplaceWishlist, MarketplaceCategory, ListingStatus, UserProfile
} from '@/types'

// Mock 資料
const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: 'item-1',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    title: 'MacBook Pro 13吋 2020 M1',
    description: '使用約一年半，電池循環次數約 150 次，外觀 9 成新，無明顯刮傷。附原廠充電器，可面交驗機。因為換了 16 吋所以出售。',
    category: 'electronics',
    condition: 'good',
    price: 28000,
    originalPrice: 42900,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'],
    tradeLocation: '捷運站面交',
    status: 'active',
    viewCount: 156,
    wishlistCount: 12,
    commentCount: 5,
    createdAt: { seconds: Date.now() / 1000 - 172800 },
    updatedAt: null
  },
  {
    id: 'item-2',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    title: '人體工學椅 Herman Miller Aeron',
    description: '在家工作必備！二手 Herman Miller Aeron 人體工學椅，B 尺寸適合 160-175 公分。使用約 2 年，功能正常，椅墊有些許使用痕跡。',
    category: 'furniture',
    condition: 'good',
    price: 18000,
    originalPrice: 45000,
    images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop'],
    tradeLocation: '台北車站',
    status: 'active',
    viewCount: 89,
    wishlistCount: 8,
    commentCount: 3,
    createdAt: { seconds: Date.now() / 1000 - 86400 },
    updatedAt: null
  },
  {
    id: 'item-3',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    title: '程式設計書籍一批（共 8 本）',
    description: '整理書櫃出清！包含：Clean Code、重構、設計模式、演算法導論等經典書籍。大部分 8-9 成新，可單買可整批。',
    category: 'books',
    condition: 'like-new',
    price: 1200,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop'],
    tradeLocation: '超商取貨',
    status: 'active',
    viewCount: 234,
    wishlistCount: 23,
    commentCount: 8,
    createdAt: { seconds: Date.now() / 1000 - 259200 },
    updatedAt: null
  },
  {
    id: 'item-4',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    title: 'Sony WH-1000XM4 藍牙耳機',
    description: '降噪耳機界的標竿！黑色款，購入約 8 個月，功能完好，附原廠收納盒和充電線。因為升級 XM5 故出售。',
    category: 'electronics',
    condition: 'like-new',
    price: 6500,
    originalPrice: 10900,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop'],
    tradeLocation: '公司附近',
    status: 'reserved',
    viewCount: 178,
    wishlistCount: 15,
    commentCount: 6,
    createdAt: { seconds: Date.now() / 1000 - 432000 },
    updatedAt: null
  },
  {
    id: 'item-5',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    title: 'Lululemon 瑜伽墊 + 瑜伽磚',
    description: '居家運動好夥伴！Lululemon 5mm 瑜伽墊（紫色）+ 兩塊瑜伽磚，使用次數不超過 10 次，幾乎全新。',
    category: 'sports',
    condition: 'like-new',
    price: 1800,
    originalPrice: 3200,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop'],
    tradeLocation: '捷運站面交',
    status: 'active',
    viewCount: 67,
    wishlistCount: 5,
    commentCount: 2,
    createdAt: { seconds: Date.now() / 1000 - 518400 },
    updatedAt: null
  }
]

const MOCK_COMMENTS: MarketplaceComment[] = [
  {
    id: 'comment-1',
    itemId: 'item-1',
    userId: 'mock-2',
    userName: '科技小白',
    userRole: 'Fullstack',
    content: '請問可以議價嗎？27000 可以嗎？',
    isSellerReply: false,
    createdAt: { seconds: Date.now() / 1000 - 86400 }
  },
  {
    id: 'comment-2',
    itemId: 'item-1',
    userId: 'mock-1',
    userName: 'Sophia',
    userRole: 'Frontend Dev',
    content: '不好意思，這個價格已經很實惠了，不議價喔～',
    isSellerReply: true,
    parentId: 'comment-1',
    createdAt: { seconds: Date.now() / 1000 - 82800 }
  },
  {
    id: 'comment-3',
    itemId: 'item-1',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    content: '請問還有在賣嗎？想約這週末看貨',
    isSellerReply: false,
    createdAt: { seconds: Date.now() / 1000 - 43200 }
  },
  {
    id: 'comment-4',
    itemId: 'item-3',
    userId: 'mock-4',
    userName: 'Emily',
    userRole: 'Engineering Manager',
    content: '請問 Clean Code 可以單買嗎？',
    isSellerReply: false,
    createdAt: { seconds: Date.now() / 1000 - 172800 }
  },
  {
    id: 'comment-5',
    itemId: 'item-3',
    userId: 'mock-3',
    userName: '職場小菜鳥',
    userRole: 'QA Engineer',
    content: '可以喔！單買 250 元，私訊我約時間',
    isSellerReply: true,
    parentId: 'comment-4',
    createdAt: { seconds: Date.now() / 1000 - 169200 }
  }
]

export function useMarketplace(
  userId: Ref<string | null>,
  userProfile: Ref<UserProfile | null>
) {
  // --- State ---
  const items: Ref<MarketplaceItem[]> = ref([])
  const currentItem: Ref<MarketplaceItem | null> = ref(null)
  const comments: Ref<MarketplaceComment[]> = ref([])
  const myWishlist: Ref<MarketplaceWishlist[]> = ref([])
  const isLoading: Ref<boolean> = ref(false)
  const localItems: Ref<MarketplaceItem[]> = ref([])
  const localComments: Ref<MarketplaceComment[]> = ref([])
  const localWishlist: Ref<MarketplaceWishlist[]> = ref([])
  const filterCategory: Ref<MarketplaceCategory | 'all'> = ref('all')
  const filterStatus: Ref<ListingStatus | 'all'> = ref('all')
  const searchKeyword: Ref<string> = ref('')

  // --- Computed ---
  const allItems: ComputedRef<MarketplaceItem[]> = computed(() => {
    const combined = [...MOCK_ITEMS, ...localItems.value, ...items.value]
    // 去重
    return combined.filter((item, index, self) =>
      index === self.findIndex(i => i.id === item.id)
    )
  })

  // 篩選後的商品列表
  const filteredItems: ComputedRef<MarketplaceItem[]> = computed(() => {
    let result = allItems.value

    // 分類篩選
    if (filterCategory.value !== 'all') {
      result = result.filter(item => item.category === filterCategory.value)
    }

    // 狀態篩選
    if (filterStatus.value !== 'all') {
      result = result.filter(item => item.status === filterStatus.value)
    }

    // 關鍵字搜尋
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    }

    // 依時間排序（最新在前）
    return result.sort((a, b) => {
      const t1 = a.createdAt?.seconds || 0
      const t2 = b.createdAt?.seconds || 0
      return t2 - t1
    })
  })

  // 只顯示販售中的商品
  const activeItems: ComputedRef<MarketplaceItem[]> = computed(() => {
    return filteredItems.value.filter(item => item.status === 'active')
  })

  // 我的刊登
  const myListings: ComputedRef<MarketplaceItem[]> = computed(() => {
    if (!userId.value) return []
    return allItems.value
      .filter(item => item.userId === userId.value)
      .sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0
        const t2 = b.createdAt?.seconds || 0
        return t2 - t1
      })
  })

  // 我的收藏
  const wishlistItems: ComputedRef<MarketplaceItem[]> = computed(() => {
    const wishlistIds = [...localWishlist.value, ...myWishlist.value].map(w => w.itemId)
    return allItems.value.filter(item => wishlistIds.includes(item.id))
  })

  // --- 載入商品列表 ---
  const loadItems = async (category?: MarketplaceCategory): Promise<void> => {
    if (MOCK_MODE) {
      if (category) {
        filterCategory.value = category
      }
      return
    }

    if (!firebaseDb.value) return

    try {
      isLoading.value = true
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')

      let q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems'),
        orderBy('createdAt', 'desc')
      )

      if (category) {
        q = query(
          collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems'),
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarketplaceItem))
    } catch (error) {
      console.error('[Marketplace] Load items error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // --- 載入單一商品 ---
  const loadItem = async (itemId: string): Promise<MarketplaceItem | null> => {
    // 先從本地 mock 資料和 local 資料中找
    const localItem = [...MOCK_ITEMS, ...localItems.value].find(i => i.id === itemId)
    if (localItem) {
      currentItem.value = localItem
      localItem.viewCount++
      return localItem
    }

    // Mock 模式下如果找不到就返回 null
    if (MOCK_MODE) {
      return null
    }

    // Firebase 模式下嘗試從資料庫讀取
    if (!firebaseDb.value) return null

    try {
      const { doc, getDoc, updateDoc, increment } = await import('firebase/firestore')
      const itemRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems', itemId)
      const snapshot = await getDoc(itemRef)

      if (snapshot.exists()) {
        // 增加瀏覽次數
        await updateDoc(itemRef, { viewCount: increment(1) })

        const item = { id: snapshot.id, ...snapshot.data() } as MarketplaceItem
        item.viewCount++
        currentItem.value = item
        return item
      }
      return null
    } catch (error) {
      console.error('[Marketplace] Load item error:', error)
      return null
    }
  }

  // --- 刊登商品 ---
  const createItem = async (data: MarketplaceItemInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const newItem: MarketplaceItem = {
      id: `local-item-${Date.now()}`,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      price: data.price,
      originalPrice: data.originalPrice,
      images: data.images,
      tradeLocation: data.tradeLocation,
      status: 'active',
      viewCount: 0,
      wishlistCount: 0,
      commentCount: 0,
      createdAt: { seconds: Date.now() / 1000 },
      updatedAt: null
    }

    if (MOCK_MODE) {
      localItems.value = [newItem, ...localItems.value]
      return newItem.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems'),
        {
          ...data,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          status: 'active',
          viewCount: 0,
          wishlistCount: 0,
          commentCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: null
        }
      )

      await loadItems()
      return docRef.id
    } catch (error) {
      console.error('[Marketplace] Create item error:', error)
      return null
    }
  }

  // --- 更新商品 ---
  const updateItem = async (itemId: string, data: Partial<MarketplaceItemInput>): Promise<boolean> => {
    if (!userId.value) return false

    if (MOCK_MODE) {
      const item = [...MOCK_ITEMS, ...localItems.value].find(i => i.id === itemId)
      if (item && item.userId === userId.value) {
        Object.assign(item, data, { updatedAt: { seconds: Date.now() / 1000 } })
        return true
      }
      return false
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const itemRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems', itemId)

      await updateDoc(itemRef, {
        ...data,
        updatedAt: serverTimestamp()
      })

      await loadItems()
      return true
    } catch (error) {
      console.error('[Marketplace] Update item error:', error)
      return false
    }
  }

  // --- 更新商品狀態 ---
  const updateItemStatus = async (itemId: string, status: ListingStatus): Promise<boolean> => {
    if (!userId.value) return false

    if (MOCK_MODE) {
      const item = [...MOCK_ITEMS, ...localItems.value].find(i => i.id === itemId)
      if (item && item.userId === userId.value) {
        item.status = status
        item.updatedAt = { seconds: Date.now() / 1000 }
        return true
      }
      return false
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const itemRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems', itemId)

      await updateDoc(itemRef, {
        status,
        updatedAt: serverTimestamp()
      })

      if (currentItem.value?.id === itemId) {
        currentItem.value.status = status
      }
      return true
    } catch (error) {
      console.error('[Marketplace] Update item status error:', error)
      return false
    }
  }

  // --- 載入留言 ---
  const loadComments = async (itemId: string): Promise<void> => {
    if (MOCK_MODE) {
      comments.value = [...MOCK_COMMENTS, ...localComments.value]
        .filter(c => c.itemId === itemId)
        .sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0
          const t2 = b.createdAt?.seconds || 0
          return t1 - t2 // 時間順序（舊的在前）
        })
      return
    }

    if (!firebaseDb.value) return

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')

      // 不使用 orderBy 避免需要複合索引，改在前端排序
      const q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceComments'),
        where('itemId', '==', itemId)
      )

      const snapshot = await getDocs(q)
      const loadedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarketplaceComment))

      // 前端排序
      comments.value = loadedComments.sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0
        const t2 = b.createdAt?.seconds || 0
        return t1 - t2
      })
    } catch (error) {
      console.error('[Marketplace] Load comments error:', error)
    }
  }

  // --- 新增留言 ---
  const addComment = async (data: MarketplaceCommentInput): Promise<string | null> => {
    if (!userId.value || !userProfile.value) return null

    const item = allItems.value.find(i => i.id === data.itemId)
    if (!item) return null

    const newComment: MarketplaceComment = {
      id: `local-comment-${Date.now()}`,
      itemId: data.itemId,
      userId: userId.value,
      userName: userProfile.value.nickname,
      userRole: userProfile.value.role,
      content: data.content,
      isSellerReply: item.userId === userId.value,
      parentId: data.parentId,
      createdAt: { seconds: Date.now() / 1000 }
    }

    if (MOCK_MODE) {
      localComments.value = [...localComments.value, newComment]
      // 更新留言數
      item.commentCount++
      await loadComments(data.itemId)
      return newComment.id
    }

    if (!firebaseDb.value) return null

    try {
      const { collection, addDoc, doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')

      const docRef = await addDoc(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceComments'),
        {
          itemId: data.itemId,
          userId: userId.value,
          userName: userProfile.value.nickname,
          userRole: userProfile.value.role,
          content: data.content,
          isSellerReply: item.userId === userId.value,
          parentId: data.parentId || null,
          createdAt: serverTimestamp()
        }
      )

      // 更新留言計數
      const itemRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems', data.itemId)
      await updateDoc(itemRef, { commentCount: increment(1) })

      await loadComments(data.itemId)
      return docRef.id
    } catch (error) {
      console.error('[Marketplace] Add comment error:', error)
      return null
    }
  }

  // --- 收藏/取消收藏 ---
  const toggleWishlist = async (itemId: string): Promise<boolean> => {
    if (!userId.value) return false

    const existingWishlist = [...localWishlist.value, ...myWishlist.value].find(
      w => w.itemId === itemId && w.userId === userId.value
    )

    if (MOCK_MODE) {
      const item = allItems.value.find(i => i.id === itemId)
      if (!item) return false

      if (existingWishlist) {
        // 移除收藏
        localWishlist.value = localWishlist.value.filter(w => w.id !== existingWishlist.id)
        item.wishlistCount = Math.max(0, item.wishlistCount - 1)
      } else {
        // 新增收藏
        const newWishlist: MarketplaceWishlist = {
          id: `local-wishlist-${Date.now()}`,
          userId: userId.value,
          itemId,
          createdAt: { seconds: Date.now() / 1000 }
        }
        localWishlist.value = [...localWishlist.value, newWishlist]
        item.wishlistCount++
      }
      return true
    }

    if (!firebaseDb.value) return false

    try {
      const { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')

      const wishlistId = `${userId.value}_${itemId}`
      const wishlistRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceWishlist', wishlistId)
      const itemRef = doc(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceItems', itemId)

      if (existingWishlist) {
        await deleteDoc(wishlistRef)
        await updateDoc(itemRef, { wishlistCount: increment(-1) })
      } else {
        await setDoc(wishlistRef, {
          userId: userId.value,
          itemId,
          createdAt: serverTimestamp()
        })
        await updateDoc(itemRef, { wishlistCount: increment(1) })
      }

      await loadMyWishlist()
      return true
    } catch (error) {
      console.error('[Marketplace] Toggle wishlist error:', error)
      return false
    }
  }

  // --- 載入我的收藏 ---
  const loadMyWishlist = async (): Promise<void> => {
    if (!userId.value) return

    if (MOCK_MODE) {
      return // Mock 模式下從 localWishlist 讀取
    }

    if (!firebaseDb.value) return

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')

      const q = query(
        collection(firebaseDb.value, 'artifacts', appId, 'public', 'data', 'marketplaceWishlist'),
        where('userId', '==', userId.value)
      )

      const snapshot = await getDocs(q)
      myWishlist.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarketplaceWishlist))
    } catch (error) {
      console.error('[Marketplace] Load my wishlist error:', error)
    }
  }

  // --- 檢查是否已收藏 ---
  const isInWishlist = (itemId: string): boolean => {
    if (!userId.value) return false
    return [...localWishlist.value, ...myWishlist.value].some(
      w => w.itemId === itemId && w.userId === userId.value
    )
  }

  // --- 設定篩選條件 ---
  const setFilter = (category: MarketplaceCategory | 'all', status: ListingStatus | 'all' = 'all') => {
    filterCategory.value = category
    filterStatus.value = status
  }

  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  return {
    // State
    items: filteredItems,
    activeItems,
    myListings,
    wishlistItems,
    currentItem,
    comments,
    isLoading,
    filterCategory,
    filterStatus,
    searchKeyword,
    // Actions
    loadItems,
    loadItem,
    createItem,
    updateItem,
    updateItemStatus,
    loadComments,
    addComment,
    toggleWishlist,
    loadMyWishlist,
    isInWishlist,
    setFilter,
    setSearchKeyword
  }
}
