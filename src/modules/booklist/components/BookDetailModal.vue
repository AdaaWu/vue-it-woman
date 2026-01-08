<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X, BookOpen, Users, Share2, Heart, MessageSquare, Send,
  BookmarkPlus, BookmarkCheck, Clock, CheckCircle, Copy, Twitter
} from 'lucide-vue-next'
import StarRating from './StarRating.vue'
import type { Book, BookReview, BookReviewInput, ReadingStatus, UserBookProgress, BookShare } from '@/types'
import { BOOK_CATEGORY_LABELS, READING_STATUS_LABELS } from '@/types'

interface Props {
  book: Book
  reviews: BookReview[]
  progress?: UserBookProgress
  userId: string | null
  darkMode?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  addReview: [data: BookReviewInput]
  toggleReviewLike: [reviewId: string]
  updateProgress: [status: ReadingStatus]
  share: [platform: BookShare['platform']]
}>()

// 書評表單
const myRating = ref(0)
const myReview = ref('')
const myStatus = ref<ReadingStatus>('want-to-read')
const showReviewForm = ref(false)
const showShareMenu = ref(false)

// 計算
const categoryLabel = computed(() => BOOK_CATEGORY_LABELS[props.book.category])
const totalReaders = computed(() =>
  props.book.wantToReadCount + props.book.readingCount + props.book.finishedCount
)

const myExistingReview = computed(() =>
  props.reviews.find(r => r.userId === props.userId)
)

const canReview = computed(() =>
  props.userId && !myExistingReview.value && myRating.value > 0 && myReview.value.trim()
)

// 進度狀態選項
const progressOptions: { status: ReadingStatus; label: string; icon: typeof BookmarkPlus }[] = [
  { status: 'want-to-read', label: '想讀', icon: BookmarkPlus },
  { status: 'reading', label: '閱讀中', icon: Clock },
  { status: 'finished', label: '已讀完', icon: CheckCircle }
]

// 分享選項
const shareOptions: { platform: BookShare['platform']; label: string; icon: typeof Copy }[] = [
  { platform: 'copy-link', label: '複製連結', icon: Copy },
  { platform: 'twitter', label: 'Twitter', icon: Twitter },
  { platform: 'line', label: 'Line', icon: Share2 },
  { platform: 'facebook', label: 'Facebook', icon: Share2 }
]

// 提交評論
const submitReview = () => {
  if (!canReview.value) return

  emit('addReview', {
    bookId: props.book.id,
    rating: myRating.value,
    content: myReview.value.trim(),
    readingStatus: myStatus.value
  })

  // 重置表單
  myRating.value = 0
  myReview.value = ''
  showReviewForm.value = false
}

