<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { parseSocialUrl, getPlatformName, type SocialPlatform, type ParsedSocialUrl } from '@/shared/utils/socialUrlParser'
import { Loader2, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  url: string
  darkMode?: boolean
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const isShortUrl = ref(false)
const platform = ref<SocialPlatform | null>(null)
const cleanedUrl = ref<string>('')

// SDK 載入狀態追蹤
const sdkLoaded = {
  instagram: false,
  facebook: false,
  threads: false
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
    FB?: {
      init: (params: { xfbml: boolean; version: string }) => void
      XFBML: { parse: (element?: HTMLElement) => void }
    }
    fbAsyncInit?: () => void
  }
}

function loadInstagramSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.instgrm) {
      resolve()
      return
    }

    if (sdkLoaded.instagram) {
      // 等待已經在載入的 SDK
      const checkInterval = setInterval(() => {
        if (window.instgrm) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    sdkLoaded.instagram = true
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Instagram SDK'))
    document.body.appendChild(script)
  })
}

function loadFacebookSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve()
      return
    }

    if (sdkLoaded.facebook) {
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    sdkLoaded.facebook = true

    // 確保 fb-root 存在
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div')
      fbRoot.id = 'fb-root'
      document.body.prepend(fbRoot)
    }

    // 設定 FB 初始化回調
    window.fbAsyncInit = () => {
      window.FB?.init({
        xfbml: true,
        version: 'v18.0'
      })
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/zh_TW/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'))
    document.body.appendChild(script)
  })
}

function loadThreadsSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (sdkLoaded.threads) {
      resolve()
      return
    }

    sdkLoaded.threads = true
    const script = document.createElement('script')
    script.src = 'https://www.threads.net/embed.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Threads SDK'))
    document.body.appendChild(script)
  })
}

async function renderEmbed() {
  const parsed = parseSocialUrl(props.url)
  if (!parsed) {
    hasError.value = true
    isLoading.value = false
    return
  }

  platform.value = parsed.platform
  cleanedUrl.value = parsed.url
  isShortUrl.value = parsed.isShortUrl || false
  isLoading.value = true
  hasError.value = false

  // 如果是 Facebook 短網址，顯示提示而非嘗試嵌入
  if (parsed.isShortUrl) {
    isLoading.value = false
    return
  }

  try {
    await nextTick()

    if (parsed.platform === 'instagram') {
      await loadInstagramSDK()
      // 給 DOM 一點時間
      await new Promise(resolve => setTimeout(resolve, 100))
      window.instgrm?.Embeds.process()
    } else if (parsed.platform === 'facebook') {
      await loadFacebookSDK()
      await new Promise(resolve => setTimeout(resolve, 100))
      if (containerRef.value) {
        window.FB?.XFBML.parse(containerRef.value)
      }
    } else if (parsed.platform === 'threads') {
      await loadThreadsSDK()
    }

    // 設定載入完成（給嵌入框一些渲染時間）
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  } catch (e) {
    console.error('Failed to load embed:', e)
    hasError.value = true
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.url) {
    renderEmbed()
  }
})

watch(() => props.url, (newUrl) => {
  if (newUrl) {
    renderEmbed()
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'social-embed-container relative min-h-[200px] rounded-xl overflow-hidden',
      darkMode ? 'bg-slate-800' : 'bg-slate-100'
    ]"
  >
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
        <p :class="['text-sm', darkMode ? 'text-slate-400' : 'text-slate-500']">
          載入 {{ platform ? getPlatformName(platform) : '' }} 貼文中...
        </p>
      </div>
    </div>

    <!-- Short URL Warning -->
    <div
      v-else-if="isShortUrl"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3 text-center px-4 max-w-md">
        <AlertCircle class="w-10 h-10 text-amber-400" />
        <p :class="['text-sm font-medium', darkMode ? 'text-slate-300' : 'text-slate-600']">
          Facebook 短網址無法直接嵌入
        </p>
        <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
          請到 Facebook 貼文頁面，點擊右上角「...」→「嵌入」，複製完整的貼文網址
        </p>
        <a
          :href="url"
          target="_blank"
          rel="noopener"
          class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          前往 Facebook 查看
        </a>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hasError"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-3 text-center px-4">
        <AlertCircle class="w-10 h-10 text-red-400" />
        <p :class="['text-sm', darkMode ? 'text-slate-300' : 'text-slate-600']">
          無法載入此貼文
        </p>
        <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
          請確認連結是否正確，且為公開貼文
        </p>
      </div>
    </div>

    <!-- Instagram Embed -->
    <blockquote
      v-if="platform === 'instagram' && !hasError && !isShortUrl"
      class="instagram-media"
      :data-instgrm-permalink="cleanedUrl"
      data-instgrm-version="14"
      :style="{ visibility: isLoading ? 'hidden' : 'visible' }"
    >
      <a :href="cleanedUrl" target="_blank" rel="noopener">載入中...</a>
    </blockquote>

    <!-- Facebook Embed -->
    <div
      v-else-if="platform === 'facebook' && !hasError && !isShortUrl"
      class="fb-post"
      :data-href="cleanedUrl"
      data-width="500"
      :style="{ visibility: isLoading ? 'hidden' : 'visible' }"
    />

    <!-- Threads Embed -->
    <blockquote
      v-else-if="platform === 'threads' && !hasError && !isShortUrl"
      class="text-post-media"
      :data-text-post-permalink="cleanedUrl"
      data-text-post-version="0"
      :style="{ visibility: isLoading ? 'hidden' : 'visible' }"
    >
      <a :href="cleanedUrl" target="_blank" rel="noopener">載入中...</a>
    </blockquote>
  </div>
</template>

<style scoped>
.social-embed-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
}

.social-embed-container :deep(iframe) {
  max-width: 100% !important;
  border-radius: 0.5rem;
}

.instagram-media,
.fb-post,
.text-post-media {
  margin: 0 auto !important;
  max-width: 540px !important;
  width: 100% !important;
}
</style>
