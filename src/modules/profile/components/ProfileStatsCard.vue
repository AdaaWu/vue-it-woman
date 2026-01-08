<script setup lang="ts">
import { MessageSquare, Users, BookOpen, ShoppingBag, TrendingUp } from 'lucide-vue-next'
import type { UserStats } from '@/types'

interface Props {
  stats: UserStats
  darkMode: boolean
}

defineProps<Props>()

const statItems = [
  { key: 'forumPosts', label: '發文', icon: MessageSquare, color: 'text-blue-500' },
  { key: 'forumComments', label: '討論', icon: MessageSquare, color: 'text-indigo-500' },
  { key: 'mentorshipActive', label: '導師', icon: Users, color: 'text-purple-500' },
  { key: 'booksReviewed', label: '書評', icon: BookOpen, color: 'text-green-500' },
  { key: 'marketplaceListings', label: '刊登', icon: ShoppingBag, color: 'text-amber-500' },
  { key: 'marketplaceSold', label: '已售', icon: ShoppingBag, color: 'text-teal-500' }
] as const
</script>

<template>
  <div :class="[
    'rounded-2xl border p-4',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <TrendingUp :class="['w-5 h-5', darkMode ? 'text-indigo-400' : 'text-indigo-600']" />
      <h3 :class="['font-bold', darkMode ? 'text-white' : 'text-slate-800']">
        社群參與
      </h3>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="item in statItems"
        :key="item.key"
        :class="[
          'text-center p-3 rounded-xl',
          darkMode ? 'bg-slate-800' : 'bg-slate-50'
        ]"
      >
        <component :is="item.icon" :class="['w-5 h-5 mx-auto mb-1', item.color]" />
        <p :class="['text-lg font-bold', darkMode ? 'text-white' : 'text-slate-800']">
          {{ stats[item.key] }}
        </p>
        <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ item.label }}
        </p>
      </div>
    </div>
  </div>
</template>
