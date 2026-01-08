<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  BookOpen, Plus, Search, TrendingUp, Star, BookMarked,
  LayoutGrid, List, Filter, Trophy, Award
} from 'lucide-vue-next'
import BookCard from '../components/BookCard.vue'
import BookEditor from '../components/BookEditor.vue'
import BookDetailModal from '../components/BookDetailModal.vue'
import { useBooklist } from '../composables/useBooklist'
import type { Book, BookInput, BookReviewInput, BookCategory, ReadingStatus, UserProfile, BookShare } from '@/types'
import { BOOK_CATEGORY_LABELS, READING_BADGE_LABELS } from '@/types'

interface Props {
  userId: string | null
  userProfile: UserProfile | null
  darkMode?: boolean
}

const props = defineProps<Props>()

// 使用 composable
const {
  books,
  topRatedBooks,
  popularBooks,
  myBooklist,
  currentBook,
  reviews,
  isLoading,
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
} = useBooklist(
  computed(() => props.userId),
  computed(() => props.userProfile)
)

// 狀態
const showEditor = ref(false)
const showDetail = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<BookCategory | 'all'>('all')
const sortBy = ref<'latest' | 'rating' | 'popular'>('latest')
const viewMode = ref<'grid' | 'list'>('grid')
const activeTab = ref<'all' | 'my-list'>('all')

// 分類選項
const categories: { value: BookCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  ...Object.entries(BOOK_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as BookCategory,
    label
  }))
]

// 過濾與排序後的書籍
const filteredBooks = computed(() => {
  let result = [...books.value]

  // 搜尋過濾
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 分類過濾
  if (selectedCategory.value !== 'all') {
    result = result.filter(book => book.category === selectedCategory.value)
  }

  // 排序
  switch (sortBy.value) {
    case 'rating':
      result = [...result].sort((a, b) => b.avgRating - a.avgRating)
      break
    case 'popular':
      result = [...result].sort((a, b) =>
        (b.finishedCount + b.readingCount) - (a.finishedCount + a.readingCount)
      )
      break
    default:
      // latest - 已在 sortedBooks 中排序
      break
  }

  return result
})

// 我的閱讀統計
const myStats = computed(() => {
  const list = myBooklist.value
  return {
    total: list.length,
    wantToRead: list.filter(i => i.progress.status === 'want-to-read').length,
    reading: list.filter(i => i.progress.status === 'reading').length,
    finished: list.filter(i => i.progress.status === 'finished').length
  }
})

// 獲得的徽章 (簡單版本)
const earnedBadges = computed(() => {
  const badges: (keyof typeof READING_BADGE_LABELS)[] = []
  if (myStats.value.finished >= 1) badges.push('first-book')
  if (myStats.value.finished >= 10) badges.push('bookworm-10')
  if (myStats.value.finished >= 50) badges.push('bookworm-50')
  return badges
})

// 開啟書籍詳情
const openBookDetail = async (book: Book) => {
  await loadBook(book.id)
  await loadReviews(book.id)
  showDetail.value = true
}

// 新增書籍
const handleCreateBook = async (data: BookInput) => {
  const id = await createBook(data)
  if (id) {
    showEditor.value = false
  }
}

// 新增書評
const handleAddReview = async (data: BookReviewInput) => {
  await addReview(data)
}

// 更新閱讀進度
const handleUpdateProgress = async (status: ReadingStatus) => {
  if (currentBook.value) {
    await updateProgress(currentBook.value.id, status)
  }
}

// 分享書籍
const handleShare = async (platform: BookShare['platform']) => {
  if (currentBook.value) {
    await shareBook(currentBook.value.id, platform)
  }
}

// 載入資料
onMounted(() => {
  loadBooks()
  if (props.userId) {
    loadMyProgress()
  }
})

watch(() => props.userId, (newUserId) => {
  if (newUserId) {
    loadMyProgress()
  }
})
</script>

