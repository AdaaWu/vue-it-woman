<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Plus, Trash2, Image as ImageIcon, DollarSign, MapPin } from 'lucide-vue-next'
import type { MarketplaceItemInput, MarketplaceCategory, ItemCondition } from '@/types'
import {
  MARKETPLACE_CATEGORY_LABELS, ITEM_CONDITION_LABELS,
  TRADE_LOCATION_OPTIONS
} from '@/types'

interface Props {
  darkMode: boolean
  editItem?: MarketplaceItemInput & { id: string }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: MarketplaceItemInput]
}>()

// 表單資料
const form = ref<MarketplaceItemInput>({
  title: '',
  description: '',
  category: 'electronics',
  condition: 'good',
  price: 0,
  originalPrice: undefined,
  images: [],
  tradeLocation: ''
})

// 新圖片 URL 輸入
const newImageUrl = ref('')

// 編輯模式
const isEditMode = computed(() => !!props.editItem)

// 監聽編輯項目變化
watch(
  () => props.editItem,
  (item) => {
    if (item) {
      form.value = {
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        price: item.price,
        originalPrice: item.originalPrice,
        images: [...item.images],
        tradeLocation: item.tradeLocation
      }
    }
  },
  { immediate: true }
)

// 分類選項
const categoryOptions = Object.entries(MARKETPLACE_CATEGORY_LABELS) as [MarketplaceCategory, string][]

// 狀況選項
const conditionOptions = Object.entries(ITEM_CONDITION_LABELS) as [ItemCondition, string][]

// 驗證
const isValid = computed(() => {
  return (
    form.value.title.trim().length > 0 &&
    form.value.description.trim().length > 0 &&
    form.value.price > 0 &&
    form.value.tradeLocation.trim().length > 0
  )
})

// 新增圖片
const addImage = () => {
  if (!newImageUrl.value.trim()) return
  if (form.value.images.length >= 5) {
    alert('最多只能上傳 5 張圖片')
    return
  }

  // 簡單驗證 URL
  try {
    new URL(newImageUrl.value)
    form.value.images.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  } catch {
    alert('請輸入有效的圖片網址')
  }
}

// 移除圖片
const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

