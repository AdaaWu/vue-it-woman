<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Search, Plus, Filter, Package, Heart, ShoppingBag,
  Grid, List, X, RefreshCw
} from 'lucide-vue-next'
import type { Ref } from 'vue'
import type { UserProfile, MarketplaceItem, MarketplaceCategory, MarketplaceItemInput } from '@/types'
import { MARKETPLACE_CATEGORY_LABELS } from '@/types'
import { useMarketplace } from '../composables/useMarketplace'
import MarketplaceItemCard from '../components/MarketplaceItemCard.vue'
import MarketplaceItemDetail from '../components/MarketplaceItemDetail.vue'
import MarketplaceItemEditor from '../components/MarketplaceItemEditor.vue'

interface Props {
  darkMode: boolean
  userId: string | null
  userProfile: UserProfile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewUserProfile: [userId: string]
}>()

// Composable
const userIdRef = ref(props.userId) as Ref<string | null>
const userProfileRef = ref(props.userProfile) as Ref<UserProfile | null>

watch(() => props.userId, (val) => { userIdRef.value = val })
watch(() => props.userProfile, (val) => { userProfileRef.value = val })

const marketplace = useMarketplace(userIdRef, userProfileRef)

// UI State
const searchInput = ref('')
const activeTab = ref<'browse' | 'myListings' | 'wishlist'>('browse')
const showFilters = ref(false)
const showEditor = ref(false)
const showDetail = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

// 分類選項
const categoryOptions: { value: MarketplaceCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  ...Object.entries(MARKETPLACE_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as MarketplaceCategory,
    label
  }))
]

// 根據 tab 顯示的商品
const displayItems = computed(() => {
  switch (activeTab.value) {
    case 'myListings':
      return marketplace.myListings.value
    case 'wishlist':
      return marketplace.wishlistItems.value
    default:
      return marketplace.items.value
  }
})

// Tab 標籤
const tabs = computed(() => [
  { key: 'browse', label: '瀏覽商品', icon: ShoppingBag, count: marketplace.activeItems.value.length },
  { key: 'myListings', label: '我的刊登', icon: Package, count: marketplace.myListings.value.length },
  { key: 'wishlist', label: '收藏清單', icon: Heart, count: marketplace.wishlistItems.value.length }
])

// 搜尋
const handleSearch = () => {
  marketplace.setSearchKeyword(searchInput.value)
}

// 選擇分類
const selectCategory = (category: MarketplaceCategory | 'all') => {
  marketplace.setFilter(category)
  showFilters.value = false
}

// 查看商品詳情
const viewItem = async (item: MarketplaceItem) => {
  await marketplace.loadItem(item.id)
  await marketplace.loadComments(item.id)
  showDetail.value = true
}

// 收藏/取消收藏
const handleToggleWishlist = async (itemId: string) => {
  await marketplace.toggleWishlist(itemId)
}

// 新增留言
const handleAddComment = async (content: string, parentId?: string) => {
  if (!marketplace.currentItem.value) return
  await marketplace.addComment({
    itemId: marketplace.currentItem.value.id,
    content,
    parentId
  })
}

// 更新狀態
const handleUpdateStatus = async (status: 'active' | 'reserved' | 'sold' | 'closed') => {
  if (!marketplace.currentItem.value) return
  await marketplace.updateItemStatus(marketplace.currentItem.value.id, status)
}

// 刊登商品
const handleCreateItem = async (data: MarketplaceItemInput) => {
  const id = await marketplace.createItem(data)
  if (id) {
    showEditor.value = false
    activeTab.value = 'myListings'
  }
}

// 清除篩選
const clearFilters = () => {
  marketplace.setFilter('all')
  searchInput.value = ''
  marketplace.setSearchKeyword('')
}

// 初始化
onMounted(async () => {
  await marketplace.loadItems()
  if (props.userId) {
    await marketplace.loadMyWishlist()
  }
})

