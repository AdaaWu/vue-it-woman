<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  X, Heart, Eye, MessageCircle, MapPin, User, Send,
  ChevronLeft, ChevronRight, Tag, Package, Clock, AlertTriangle
} from 'lucide-vue-next'
import type { MarketplaceItem, MarketplaceComment, UserProfile } from '@/types'
import {
  MARKETPLACE_CATEGORY_LABELS, ITEM_CONDITION_LABELS,
  LISTING_STATUS_LABELS
} from '@/types'

interface Props {
  item: MarketplaceItem
  comments: MarketplaceComment[]
  darkMode: boolean
  isWishlisted: boolean
  currentUserId: string | null
  userProfile: UserProfile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleWishlist'): void
  (e: 'addComment', content: string, parentId?: string): void
  (e: 'updateStatus', status: 'active' | 'reserved' | 'sold' | 'closed'): void
  (e: 'viewUserProfile', userId: string): void
}>()

// State
const newComment = ref('')
const replyingTo = ref<string | null>(null)
const currentImageIndex = ref(0)

// 是否為賣家
const isSeller = computed(() => props.currentUserId === props.item.userId)

// 格式化價格
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW').format(price)
}

// 格式化時間
const formatTime = (timestamp: { seconds: number } | null) => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 計算折扣
const discountPercent = computed(() => {
  if (!props.item.originalPrice || props.item.originalPrice <= props.item.price) return null
  return Math.round((1 - props.item.price / props.item.originalPrice) * 100)
})