// 格式化時間
const formatTime = (seconds: number) => {
  const date = new Date(seconds * 1000)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 更新閱讀進度
const handleUpdateProgress = (status: ReadingStatus) => {
  emit('updateProgress', status)
}

// 分享
const handleShare = (platform: BookShare['platform']) => {
  emit('share', platform)
  showShareMenu.value = false
}

// 關閉時重置
watch(() => props.book, () => {
  showReviewForm.value = false
  showShareMenu.value = false
  myRating.value = 0
  myReview.value = ''
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

    <!-- 詳情彈窗 -->
    <div
      :class="[
        'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl',
        darkMode ? 'bg-slate-800' : 'bg-white'
      ]"
    >
      <!-- 標題列 -->
      <div
        :class="[
          'sticky top-0 z-10 flex items-center justify-between p-4 border-b',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        ]"
      >
        <div class="flex items-center gap-2">
          <BookOpen :class="['w-5 h-5', darkMode ? 'text-fuchsia-400' : 'text-fuchsia-500']" />
          <h2 :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
            書籍詳情
          </h2>
        </div>
        <button
          :class="[
            'p-2 rounded-lg transition-colors',
            darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
          ]"
          @click="emit('close')"
        >
          <X :class="['w-5 h-5', darkMode ? 'text-slate-400' : 'text-slate-500']" />
        </button>
      </div>

      <!-- 書籍資訊 -->
      <div class="p-6">
        <div class="flex gap-6">
          <!-- 封面 -->
          <div class="flex-shrink-0">
            <div
              class="w-32 h-44 rounded-xl overflow-hidden shadow-lg"
              :class="darkMode ? 'bg-slate-700' : 'bg-slate-100'"
            >
              <img
                v-if="book.coverUrl"
                :src="book.coverUrl"
                :alt="book.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <BookOpen :class="['w-12 h-12', darkMode ? 'text-slate-500' : 'text-slate-300']" />
              </div>
            </div>
          </div>

          <!-- 書籍資訊 -->
          <div class="flex-1 min-w-0">
            <div
              :class="[
                'inline-block px-2 py-1 rounded-full text-xs font-medium mb-2',
                darkMode ? 'bg-fuchsia-900/30 text-fuchsia-300' : 'bg-fuchsia-100 text-fuchsia-700'
              ]"
            >
              {{ categoryLabel }}
            </div>

            <h1 :class="['text-2xl font-bold mb-1', darkMode ? 'text-white' : 'text-slate-800']">
              {{ book.title }}
            </h1>

            <p :class="['text-lg mb-3', darkMode ? 'text-slate-400' : 'text-slate-500']">
              {{ book.author }}
            </p>

            <!-- 評分 -->
            <div class="flex items-center gap-3 mb-4">
              <StarRating
                :model-value="book.avgRating"
                :dark-mode="darkMode"
                readonly
                size="md"
                show-value
              />
              <span :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
                {{ book.reviewCount }} 則評論
              </span>
            </div>

            <!-- 統計 -->
            <div
              :class="[
                'flex items-center gap-4 text-sm',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              ]"
            >
              <div class="flex items-center gap-1.5">
                <Users class="w-4 h-4" />
                <span>{{ totalReaders }} 人閱讀</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Share2 class="w-4 h-4" />
                <span>{{ book.shareCount }} 次分享</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 閱讀進度按鈕 -->
        <div
          :class="[
            'flex items-center gap-2 mt-6 p-4 rounded-xl',
            darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
          ]"
        >
          <span :class="['text-sm font-medium mr-2', darkMode ? 'text-slate-300' : 'text-slate-600']">
            我的書單：
          </span>
          <button
            v-for="option in progressOptions"
            :key="option.status"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              progress?.status === option.status
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/25'
                : darkMode
                  ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            ]"
            @click="handleUpdateProgress(option.status)"
          >
            <component :is="option.icon" class="w-4 h-4" />
            {{ option.label }}
            <span
              v-if="option.status === 'want-to-read'"
              :class="['text-xs', progress?.status === option.status ? 'text-white/80' : 'text-slate-400']"
            >
              ({{ book.wantToReadCount }})
            </span>
            <span
              v-else-if="option.status === 'reading'"
              :class="['text-xs', progress?.status === option.status ? 'text-white/80' : 'text-slate-400']"
            >
              ({{ book.readingCount }})
            </span>
            <span
              v-else-if="option.status === 'finished'"
              :class="['text-xs', progress?.status === option.status ? 'text-white/80' : 'text-slate-400']"
            >
              ({{ book.finishedCount }})
            </span>
          </button>

          <!-- 分享按鈕 -->
          <div class="relative ml-auto">
            <button
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                darkMode
                  ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              ]"
              @click="showShareMenu = !showShareMenu"
            >
              <Share2 class="w-4 h-4" />
              分享
            </button>

            <!-- 分享選單 -->
            <div
              v-if="showShareMenu"
              :class="[
                'absolute right-0 mt-2 py-2 rounded-xl shadow-xl border z-20 min-w-[140px]',
                darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
              ]"
            >
              <button
                v-for="option in shareOptions"
                :key="option.platform"
                :class="[
                  'flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors',
                  darkMode
                    ? 'text-slate-300 hover:bg-slate-600'
                    : 'text-slate-600 hover:bg-slate-50'
                ]"
                @click="handleShare(option.platform)"
              >
                <component :is="option.icon" class="w-4 h-4" />
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 簡介 -->
        <div class="mt-6">
          <h3 :class="['font-bold mb-2', darkMode ? 'text-white' : 'text-slate-800']">
            簡介
          </h3>
          <p :class="['leading-relaxed', darkMode ? 'text-slate-300' : 'text-slate-600']">
            {{ book.description }}
          </p>
        </div>

        <!-- 標籤 -->
        <div class="flex flex-wrap gap-2 mt-4">
          <span
            v-for="tag in book.tags"
            :key="tag"
            :class="[
              'px-3 py-1 rounded-full text-sm',
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            ]"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 分隔線 -->
        <hr :class="['my-6', darkMode ? 'border-slate-700' : 'border-slate-200']" />

        <!-- 書評區塊 -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 :class="['font-bold flex items-center gap-2', darkMode ? 'text-white' : 'text-slate-800']">
              <MessageSquare class="w-5 h-5" />
              書評 ({{ reviews.length }})
            </h3>

            <button
              v-if="userId && !myExistingReview && !showReviewForm"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25'
              ]"
              @click="showReviewForm = true"
            >
              <Send class="w-4 h-4" />
              寫書評
            </button>
          </div>

          <!-- 寫書評表單 -->
          <div
            v-if="showReviewForm"
            :class="[
              'p-4 rounded-xl mb-4',
              darkMode ? 'bg-slate-700' : 'bg-slate-50'
            ]"
          >
            <div class="mb-3">
              <label
                :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-600']"
              >
                評分
              </label>
              <StarRating
                v-model="myRating"
                :dark-mode="darkMode"
                size="lg"
              />
            </div>

            <div class="mb-3">
              <label
                :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-600']"
              >
                閱讀狀態
              </label>
              <div class="flex gap-2">
                <button
                  v-for="option in progressOptions"
                  :key="option.status"
                  type="button"
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    myStatus === option.status
                      ? 'bg-fuchsia-500 text-white'
                      : darkMode
                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  ]"
                  @click="myStatus = option.status"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label
                :class="['block text-sm font-medium mb-2', darkMode ? 'text-slate-300' : 'text-slate-600']"
              >
                心得
              </label>
              <textarea
                v-model="myReview"
                rows="3"
                placeholder="分享你的閱讀心得..."
                :class="[
                  'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none',
                  darkMode
                    ? 'bg-slate-600 border-slate-500 text-white placeholder:text-slate-400'
                    : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                ]"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  darkMode ? 'text-slate-300 hover:bg-slate-600' : 'text-slate-600 hover:bg-slate-200'
                ]"
                @click="showReviewForm = false"
              >
                取消
              </button>
              <button
                :disabled="!canReview"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  canReview
                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25'
                    : darkMode
                      ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                ]"
                @click="submitReview"
              >
                送出評論
              </button>
            </div>
          </div>

          <!-- 書評列表 -->
          <div v-if="reviews.length > 0" class="space-y-4">
            <div
              v-for="review in reviews"
              :key="review.id"
              :class="[
                'p-4 rounded-xl',
                darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
              ]"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">
                      {{ review.userName }}
                    </span>
                    <span
                      :class="[
                        'text-xs px-2 py-0.5 rounded-full',
                        darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                      ]"
                    >
                      {{ review.userRole }}
                    </span>
                    <span
                      :class="[
                        'text-xs px-2 py-0.5 rounded-full',
                        review.readingStatus === 'finished'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : review.readingStatus === 'reading'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      ]"
                    >
                      {{ READING_STATUS_LABELS[review.readingStatus] }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <StarRating
                      :model-value="review.rating"
                      :dark-mode="darkMode"
                      readonly
                      size="sm"
                    />
                    <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                      {{ review.createdAt ? formatTime(review.createdAt.seconds) : '' }}
                    </span>
                  </div>
                </div>
              </div>

              <p :class="['mt-2', darkMode ? 'text-slate-300' : 'text-slate-600']">
                {{ review.content }}
              </p>

              <div class="flex items-center gap-4 mt-3">
                <button
                  :class="[
                    'flex items-center gap-1 text-sm transition-colors',
                    review.likedBy.includes(userId || '')
                      ? 'text-pink-500'
                      : darkMode
                        ? 'text-slate-400 hover:text-pink-400'
                        : 'text-slate-500 hover:text-pink-500'
                  ]"
                  @click="emit('toggleReviewLike', review.id)"
                >
                  <Heart
                    class="w-4 h-4"
                    :class="review.likedBy.includes(userId || '') ? 'fill-current' : ''"
                  />
                  <span>{{ review.likeCount }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 無書評 -->
          <div
            v-else
            :class="[
              'text-center py-8',
              darkMode ? 'text-slate-500' : 'text-slate-400'
            ]"
          >
            <MessageSquare class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>還沒有書評，來當第一個評論者吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