<template>
  <div :class="['flex-1 overflow-hidden', darkMode ? 'bg-slate-900' : 'bg-slate-50']">
    <div class="h-full overflow-y-auto">
      <div class="max-w-6xl mx-auto p-6">
        <!-- 標題區塊 -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1
              :class="[
                'text-2xl font-bold flex items-center gap-3',
                darkMode ? 'text-white' : 'text-slate-800'
              ]"
            >
              <div
                :class="[
                  'p-2 rounded-xl',
                  darkMode ? 'bg-fuchsia-900/30' : 'bg-fuchsia-100'
                ]"
              >
                <BookOpen :class="['w-6 h-6', darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600']" />
              </div>
              社群書單
            </h1>
            <p :class="['mt-1', darkMode ? 'text-slate-400' : 'text-slate-500']">
              一起讀書、分享心得、共同成長
            </p>
          </div>

          <button
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
              'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white',
              'hover:shadow-lg hover:shadow-fuchsia-500/25 hover:-translate-y-0.5'
            ]"
            @click="showEditor = true"
          >
            <Plus class="w-5 h-5" />
            推薦好書
          </button>
        </div>

        <!-- 我的閱讀統計 (已登入時顯示) -->
        <div
          v-if="userId && myBooklist.length > 0"
          :class="[
            'p-4 rounded-xl mb-6',
            darkMode ? 'bg-slate-800' : 'bg-white border border-slate-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <Trophy :class="['w-5 h-5', darkMode ? 'text-amber-400' : 'text-amber-500']" />
                <span :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">
                  我的閱讀進度
                </span>
              </div>

              <div class="flex items-center gap-4 text-sm">
                <div :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                  <span class="font-bold text-blue-500">{{ myStats.wantToRead }}</span> 想讀
                </div>
                <div :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                  <span class="font-bold text-amber-500">{{ myStats.reading }}</span> 閱讀中
                </div>
                <div :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
                  <span class="font-bold text-green-500">{{ myStats.finished }}</span> 已讀完
                </div>
              </div>
            </div>

            <!-- 徽章 -->
            <div v-if="earnedBadges.length > 0" class="flex items-center gap-2">
              <span
                v-for="badge in earnedBadges"
                :key="badge"
                :title="READING_BADGE_LABELS[badge].desc"
                class="text-xl cursor-help"
              >
                {{ READING_BADGE_LABELS[badge].icon }}
              </span>
            </div>
          </div>
        </div>

        <!-- 頁籤 -->
        <div
          :class="[
            'flex items-center gap-4 mb-6 pb-4 border-b',
            darkMode ? 'border-slate-700' : 'border-slate-200'
          ]"
        >
          <button
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'all'
                ? 'bg-fuchsia-500 text-white'
                : darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            ]"
            @click="activeTab = 'all'"
          >
            <LayoutGrid class="w-4 h-4" />
            全部書籍
          </button>

          <button
            v-if="userId"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'my-list'
                ? 'bg-fuchsia-500 text-white'
                : darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            ]"
            @click="activeTab = 'my-list'"
          >
            <BookMarked class="w-4 h-4" />
            我的書單
            <span
              v-if="myBooklist.length > 0"
              :class="[
                'px-1.5 py-0.5 rounded-full text-xs',
                activeTab === 'my-list'
                  ? 'bg-white/20 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-200 text-slate-600'
              ]"
            >
              {{ myBooklist.length }}
            </span>
          </button>
        </div>

        <!-- 搜尋與篩選 (全部書籍頁籤) -->
        <div v-if="activeTab === 'all'" class="flex flex-wrap items-center gap-4 mb-6">
          <!-- 搜尋框 -->
          <div class="relative flex-1 min-w-[200px] max-w-md">
            <Search
              :class="[
                'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5',
                darkMode ? 'text-slate-500' : 'text-slate-400'
              ]"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋書名、作者或標籤..."
              :class="[
                'w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
              ]"
            />
          </div>

          <!-- 分類篩選 -->
          <div class="flex items-center gap-2">
            <Filter :class="['w-4 h-4', darkMode ? 'text-slate-500' : 'text-slate-400']" />
            <select
              v-model="selectedCategory"
              :class="[
                'px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500',
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              ]"
            >
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <!-- 排序 -->
          <div class="flex items-center gap-2">
            <button
              v-for="option in [
                { value: 'latest', label: '最新', icon: BookOpen },
                { value: 'rating', label: '評分', icon: Star },
                { value: 'popular', label: '熱門', icon: TrendingUp }
              ]"
              :key="option.value"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                sortBy === option.value
                  ? darkMode
                    ? 'bg-fuchsia-900/30 text-fuchsia-400'
                    : 'bg-fuchsia-100 text-fuchsia-700'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-500 hover:bg-slate-100'
              ]"
              @click="sortBy = option.value as 'latest' | 'rating' | 'popular'"
            >
              <component :is="option.icon" class="w-4 h-4" />
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- 書籍列表 -->
        <div v-if="activeTab === 'all'">
          <div
            v-if="filteredBooks.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <BookCard
              v-for="book in filteredBooks"
              :key="book.id"
              :book="book"
              :progress="getBookProgress(book.id)"
              :dark-mode="darkMode"
              @click="openBookDetail(book)"
              @share="() => { currentBook = book; shareBook(book.id, 'copy-link') }"
            />
          </div>

          <!-- 無結果 -->
          <div
            v-else
            :class="[
              'text-center py-16',
              darkMode ? 'text-slate-500' : 'text-slate-400'
            ]"
          >
            <BookOpen class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg">找不到符合條件的書籍</p>
            <p class="mt-2">試試其他關鍵字或分類</p>
          </div>
        </div>

        <!-- 我的書單 -->
        <div v-else-if="activeTab === 'my-list'">
          <div
            v-if="myBooklist.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <BookCard
              v-for="item in myBooklist"
              :key="item.book.id"
              :book="item.book"
              :progress="item.progress"
              :dark-mode="darkMode"
              @click="openBookDetail(item.book)"
              @share="() => shareBook(item.book.id, 'copy-link')"
            />
          </div>

          <!-- 空書單 -->
          <div
            v-else
            :class="[
              'text-center py-16',
              darkMode ? 'text-slate-500' : 'text-slate-400'
            ]"
          >
            <BookMarked class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg">你的書單還是空的</p>
            <p class="mt-2">瀏覽書籍並加入你想讀的書吧！</p>
            <button
              :class="[
                'mt-4 px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
              ]"
              @click="activeTab = 'all'"
            >
              探索書籍
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增書籍彈窗 -->
    <BookEditor
      v-if="showEditor"
      :dark-mode="darkMode"
      @close="showEditor = false"
      @submit="handleCreateBook"
    />

    <!-- 書籍詳情彈窗 -->
    <BookDetailModal
      v-if="showDetail && currentBook"
      :book="currentBook"
      :reviews="reviews"
      :progress="getBookProgress(currentBook.id)"
      :user-id="userId"
      :dark-mode="darkMode"
      @close="showDetail = false"
      @add-review="handleAddReview"
      @toggle-review-like="toggleReviewLike"
      @update-progress="handleUpdateProgress"
      @share="handleShare"
    />
  </div>
</template>
