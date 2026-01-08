<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  BookOpen, Plus, Search, TrendingUp, Star, BookMarked,
  LayoutGrid, Filter, Trophy, Lightbulb, ArrowRight, Sparkles
} from 'lucide-vue-next'
import BookCard from '../components/BookCard.vue'
import BookEditor from '../components/BookEditor.vue'
import BookDetailModal from '../components/BookDetailModal.vue'
import TopicCard from '../components/TopicCard.vue'
import TopicDetailModal from '../components/TopicDetailModal.vue'
import TopicEditor from '../components/TopicEditor.vue'
import { useBooklist } from '../composables/useBooklist'
import type { Book, BookInput, BookReviewInput, BookCategory, ReadingStatus, UserProfile, BookShare, BookTopic, TopicCategory } from '@/types'
import { BOOK_CATEGORY_LABELS, READING_BADGE_LABELS, TOPIC_CATEGORY_LABELS } from '@/types'

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
  topics,
  hotTopics,
  currentTopic,
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
  getBooksByTopic,
  loadTopic,
  toggleTopicSave,
  isTopicSaved,
  createTopic
} = useBooklist(
  computed(() => props.userId),
  computed(() => props.userProfile)
)

// 頁面狀態
const currentPage = ref<'home' | 'topics' | 'books' | 'my-list'>('home')
const showEditor = ref(false)
const showTopicEditor = ref(false)
const showBookDetail = ref(false)
const showTopicDetail = ref(false)

// 書籍列表篩選
const searchQuery = ref('')
const selectedCategory = ref<BookCategory | 'all'>('all')
const sortBy = ref<'latest' | 'rating' | 'popular'>('latest')

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

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(book => book.category === selectedCategory.value)
  }

  switch (sortBy.value) {
    case 'rating':
      result = [...result].sort((a, b) => b.avgRating - a.avgRating)
      break
    case 'popular':
      result = [...result].sort((a, b) =>
        (b.finishedCount + b.readingCount) - (a.finishedCount + a.readingCount)
      )
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

// 獲得的徽章
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
  showBookDetail.value = true
}

// 開啟議題詳情
const openTopicDetail = (topic: BookTopic) => {
  loadTopic(topic.id)
  showTopicDetail.value = true
}

