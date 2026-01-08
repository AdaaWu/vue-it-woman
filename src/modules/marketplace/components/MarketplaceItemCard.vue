<script setup lang="ts">
import { computed } from 'vue'
import { Heart, Eye, MessageCircle, MapPin } from 'lucide-vue-next'
import type { MarketplaceItem } from '@/types'
import { MARKETPLACE_CATEGORY_LABELS, ITEM_CONDITION_LABELS, LISTING_STATUS_LABELS } from '@/types'

interface Props {
  item: MarketplaceItem
  darkMode: boolean
  isWishlisted?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'toggleWishlist'): void
}>()

// 計算折扣百分比
const discountPercent = computed(() => {
  if (!props.item.originalPrice || props.item.originalPrice <= props.item.price) return null
  const discount = Math.round((1 - props.item.price / props.item.originalPrice) * 100)
  return discount > 0 ? discount : null
})

// 格式化價格
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-TW').format(price)
}

// 格式化時間
const formatTime = (timestamp: { seconds: number } | null) => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`
  return `${Math.floor(diffDays / 30)} 個月前`
}

// 狀態顏色
const statusColor = computed(() => {
  switch (props.item.status) {
    case 'active': return 'bg-green-500'
    case 'reserved': return 'bg-yellow-500'
    case 'sold': return 'bg-slate-500'
    case 'closed': return 'bg-red-500'
    default: return 'bg-slate-500'
  }
})

// 狀態標籤是否顯示
const showStatusBadge = computed(() => props.item.status !== 'active')
</script>

<template>
  <div
    :class="[
      'rounded-xl overflow-hidden cursor-pointer transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-1',
      darkMode
        ? 'bg-slate-800 border border-slate-700'
        : 'bg-white border border-slate-200 shadow-sm'
    ]"
    @click="emit('click')"
  >
    <!-- 商品圖片 -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        v-if="item.images.length > 0"
        :src="item.images[0]"
        :alt="item.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center',
          darkMode ? 'bg-slate-700' : 'bg-slate-100'
        ]"
      >
        <span :class="['text-4xl', darkMode ? 'text-slate-500' : 'text-slate-400']">
          📦
        </span>
      </div>

      <!-- 狀態標籤 -->
      <div
        v-if="showStatusBadge"
        :class="[
          'absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium text-white',
          statusColor
        ]"
      >
        {{ LISTING_STATUS_LABELS[item.status] }}
      </div>

      <!-- 折扣標籤 -->
      <div
        v-if="discountPercent && item.status === 'active'"
        class="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold"
      >
        -{{ discountPercent }}%
      </div>

      <!-- 收藏按鈕 -->
      <button
        :class="[
          'absolute bottom-2 right-2 p-2 rounded-full transition-colors',
          isWishlisted
            ? 'bg-pink-500 text-white'
            : darkMode
              ? 'bg-slate-800/80 text-slate-300 hover:bg-pink-500 hover:text-white'
              : 'bg-white/80 text-slate-500 hover:bg-pink-500 hover:text-white'
        ]"
        @click.stop="emit('toggleWishlist')"
      >
        <Heart :size="16" :fill="isWishlisted ? 'currentColor' : 'none'" />
      </button>
    </div>

    <!-- 商品資訊 -->
    <div class="p-3">
      <!-- 分類 & 狀況 -->
      <div class="flex items-center gap-2 mb-1.5">
        <span
          :class="[
            'text-xs px-1.5 py-0.5 rounded',
            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          ]"
        >
          {{ MARKETPLACE_CATEGORY_LABELS[item.category] }}
        </span>
        <span
          :class="[
            'text-xs px-1.5 py-0.5 rounded',
            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          ]"
        >
          {{ ITEM_CONDITION_LABELS[item.condition] }}
        </span>
      </div>

      <!-- 標題 -->
      <h3
        :class="[
          'font-medium text-sm line-clamp-2 mb-1.5',
          darkMode ? 'text-white' : 'text-slate-800'
        ]"
      >
        {{ item.title }}
      </h3>

      <!-- 價格 -->
      <div class="flex items-baseline gap-2 mb-2">
        <span
          :class="[
            'text-lg font-bold',
            item.status === 'sold'
              ? 'text-slate-400'
              : 'text-pink-500'
          ]"
        >
          ${{ formatPrice(item.price) }}
        </span>
        <span
          v-if="item.originalPrice"
          class="text-xs text-slate-400 line-through"
        >
          ${{ formatPrice(item.originalPrice) }}
        </span>
      </div>

      <!-- 面交地點 -->
      <div
        :class="[
          'flex items-center gap-1 text-xs mb-2',
          darkMode ? 'text-slate-400' : 'text-slate-500'
        ]"
      >
        <MapPin :size="12" />
        <span>{{ item.tradeLocation }}</span>
      </div>

      <!-- 統計 & 時間 -->
      <div
        :class="[
          'flex items-center justify-between text-xs',
          darkMode ? 'text-slate-500' : 'text-slate-400'
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <Eye :size="12" />
            {{ item.viewCount }}
          </span>
          <span class="flex items-center gap-1">
            <Heart :size="12" />
            {{ item.wishlistCount }}
          </span>
          <span class="flex items-center gap-1">
            <MessageCircle :size="12" />
            {{ item.commentCount }}
          </span>
        </div>
        <span>{{ formatTime(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>