// 監聽登入狀態變化
watch(() => props.userId, async (id) => {
  if (id) {
    await marketplace.loadMyWishlist()
  }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 頂部標題和操作 -->
    <div
      :class="[
        'px-4 py-3 border-b',
        darkMode ? 'border-slate-700' : 'border-slate-200'
      ]"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <h1 :class="['text-xl font-bold', darkMode ? 'text-white' : 'text-slate-800']">
            二手物交流
          </h1>
          <p :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
            減少浪費，讓物品找到新主人
          </p>
        </div>

        <button
          v-if="userId"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            'bg-pink-500 text-white hover:bg-pink-600'
          ]"
          @click="showEditor = true"
        >
          <Plus :size="18" />
          <span class="hidden sm:inline">刊登物品</span>
        </button>
      </div>

      <!-- 搜尋和篩選 -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search
            :size="18"
            :class="[
              'absolute left-3 top-1/2 -translate-y-1/2',
              darkMode ? 'text-slate-400' : 'text-slate-500'
            ]"
          />
          <input
            v-model="searchInput"
            type="text"
            placeholder="搜尋商品..."
            :class="[
              'w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
            ]"
            @keydown.enter="handleSearch"
          />
        </div>

        <button
          :class="[
            'px-3 py-2 rounded-lg border transition-colors relative',
            marketplace.filterCategory.value !== 'all'
              ? 'bg-pink-500 border-pink-500 text-white'
              : darkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
          @click="showFilters = !showFilters"
        >
          <Filter :size="18" />
        </button>

        <button
          :class="[
            'px-3 py-2 rounded-lg border transition-colors',
            darkMode
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          ]"
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
        >
          <Grid v-if="viewMode === 'list'" :size="18" />
          <List v-else :size="18" />
        </button>
      </div>

      <!-- 篩選面板 -->
      <div
        v-if="showFilters"
        :class="[
          'mt-3 p-3 rounded-lg',
          darkMode ? 'bg-slate-700' : 'bg-slate-100'
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <span :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-600']">
            商品分類
          </span>
          <button
            v-if="marketplace.filterCategory.value !== 'all'"
            :class="[
              'text-xs flex items-center gap-1',
              darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-500 hover:text-pink-600'
            ]"
            @click="clearFilters"
          >
            <RefreshCw :size="12" />
            清除篩選
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in categoryOptions"
            :key="option.value"
            :class="[
              'px-3 py-1.5 rounded-full text-sm transition-colors',
              marketplace.filterCategory.value === option.value
                ? 'bg-pink-500 text-white'
                : darkMode
                  ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
            ]"
            @click="selectCategory(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div
      :class="[
        'flex border-b',
        darkMode ? 'border-slate-700' : 'border-slate-200'
      ]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
          activeTab === tab.key
            ? darkMode
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-pink-500 border-b-2 border-pink-500'
            : darkMode
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-slate-500 hover:text-slate-700'
        ]"
        @click="activeTab = tab.key as typeof activeTab"
      >
        <component :is="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count > 0"
          :class="[
            'px-1.5 py-0.5 text-xs rounded-full',
            activeTab === tab.key
              ? 'bg-pink-500 text-white'
              : darkMode
                ? 'bg-slate-600 text-slate-300'
                : 'bg-slate-200 text-slate-600'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- 商品列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 目前篩選條件 -->
      <div
        v-if="marketplace.filterCategory.value !== 'all' || marketplace.searchKeyword.value"
        class="flex items-center gap-2 mb-3"
      >
        <span :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
          目前篩選：
        </span>
        <span
          v-if="marketplace.filterCategory.value !== 'all'"
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
            darkMode ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-600'
          ]"
        >
          {{ MARKETPLACE_CATEGORY_LABELS[marketplace.filterCategory.value as MarketplaceCategory] }}
          <button @click="selectCategory('all')">
            <X :size="12" />
          </button>
        </span>
        <span
          v-if="marketplace.searchKeyword.value"
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
            darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
          ]"
        >
          「{{ marketplace.searchKeyword.value }}」
          <button @click="searchInput = ''; marketplace.setSearchKeyword('')">
            <X :size="12" />
          </button>
        </span>
      </div>

      <!-- 載入中 -->
      <div
        v-if="marketplace.isLoading.value"
        class="flex items-center justify-center py-12"
      >
        <RefreshCw :size="24" class="animate-spin text-pink-500" />
      </div>

      <!-- 空狀態 -->
      <div
        v-else-if="displayItems.length === 0"
        :class="[
          'flex flex-col items-center justify-center py-12 text-center',
          darkMode ? 'text-slate-400' : 'text-slate-500'
        ]"
      >
        <Package :size="48" class="mb-3 opacity-50" />
        <p class="font-medium mb-1">
          {{
            activeTab === 'myListings' ? '你還沒有刊登任何物品' :
            activeTab === 'wishlist' ? '收藏清單是空的' :
            '找不到符合條件的商品'
          }}
        </p>
        <p class="text-sm opacity-70">
          {{
            activeTab === 'myListings' ? '點擊上方「刊登物品」開始出售' :
            activeTab === 'wishlist' ? '瀏覽商品時點擊愛心收藏' :
            '試試其他搜尋條件'
          }}
        </p>
        <button
          v-if="activeTab === 'myListings' && userId"
          :class="[
            'mt-4 px-4 py-2 rounded-lg font-medium',
            'bg-pink-500 text-white hover:bg-pink-600'
          ]"
          @click="showEditor = true"
        >
          刊登第一件物品
        </button>
      </div>

      <!-- 商品格狀列表 -->
      <div
        v-else
        :class="[
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-3'
        ]"
      >
        <MarketplaceItemCard
          v-for="item in displayItems"
          :key="item.id"
          :item="item"
          :dark-mode="darkMode"
          :is-wishlisted="marketplace.isInWishlist(item.id)"
          @click="viewItem(item)"
          @toggle-wishlist="handleToggleWishlist(item.id)"
        />
      </div>
    </div>

    <!-- 商品詳情 Modal -->
    <MarketplaceItemDetail
      v-if="showDetail && marketplace.currentItem.value"
      :item="marketplace.currentItem.value"
      :comments="marketplace.comments.value"
      :dark-mode="darkMode"
      :is-wishlisted="marketplace.isInWishlist(marketplace.currentItem.value.id)"
      :current-user-id="userId"
      :user-profile="userProfile"
      @close="showDetail = false"
      @toggle-wishlist="handleToggleWishlist(marketplace.currentItem.value!.id)"
      @add-comment="handleAddComment"
      @update-status="handleUpdateStatus"
      @view-user-profile="emit('viewUserProfile', $event)"
    />

    <!-- 刊登/編輯 Modal -->
    <MarketplaceItemEditor
      v-if="showEditor"
      :dark-mode="darkMode"
      @close="showEditor = false"
      @submit="handleCreateItem"
    />
  </div>
</template>