// 從議題選擇書籍
const handleSelectBookFromTopic = async (book: Book) => {
  showTopicDetail.value = false
  await openBookDetail(book)
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

// 收藏議題
const handleToggleTopicSave = (topicId: string) => {
  toggleTopicSave(topicId)
}

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

// 新增議題
const handleCreateTopic = async (data: TopicInput) => {
  const id = await createTopic(data)
  if (id) {
    showTopicEditor.value = false
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

        <!-- ===== 首頁 (議題導向) ===== -->
        <template v-if="currentPage === 'home'">
          <!-- 標題區塊 -->
          <div class="text-center mb-8">
            <h1
              :class="[
                'text-3xl font-bold mb-3',
                darkMode ? 'text-white' : 'text-slate-800'
              ]"
            >
              <span class="inline-flex items-center gap-3">
                <Sparkles :class="['w-8 h-8', darkMode ? 'text-fuchsia-400' : 'text-fuchsia-500']" />
                你遇到了什麼問題？
              </span>
            </h1>
            <p :class="['text-lg', darkMode ? 'text-slate-400' : 'text-slate-500']">
              找到痛點，用書本找到解答
            </p>
          </div>

          <!-- 熱門議題 -->
          <section class="mb-10">
            <div class="flex items-center justify-between mb-4">
              <h2 :class="['text-xl font-bold flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
                <TrendingUp class="w-5 h-5 text-fuchsia-500" />
                熱門議題
              </h2>
              <button
                :class="[
                  'flex items-center gap-1 text-sm font-medium transition-colors',
                  darkMode ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-fuchsia-600 hover:text-fuchsia-500'
                ]"
                @click="currentPage = 'topics'"
              >
                查看全部
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TopicCard
                v-for="topic in hotTopics"
                :key="topic.id"
                :topic="topic"
                :books="getBooksByTopic(topic)"
                compact
                @click="openTopicDetail(topic)"
              />
            </div>
          </section>

          <!-- 全部議題列表 -->
          <section class="mb-10">
            <div class="flex items-center justify-between mb-4">
              <h2 :class="['text-xl font-bold flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
                <Lightbulb class="w-5 h-5 text-amber-500" />
                探索議題
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TopicCard
                v-for="topic in topics"
                :key="topic.id"
                :topic="topic"
                :books="getBooksByTopic(topic)"
                :is-saved="isTopicSaved(topic.id)"
                :dark-mode="darkMode"
                @click="openTopicDetail(topic)"
                @save="handleToggleTopicSave(topic.id)"
              />
            </div>
          </section>

          <!-- 快速導航 -->
          <section>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                :class="[
                  'p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-fuchsia-500/50'
                    : 'bg-white border-slate-200 hover:border-fuchsia-300'
                ]"
                @click="currentPage = 'books'"
              >
                <BookOpen :class="['w-8 h-8 mx-auto mb-2', darkMode ? 'text-fuchsia-400' : 'text-fuchsia-500']" />
                <p :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">全部書籍</p>
                <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">{{ books.length }} 本</p>
              </button>

              <button
                :class="[
                  'p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-fuchsia-500/50'
                    : 'bg-white border-slate-200 hover:border-fuchsia-300'
                ]"
                @click="currentPage = 'topics'"
              >
                <Lightbulb :class="['w-8 h-8 mx-auto mb-2', darkMode ? 'text-amber-400' : 'text-amber-500']" />
                <p :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">議題專欄</p>
                <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">{{ topics.length }} 個議題</p>
              </button>

              <button
                v-if="userId"
                :class="[
                  'p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-fuchsia-500/50'
                    : 'bg-white border-slate-200 hover:border-fuchsia-300'
                ]"
                @click="currentPage = 'my-list'"
              >
                <BookMarked :class="['w-8 h-8 mx-auto mb-2', darkMode ? 'text-green-400' : 'text-green-500']" />
                <p :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">我的書單</p>
                <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">{{ myBooklist.length }} 本</p>
              </button>

              <button
                :class="[
                  'p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                  'bg-gradient-to-br from-fuchsia-500 to-pink-500 border-transparent text-white'
                ]"
                @click="showEditor = true"
              >
                <Plus class="w-8 h-8 mx-auto mb-2" />
                <p class="font-medium">推薦好書</p>
                <p class="text-sm text-white/80">分享給大家</p>
              </button>
            </div>
          </section>
        </template>

        <!-- ===== 議題列表頁 ===== -->
        <template v-else-if="currentPage === 'topics'">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <button
                :class="[
                  'p-2 rounded-lg transition-colors',
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                ]"
                @click="currentPage = 'home'"
              >
                <ArrowRight :class="['w-5 h-5 rotate-180', darkMode ? 'text-slate-400' : 'text-slate-500']" />
              </button>
              <h1 :class="['text-2xl font-bold', darkMode ? 'text-white' : 'text-slate-800']">
                議題專欄
              </h1>
            </div>

            <button
              v-if="userId"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                'hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5'
              ]"
              @click="showTopicEditor = true"
            >
              <Plus class="w-5 h-5" />
              新增議題
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopicCard
              v-for="topic in topics"
              :key="topic.id"
              :topic="topic"
              :books="getBooksByTopic(topic)"
              :is-saved="isTopicSaved(topic.id)"
              :dark-mode="darkMode"
              @click="openTopicDetail(topic)"
              @save="handleToggleTopicSave(topic.id)"
            />
          </div>
        </template>

        <!-- ===== 書籍列表頁 ===== -->
        <template v-else-if="currentPage === 'books'">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <button
                :class="[
                  'p-2 rounded-lg transition-colors',
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                ]"
                @click="currentPage = 'home'"
              >
                <ArrowRight :class="['w-5 h-5 rotate-180', darkMode ? 'text-slate-400' : 'text-slate-500']" />
              </button>
              <h1 :class="['text-2xl font-bold', darkMode ? 'text-white' : 'text-slate-800']">
                全部書籍
              </h1>
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

          <!-- 搜尋與篩選 -->
          <div class="flex flex-wrap items-center gap-4 mb-6">
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
              @share="() => shareBook(book.id, 'copy-link')"
            />
          </div>

          <div
            v-else
            :class="['text-center py-16', darkMode ? 'text-slate-500' : 'text-slate-400']"
          >
            <BookOpen class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg">找不到符合條件的書籍</p>
          </div>
        </template>

        <!-- ===== 我的書單頁 ===== -->
        <template v-else-if="currentPage === 'my-list'">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <button
                :class="[
                  'p-2 rounded-lg transition-colors',
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                ]"
                @click="currentPage = 'home'"
              >
                <ArrowRight :class="['w-5 h-5 rotate-180', darkMode ? 'text-slate-400' : 'text-slate-500']" />
              </button>
              <h1 :class="['text-2xl font-bold', darkMode ? 'text-white' : 'text-slate-800']">
                我的書單
              </h1>
            </div>
          </div>

          <!-- 閱讀統計 -->
          <div
            v-if="myBooklist.length > 0"
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
                    閱讀進度
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

          <!-- 書籍列表 -->
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

          <div
            v-else
            :class="['text-center py-16', darkMode ? 'text-slate-500' : 'text-slate-400']"
          >
            <BookMarked class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-lg">你的書單還是空的</p>
            <p class="mt-2">瀏覽書籍並加入你想讀的書吧！</p>
            <button
              :class="[
                'mt-4 px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-fuchsia-500 text-white hover:bg-fuchsia-600'
              ]"
              @click="currentPage = 'books'"
            >
              探索書籍
            </button>
          </div>
        </template>

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
      v-if="showBookDetail && currentBook"
      :book="currentBook"
      :reviews="reviews"
      :progress="getBookProgress(currentBook.id)"
      :user-id="userId"
      :dark-mode="darkMode"
      @close="showBookDetail = false"
      @add-review="handleAddReview"
      @toggle-review-like="toggleReviewLike"
      @update-progress="handleUpdateProgress"
      @share="handleShare"
    />

    <!-- 議題詳情彈窗 -->
    <TopicDetailModal
      v-if="showTopicDetail && currentTopic"
      :topic="currentTopic"
      :books="getBooksByTopic(currentTopic)"
      :is-saved="isTopicSaved(currentTopic.id)"
      :dark-mode="darkMode"
      :get-book-progress="getBookProgress"
      @close="showTopicDetail = false"
      @save="handleToggleTopicSave(currentTopic.id)"
      @select-book="handleSelectBookFromTopic"
    />

    <!-- 新增議題彈窗 -->
    <TopicEditor
      v-if="showTopicEditor"
      :dark-mode="darkMode"
      :books="books"
      @close="showTopicEditor = false"
      @submit="handleCreateTopic"
    />
  </div>
</template>
