<script setup lang="ts">
import { X, Pencil, Users, MessageSquare, BookOpen, ShoppingBag, Link } from 'lucide-vue-next'
import type { Channel, UserProfile } from '@/types'

interface Props {
  darkMode: boolean
  mockMode: boolean
  isSidebarOpen: boolean
  userProfile: UserProfile | null
  channels: Channel[]
  currentChannel: string
  currentView: 'chat' | 'mentorship' | 'forum' | 'booklist' | 'marketplace' | 'profile' | 'social-embed'
  pendingRequestsCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  selectChannel: [channelId: string]
  selectMentorship: []
  selectForum: []
  selectBooklist: []
  selectMarketplace: []
  selectSocialEmbed: []
  openProfile: []
}>()
</script>

<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-30 w-72 transform transition-all duration-300 ease-in-out border-r',
    'md:relative md:translate-x-0',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
  ]">
    <div class="h-full flex flex-col">
      <!-- Logo -->
      <div :class="['p-6 border-b flex items-center gap-3', darkMode ? 'border-slate-800' : 'border-slate-200']">
        <div class="bg-indigo-600 w-11 h-11 rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center">
          <span class="text-white font-bold text-sm tracking-wide">&lt;/&gt;</span>
        </div>
        <h1 class="font-extrabold text-2xl tracking-tight flex items-baseline">
          <span :class="darkMode ? 'text-slate-100' : 'text-slate-800'">IT</span>
          <span class="text-indigo-600 ml-0.5 relative">
            Her
            <span class="absolute -right-3 bottom-1 w-2 h-2 bg-indigo-400 rounded-full"></span>
          </span>
        </h1>
        <button @click="emit('close')" class="md:hidden ml-auto p-1 text-slate-400">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- 用戶資訊 -->
      <button
        @click="emit('openProfile')"
        :class="[
          'p-4 mx-4 mt-4 border rounded-xl shadow-sm transition-all text-left group',
          darkMode
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'
            : 'bg-white border-slate-200 hover:bg-slate-50'
        ]"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
            {{ userProfile?.nickname?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="overflow-hidden flex-1">
            <p class="font-semibold text-sm truncate">{{ userProfile?.nickname }}</p>
            <p class="text-xs text-indigo-400 font-medium truncate">{{ userProfile?.role }}</p>
          </div>
          <Pencil :class="[
            'w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity',
            darkMode ? 'text-slate-500' : 'text-slate-400'
          ]" />
        </div>
        <!-- 職位顯示 -->
        <p v-if="userProfile?.title" :class="['text-xs mt-2 truncate', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ userProfile.title }}
        </p>
        <!-- 技能標籤 (最多顯示3個) -->
        <div v-if="userProfile?.skills && userProfile.skills.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="skill in userProfile.skills.slice(0, 3)"
            :key="skill"
            :class="[
              'px-1.5 py-0.5 rounded text-[10px] font-medium',
              darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
            ]"
          >
            {{ skill }}
          </span>
          <span
            v-if="userProfile.skills.length > 3"
            :class="['text-[10px]', darkMode ? 'text-slate-500' : 'text-slate-400']"
          >
            +{{ userProfile.skills.length - 3 }}
          </span>
        </div>
      </button>

      <!-- Demo 模式標示 -->
      <div v-if="mockMode" class="mx-4 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p class="text-xs text-amber-500 text-center">Demo 模式</p>
      </div>

      <!-- 頻道列表 -->
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">討論頻道</p>
        <button
          v-for="channel in channels"
          :key="channel.id"
          @click="emit('selectChannel', channel.id)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'chat' && currentChannel === channel.id
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <component :is="channel.icon" :class="['w-5 h-5', currentView === 'chat' && currentChannel === channel.id ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">{{ channel.name }}</span>
        </button>

        <!-- 社群功能 -->
        <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">社群功能</p>

        <!-- 論壇 -->
        <button
          @click="emit('selectForum')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'forum'
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <MessageSquare :class="['w-5 h-5', currentView === 'forum' ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">社群論壇</span>
        </button>

        <!-- 導師計畫 -->
        <button
          @click="emit('selectMentorship')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'mentorship'
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <Users :class="['w-5 h-5', currentView === 'mentorship' ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">導師計畫</span>
          <span
            v-if="pendingRequestsCount > 0"
            class="px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white"
          >
            {{ pendingRequestsCount }}
          </span>
        </button>

        <!-- 議題書單 -->
        <button
          @click="emit('selectBooklist')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'booklist'
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <BookOpen :class="['w-5 h-5', currentView === 'booklist' ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">議題書單</span>
        </button>

        <!-- 二手物交流 -->
        <button
          @click="emit('selectMarketplace')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'marketplace'
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <ShoppingBag :class="['w-5 h-5', currentView === 'marketplace' ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">二手物交流</span>
        </button>

        <!-- 社群貼文嵌入 -->
        <button
          @click="emit('selectSocialEmbed')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
            currentView === 'social-embed'
              ? (darkMode ? 'bg-indigo-900/40 text-indigo-300 shadow-sm' : 'bg-indigo-50 text-indigo-700 shadow-sm')
              : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100')
          ]"
        >
          <Link :class="['w-5 h-5', currentView === 'social-embed' ? 'text-indigo-500' : 'text-slate-500']" />
          <span class="flex-1 text-left">社群貼文</span>
        </button>
      </nav>
    </div>
  </aside>
</template>