// 提交
const handleSubmit = () => {
  if (!isValid.value) return
  emit('submit', { ...form.value })
}
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
        'relative w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col',
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
          {{ isEditMode ? '編輯商品' : '刊登二手物' }}
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

      <!-- 表單 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 商品名稱 -->
        <div>
          <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
            商品名稱 *
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="例：MacBook Pro 13吋 2020"
            :class="[
              'w-full px-3 py-2 rounded-lg border outline-none transition-colors',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
            ]"
          />
        </div>

        <!-- 分類 & 狀況 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
              商品分類 *
            </label>
            <select
              v-model="form.category"
              :class="[
                'w-full px-3 py-2 rounded-lg border outline-none transition-colors',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-pink-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-pink-500'
              ]"
            >
              <option
                v-for="[value, label] in categoryOptions"
                :key="value"
                :value="value"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div>
            <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
              商品狀況 *
            </label>
            <select
              v-model="form.condition"
              :class="[
                'w-full px-3 py-2 rounded-lg border outline-none transition-colors',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-pink-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-pink-500'
              ]"
            >
              <option
                v-for="[value, label] in conditionOptions"
                :key="value"
                :value="value"
              >
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 價格 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
              售價 *
            </label>
            <div class="relative">
              <DollarSign
                :size="18"
                :class="[
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                ]"
              />
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                placeholder="0"
                :class="[
                  'w-full pl-9 pr-3 py-2 rounded-lg border outline-none transition-colors',
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
                ]"
              />
            </div>
          </div>

          <div>
            <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
              原價（選填）
            </label>
            <div class="relative">
              <DollarSign
                :size="18"
                :class="[
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                ]"
              />
              <input
                v-model.number="form.originalPrice"
                type="number"
                min="0"
                placeholder="填寫可顯示折扣"
                :class="[
                  'w-full pl-9 pr-3 py-2 rounded-lg border outline-none transition-colors',
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
                ]"
              />
            </div>
          </div>
        </div>

        <!-- 面交地點 -->
        <div>
          <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
            面交地點 *
          </label>
          <div class="relative">
            <MapPin
              :size="18"
              :class="[
                'absolute left-3 top-1/2 -translate-y-1/2',
                darkMode ? 'text-slate-400' : 'text-slate-500'
              ]"
            />
            <input
              v-model="form.tradeLocation"
              type="text"
              list="location-options"
              placeholder="選擇或輸入面交地點"
              :class="[
                'w-full pl-9 pr-3 py-2 rounded-lg border outline-none transition-colors',
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
              ]"
            />
            <datalist id="location-options">
              <option v-for="location in TRADE_LOCATION_OPTIONS" :key="location" :value="location" />
            </datalist>
          </div>
        </div>

        <!-- 商品描述 -->
        <div>
          <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
            商品描述 *
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="請詳細描述商品狀況、購入時間、使用情形等..."
            :class="[
              'w-full px-3 py-2 rounded-lg border outline-none transition-colors resize-none',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
            ]"
          />
        </div>

        <!-- 商品圖片 -->
        <div>
          <label :class="['block text-sm font-medium mb-1.5', darkMode ? 'text-slate-300' : 'text-slate-700']">
            商品圖片（最多 5 張）
          </label>

          <!-- 已上傳的圖片 -->
          <div v-if="form.images.length > 0" class="grid grid-cols-5 gap-2 mb-3">
            <div
              v-for="(url, index) in form.images"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img :src="url" alt="" class="w-full h-full object-cover" />
              <button
                :class="[
                  'absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'
                ]"
                @click="removeImage(index)"
              >
                <Trash2 :size="20" class="text-white" />
              </button>
            </div>
          </div>

          <!-- 新增圖片 URL -->
          <div class="flex gap-2">
            <div class="relative flex-1">
              <ImageIcon
                :size="18"
                :class="[
                  'absolute left-3 top-1/2 -translate-y-1/2',
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                ]"
              />
              <input
                v-model="newImageUrl"
                type="url"
                placeholder="貼上圖片網址"
                :class="[
                  'w-full pl-9 pr-3 py-2 rounded-lg border outline-none transition-colors',
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-pink-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
                ]"
                @keydown.enter.prevent="addImage"
              />
            </div>
            <button
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                newImageUrl.trim()
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : darkMode
                    ? 'bg-slate-700 text-slate-500'
                    : 'bg-slate-100 text-slate-400'
              ]"
              :disabled="!newImageUrl.trim() || form.images.length >= 5"
              @click="addImage"
            >
              <Plus :size="20" />
            </button>
          </div>
          <p :class="['text-xs mt-1', darkMode ? 'text-slate-500' : 'text-slate-400']">
            可使用 Imgur、Unsplash 等圖床服務
          </p>
        </div>

        <!-- 溫馨提醒 -->
        <div
          :class="[
            'p-3 rounded-lg text-sm',
            darkMode ? 'bg-yellow-500/10 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
          ]"
        >
          <p class="font-medium mb-1">溫馨提醒</p>
          <ul class="list-disc list-inside space-y-0.5 text-xs opacity-80">
            <li>本平台不處理金流，請自行與買家聯繫交易方式</li>
            <li>建議面交時選擇人多的公共場所</li>
            <li>交易前請確認商品狀況，避免糾紛</li>
          </ul>
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div
        :class="[
          'flex justify-end gap-3 px-4 py-3 border-t',
          darkMode ? 'border-slate-700' : 'border-slate-200'
        ]"
      >
        <button
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            darkMode
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          :class="[
            'px-6 py-2 rounded-lg font-medium transition-colors',
            isValid
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : darkMode
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          ]"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          {{ isEditMode ? '儲存變更' : '刊登商品' }}
        </button>
      </div>
    </div>
  </div>
</template>