// 圖片導覽
const nextImage = () => {
  if (currentImageIndex.value < props.item.images.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// 提交留言
const submitComment = () => {
  if (!newComment.value.trim()) return
  emit('addComment', newComment.value.trim(), replyingTo.value || undefined)
  newComment.value = ''
  replyingTo.value = null
}

// 回覆留言
const replyToComment = (commentId: string, userName: string) => {
  replyingTo.value = commentId
  newComment.value = `@${userName} `
}

// 取消回覆
const cancelReply = () => {
  replyingTo.value = null
  newComment.value = ''
}

// 整理留言（將回覆放在原留言下方）
const organizedComments = computed(() => {
  const mainComments = props.comments.filter(c => !c.parentId)
  return mainComments.map(main => ({
    ...main,
    replies: props.comments.filter(c => c.parentId === main.id)
  }))
})

// 狀態選項
const statusOptions = [
  { value: 'active', label: '販售中' },
  { value: 'reserved', label: '已預訂' },
  { value: 'sold', label: '已售出' },
  { value: 'closed', label: '已下架' }
] as const
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

    <!-- 內容 -->
    <div
      :class="[
        'relative w-full max-w-3xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col',
        darkMode ? 'bg-slate-800' : 'bg-white'
      ]"
    >
      <!-- 標題列 -->
      <div
        :class="[
          'flex items-center justify-between px-4 py-3 border-b',
          darkMode ? 'border-slate-700' : 'border-slate-200'
        ]"
      >
        <h2 :class="['font-semibold', darkMode ? 'text-white' : 'text-slate-800']">
          商品詳情
        </h2>
        <button
          :class="[
            'p-1.5 rounded-lg transition-colors',
            darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
          ]"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 內容區 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-4">
          <!-- 圖片區 -->
          <div class="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-900">
            <img
              v-if="item.images.length > 0"
              :src="item.images[currentImageIndex]"
              :alt="item.title"
              class="w-full h-full object-contain"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-slate-700"
            >
              <Package :size="64" class="text-slate-500" />
            </div>

            <!-- 圖片導覽 -->
            <template v-if="item.images.length > 1">
              <button
                v-if="currentImageIndex > 0"
                class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                @click="prevImage"
              >
                <ChevronLeft :size="20" />
              </button>
              <button
                v-if="currentImageIndex < item.images.length - 1"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                @click="nextImage"
              >
                <ChevronRight :size="20" />
              </button>

              <!-- 圖片指示器 -->
              <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                <button
                  v-for="(_, index) in item.images"
                  :key="index"
                  :class="[
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  ]"
                  @click="currentImageIndex = index"
                />
              </div>
            </template>

            <!-- 狀態標籤 -->
            <div
              v-if="item.status !== 'active'"
              :class="[
                'absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium text-white',
                item.status === 'reserved' ? 'bg-yellow-500' :
                item.status === 'sold' ? 'bg-slate-500' : 'bg-red-500'
              ]"
            >
              {{ LISTING_STATUS_LABELS[item.status] }}
            </div>
          </div>

          <!-- 商品資訊 -->
          <div class="space-y-3">
            <!-- 標題 & 收藏 -->
            <div class="flex items-start justify-between gap-3">
              <h3
                :class="[
                  'text-xl font-bold flex-1',
                  darkMode ? 'text-white' : 'text-slate-800'
                ]"
              >
                {{ item.title }}
              </h3>
              <button
                v-if="!isSeller"
                :class="[
                  'p-2 rounded-lg transition-colors flex-shrink-0',
                  isWishlisted
                    ? 'bg-pink-500 text-white'
                    : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-pink-500 hover:text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-pink-500 hover:text-white'
                ]"
                @click="emit('toggleWishlist')"
              >
                <Heart :size="20" :fill="isWishlisted ? 'currentColor' : 'none'" />
              </button>
            </div>

            <!-- 價格 -->
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold text-pink-500">
                ${{ formatPrice(item.price) }}
              </span>
              <span v-if="item.originalPrice" class="text-lg text-slate-400 line-through">
                ${{ formatPrice(item.originalPrice) }}
              </span>
              <span
                v-if="discountPercent"
                class="px-2 py-0.5 bg-red-500 text-white text-sm font-bold rounded"
              >
                省 {{ discountPercent }}%
              </span>
            </div>

            <!-- 標籤 -->
            <div class="flex flex-wrap gap-2">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm',
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                <Tag :size="14" />
                {{ MARKETPLACE_CATEGORY_LABELS[item.category] }}
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm',
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                <Package :size="14" />
                {{ ITEM_CONDITION_LABELS[item.condition] }}
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm',
                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                ]"
              >
                <MapPin :size="14" />
                {{ item.tradeLocation }}
              </span>
            </div>

            <!-- 賣家資訊 -->
            <div
              :class="[
                'flex items-center justify-between p-3 rounded-lg',
                darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
              ]"
            >
              <button
                class="flex items-center gap-2"
                @click="emit('viewUserProfile', item.userId)"
              >
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    darkMode ? 'bg-slate-600' : 'bg-slate-200'
                  ]"
                >
                  <User :size="20" :class="darkMode ? 'text-slate-400' : 'text-slate-500'" />
                </div>
                <div class="text-left">
                  <div :class="['font-medium', darkMode ? 'text-white' : 'text-slate-800']">
                    {{ item.userName }}
                  </div>
                  <div :class="['text-xs', darkMode ? 'text-slate-400' : 'text-slate-500']">
                    {{ item.userRole }}
                  </div>
                </div>
              </button>

              <div :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
                <div class="flex items-center gap-1">
                  <Clock :size="14" />
                  {{ formatTime(item.createdAt) }}
                </div>
              </div>
            </div>

            <!-- 統計 -->
            <div
              :class="[
                'flex items-center gap-4 text-sm',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              ]"
            >
              <span class="flex items-center gap-1">
                <Eye :size="16" />
                {{ item.viewCount }} 次瀏覽
              </span>
              <span class="flex items-center gap-1">
                <Heart :size="16" />
                {{ item.wishlistCount }} 人收藏
              </span>
              <span class="flex items-center gap-1">
                <MessageCircle :size="16" />
                {{ item.commentCount }} 則留言
              </span>
            </div>

            <!-- 商品描述 -->
            <div>
              <h4 :class="['font-medium mb-2', darkMode ? 'text-white' : 'text-slate-800']">
                商品描述
              </h4>
              <p
                :class="[
                  'whitespace-pre-wrap text-sm leading-relaxed',
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                ]"
              >
                {{ item.description }}
              </p>
            </div>

            <!-- 交易注意事項 -->
            <div
              :class="[
                'p-3 rounded-lg border',
                darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
              ]"
            >
              <div class="flex items-start gap-2">
                <AlertTriangle :size="18" :class="darkMode ? 'text-amber-400' : 'text-amber-500'" />
                <div>
                  <p :class="['font-medium text-sm mb-1', darkMode ? 'text-amber-300' : 'text-amber-700']">
                    交易注意事項
                  </p>
                  <ul :class="['text-xs space-y-0.5', darkMode ? 'text-amber-200/80' : 'text-amber-600']">
                    <li>• 本平台不處理金流，請自行與賣家聯繫交易方式</li>
                    <li>• 建議面交時選擇人多的公共場所</li>
                    <li>• 交易前請確認商品狀況，避免糾紛</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 賣家操作區 -->
            <div
              v-if="isSeller"
              :class="[
                'p-3 rounded-lg border-2 border-dashed',
                darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
              ]"
            >
              <h4 :class="['font-medium mb-2', darkMode ? 'text-white' : 'text-slate-800']">
                更新商品狀態
              </h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in statusOptions"
                  :key="option.value"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    item.status === option.value
                      ? 'bg-pink-500 text-white'
                      : darkMode
                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  ]"
                  @click="emit('updateStatus', option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 留言區 -->
            <div>
              <h4 :class="['font-medium mb-3', darkMode ? 'text-white' : 'text-slate-800']">
                詢問與回覆 ({{ comments.length }})
              </h4>

              <!-- 留言列表 -->
              <div v-if="organizedComments.length > 0" class="space-y-3 mb-4">
                <div
                  v-for="comment in organizedComments"
                  :key="comment.id"
                  class="space-y-2"
                >
                  <!-- 主留言 -->
                  <div
                    :class="[
                      'p-3 rounded-lg',
                      comment.isSellerReply
                        ? darkMode ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'
                        : darkMode ? 'bg-slate-700' : 'bg-slate-100'
                    ]"
                  >
                    <div class="flex items-start gap-2">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          darkMode ? 'bg-slate-600' : 'bg-slate-200'
                        ]"
                      >
                        <User :size="14" :class="darkMode ? 'text-slate-400' : 'text-slate-500'" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span :class="['font-medium text-sm', darkMode ? 'text-white' : 'text-slate-800']">
                            {{ comment.userName }}
                          </span>
                          <span
                            v-if="comment.isSellerReply"
                            class="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded"
                          >
                            賣家
                          </span>
                          <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                            {{ formatTime(comment.createdAt) }}
                          </span>
                        </div>
                        <p :class="['text-sm', darkMode ? 'text-slate-300' : 'text-slate-600']">
                          {{ comment.content }}
                        </p>
                        <button
                          v-if="currentUserId && !comment.isSellerReply"
                          :class="[
                            'mt-1 text-xs',
                            darkMode ? 'text-slate-400 hover:text-pink-400' : 'text-slate-500 hover:text-pink-500'
                          ]"
                          @click="replyToComment(comment.id, comment.userName)"
                        >
                          回覆
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 回覆 -->
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    :class="[
                      'ml-6 p-3 rounded-lg',
                      reply.isSellerReply
                        ? darkMode ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'
                        : darkMode ? 'bg-slate-700' : 'bg-slate-100'
                    ]"
                  >
                    <div class="flex items-start gap-2">
                      <div
                        :class="[
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                          darkMode ? 'bg-slate-600' : 'bg-slate-200'
                        ]"
                      >
                        <User :size="12" :class="darkMode ? 'text-slate-400' : 'text-slate-500'" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span :class="['font-medium text-sm', darkMode ? 'text-white' : 'text-slate-800']">
                            {{ reply.userName }}
                          </span>
                          <span
                            v-if="reply.isSellerReply"
                            class="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded"
                          >
                            賣家
                          </span>
                          <span :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
                            {{ formatTime(reply.createdAt) }}
                          </span>
                        </div>
                        <p :class="['text-sm', darkMode ? 'text-slate-300' : 'text-slate-600']">
                          {{ reply.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                :class="[
                  'text-center py-6',
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                ]"
              >
                還沒有人留言，來當第一個詢問的人吧！
              </div>

              <!-- 留言輸入 -->
              <div v-if="currentUserId">
                <div
                  v-if="replyingTo"
                  :class="[
                    'flex items-center justify-between px-3 py-2 mb-2 rounded-t-lg text-sm',
                    darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                  ]"
                >
                  <span>回覆留言中...</span>
                  <button
                    :class="darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'"
                    @click="cancelReply"
                  >
                    <X :size="16" />
                  </button>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newComment"
                    type="text"
                    :placeholder="isSeller ? '回覆買家詢問...' : '詢問賣家...'"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg border outline-none transition-colors',
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
                    ]"
                    @keydown.enter="submitComment"
                  />
                  <button
                    :class="[
                      'px-4 py-2 rounded-lg font-medium transition-colors',
                      newComment.trim()
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : darkMode
                          ? 'bg-slate-700 text-slate-500'
                          : 'bg-slate-100 text-slate-400'
                    ]"
                    :disabled="!newComment.trim()"
                    @click="submitComment"
                  >
                    <Send :size="18" />
                  </button>
                </div>
              </div>
              <div
                v-else
                :class="[
                  'text-center py-4 text-sm',
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                ]"
              >
                請先登入才能留言詢問
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
