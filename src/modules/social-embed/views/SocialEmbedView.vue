<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, Moon, Sun, Link, Instagram, Facebook, X, Trash2 } from 'lucide-vue-next'
import SocialEmbed from '@/shared/components/SocialEmbed.vue'
import { parseSocialUrl, getPlatformName, type SocialPlatform } from '@/shared/utils/socialUrlParser'

const props = defineProps<{
  darkMode: boolean
}>()

const emit = defineEmits<{
  toggleDarkMode: []
  openSidebar: []
}>()

const urlInput = ref('')
const embeddedUrls = ref<string[]>([])
const inputError = ref('')

// 平台 icon 對應
const platformIcons: Record<SocialPlatform, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  threads: X // 暫用 X icon，Threads 沒有專屬 icon
}

const currentInputPlatform = computed(() => {
  if (!urlInput.value.trim()) return null
  const parsed = parseSocialUrl(urlInput.value)
  return parsed?.platform || null
})

function handleAddUrl() {
  const trimmed = urlInput.value.trim()

  if (!trimmed) {
    inputError.value = '請輸入網址'
    return
  }

  const parsed = parseSocialUrl(trimmed)
  if (!parsed) {
    inputError.value = '不支援的網址格式，請貼上 Instagram、Facebook 或 Threads 貼文連結'
    return
  }

  if (embeddedUrls.value.includes(trimmed)) {
    inputError.value = '此貼文已經加入過了'
    return
  }

  embeddedUrls.value.unshift(trimmed)
  urlInput.value = ''
  inputError.value = ''
}

function handleRemoveUrl(index: number) {
  embeddedUrls.value.splice(index, 1)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleAddUrl()
  }
}

function getPlatformForUrl(url: string): SocialPlatform | null {
  const parsed = parseSocialUrl(url)
  return parsed?.platform || null
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header :class="[
      'flex items-center justify-between px-4 md:px-6 py-4 border-b shrink-0',
      darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
    ]">
      <div class="flex items-center gap-3">
        <button
          @click="emit('openSidebar')"
          class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <Link :class="['w-5 h-5', darkMode ? 'text-indigo-400' : 'text-indigo-600']" />
          <h1 :class="['text-lg font-bold', darkMode ? 'text-slate-100' : 'text-slate-800']">
            社群貼文嵌入
          </h1>
        </div>
      </div>

      <button
        @click="emit('toggleDarkMode')"
        :class="[
          'p-2 rounded-lg transition-colors',
          darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
        ]"
      >
        <Moon v-if="!darkMode" class="w-5 h-5" />
        <Sun v-else class="w-5 h-5" />
      </button>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto px-4 py-8">
        <!-- 說明區塊 -->
        <div :class="[
          'mb-8 p-4 rounded-xl border',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50 border-indigo-100'
        ]">
          <h2 :class="['font-semibold mb-2', darkMode ? 'text-slate-200' : 'text-slate-700']">
            如何使用？
          </h2>
          <p :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-600']">
            複製 Instagram、Facebook 或 Threads 貼文的網址，貼到下方輸入框，即可在此頁面預覽嵌入效果。
          </p>
          <div class="flex flex-wrap gap-2 mt-3">
            <span :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
              darkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700'
            ]">
              <Instagram class="w-3 h-3" /> Instagram
            </span>
            <span :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
              darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
            ]">
              <Facebook class="w-3 h-3" /> Facebook
            </span>
            <span :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
            ]">
              <X class="w-3 h-3" /> Threads
            </span>
          </div>
        </div>

        <!-- 輸入區塊 -->
        <div class="mb-8">
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                v-model="urlInput"
                type="url"
                placeholder="貼上社群貼文網址..."
                @keydown="handleKeydown"
                :class="[
                  'w-full px-4 py-3 rounded-xl border text-sm transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                  inputError
                    ? 'border-red-400 focus:border-red-500'
                    : darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                ]"
              />
              <!-- 平台指示器 -->
              <div
                v-if="currentInputPlatform"
                class="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <component
                  :is="platformIcons[currentInputPlatform]"
                  :class="[
                    'w-5 h-5',
                    currentInputPlatform === 'instagram' ? 'text-pink-500' :
                    currentInputPlatform === 'facebook' ? 'text-blue-500' : 'text-slate-500'
                  ]"
                />
              </div>
            </div>
            <button
              @click="handleAddUrl"
              :class="[
                'px-5 py-3 rounded-xl font-medium text-sm transition-colors',
                'bg-indigo-600 text-white hover:bg-indigo-700',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50'
              ]"
            >
              加入
            </button>
          </div>
          <p v-if="inputError" class="mt-2 text-sm text-red-400">
            {{ inputError }}
          </p>
        </div>

        <!-- 嵌入貼文列表 -->
        <div v-if="embeddedUrls.length > 0" class="space-y-6">
          <div
            v-for="(embedUrl, index) in embeddedUrls"
            :key="embedUrl"
            class="relative group"
          >
            <!-- 貼文標頭 -->
            <div :class="[
              'flex items-center justify-between px-3 py-2 rounded-t-xl border-x border-t',
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
            ]">
              <div class="flex items-center gap-2">
                <component
                  :is="platformIcons[getPlatformForUrl(embedUrl)!]"
                  :class="[
                    'w-4 h-4',
                    getPlatformForUrl(embedUrl) === 'instagram' ? 'text-pink-500' :
                    getPlatformForUrl(embedUrl) === 'facebook' ? 'text-blue-500' : 'text-slate-500'
                  ]"
                />
                <span :class="['text-xs font-medium', darkMode ? 'text-slate-400' : 'text-slate-500']">
                  {{ getPlatformName(getPlatformForUrl(embedUrl)!) }}
                </span>
              </div>
              <button
                @click="handleRemoveUrl(index)"
                :class="[
                  'p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity',
                  darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                ]"
                title="移除"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- 嵌入內容 -->
            <div :class="[
              'border-x border-b rounded-b-xl overflow-hidden',
              darkMode ? 'border-slate-700' : 'border-slate-200'
            ]">
              <SocialEmbed :url="embedUrl" :dark-mode="darkMode" />
            </div>
          </div>
        </div>

        <!-- 空狀態 -->
        <div
          v-else
          :class="[
            'text-center py-16 rounded-xl border-2 border-dashed',
            darkMode ? 'border-slate-700' : 'border-slate-200'
          ]"
        >
          <Link :class="['w-12 h-12 mx-auto mb-4', darkMode ? 'text-slate-600' : 'text-slate-300']" />
          <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
            貼上社群貼文網址開始嵌入
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
