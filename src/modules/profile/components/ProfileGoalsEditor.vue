<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { Plus, Check, Trash2, Target, Calendar } from 'lucide-vue-next'
import type { UserGoal } from '@/types'

interface Props {
  goals: UserGoal[]
  darkMode: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  add: [goal: Omit<UserGoal, 'id' | 'createdAt'>]
  toggle: [goalId: string]
  delete: [goalId: string]
}>()

const newGoalText: Ref<string> = ref('')
const newGoalDeadline: Ref<string> = ref('')
const showInput: Ref<boolean> = ref(false)

const completedCount = computed(() => props.goals.filter(g => g.isCompleted).length)
const progressPercent = computed(() => {
  if (props.goals.length === 0) return 0
  return Math.round((completedCount.value / props.goals.length) * 100)
})

const handleAdd = (): void => {
  if (!newGoalText.value.trim()) return
  emit('add', {
    content: newGoalText.value.trim(),
    deadline: newGoalDeadline.value || undefined,
    isCompleted: false
  })
  newGoalText.value = ''
  newGoalDeadline.value = ''
  showInput.value = false
}

const formatDeadline = (deadline?: string): string => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / 86400000)

  if (days < 0) return '已過期'
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days < 7) return `${days} 天後`
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

const isOverdue = (deadline?: string): boolean => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}
</script>

<template>
  <div :class="[
    'rounded-2xl border p-4',
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  ]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Target :class="['w-5 h-5', darkMode ? 'text-indigo-400' : 'text-indigo-600']" />
        <h3 :class="['font-bold', darkMode ? 'text-white' : 'text-slate-800']">
          目前目標
        </h3>
        <span v-if="goals.length > 0" :class="['text-xs px-2 py-0.5 rounded-full', darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500']">
          {{ completedCount }}/{{ goals.length }}
        </span>
      </div>
      <button
        v-if="editable && !showInput"
        @click="showInput = true"
        :class="[
          'p-1.5 rounded-lg transition-colors',
          darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
        ]"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>

    <!-- Progress Bar -->
    <div v-if="goals.length > 0" class="mb-4">
      <div :class="['h-2 rounded-full overflow-hidden', darkMode ? 'bg-slate-800' : 'bg-slate-100']">
        <div
          class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <p :class="['text-xs mt-1 text-right', darkMode ? 'text-slate-500' : 'text-slate-400']">
        {{ progressPercent }}% 完成
      </p>
    </div>

    <!-- Add Goal Input -->
    <div v-if="showInput && editable" :class="[
      'mb-4 p-3 rounded-xl border',
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
    ]">
      <input
        v-model="newGoalText"
        type="text"
        placeholder="輸入新目標..."
        :class="[
          'w-full px-3 py-2 rounded-lg border text-sm outline-none',
          darkMode
            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
            : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
        ]"
        @keyup.enter="handleAdd"
      />
      <div class="flex items-center gap-2 mt-2">
        <div class="flex items-center gap-1 flex-1">
          <Calendar :class="['w-4 h-4', darkMode ? 'text-slate-500' : 'text-slate-400']" />
          <input
            v-model="newGoalDeadline"
            type="date"
            :class="[
              'flex-1 px-2 py-1 rounded-lg border text-xs outline-none',
              darkMode
                ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'
            ]"
          />
        </div>
        <button
          @click="showInput = false"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium',
            darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'
          ]"
        >
          取消
        </button>
        <button
          @click="handleAdd"
          :disabled="!newGoalText.trim()"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            newGoalText.trim()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
          ]"
        >
          新增
        </button>
      </div>
    </div>

    <!-- Goals List -->
    <div v-if="goals.length > 0" class="space-y-2">
      <div
        v-for="goal in goals"
        :key="goal.id"
        :class="[
          'flex items-start gap-3 p-3 rounded-xl transition-all',
          goal.isCompleted
            ? (darkMode ? 'bg-slate-800/50' : 'bg-slate-50')
            : (darkMode ? 'bg-slate-800' : 'bg-white border border-slate-100')
        ]"
      >
        <!-- Checkbox -->
        <button
          v-if="editable"
          @click="emit('toggle', goal.id)"
          :class="[
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            goal.isCompleted
              ? 'bg-green-500 border-green-500'
              : (darkMode ? 'border-slate-600 hover:border-indigo-500' : 'border-slate-300 hover:border-indigo-500')
          ]"
        >
          <Check v-if="goal.isCompleted" class="w-3 h-3 text-white" />
        </button>
        <div v-else :class="[
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          goal.isCompleted ? 'bg-green-500' : (darkMode ? 'bg-slate-700' : 'bg-slate-200')
        ]">
          <Check v-if="goal.isCompleted" class="w-3 h-3 text-white" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p :class="[
            'text-sm',
            goal.isCompleted
              ? (darkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through')
              : (darkMode ? 'text-white' : 'text-slate-800')
          ]">
            {{ goal.content }}
          </p>
          <p v-if="goal.deadline" :class="[
            'text-xs mt-1 flex items-center gap-1',
            isOverdue(goal.deadline) && !goal.isCompleted
              ? 'text-red-500'
              : (darkMode ? 'text-slate-500' : 'text-slate-400')
          ]">
            <Calendar class="w-3 h-3" />
            {{ formatDeadline(goal.deadline) }}
          </p>
        </div>

        <!-- Delete -->
        <button
          v-if="editable"
          @click="emit('delete', goal.id)"
          :class="[
            'p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all',
            darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-slate-700' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
          ]"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!editable" :class="['text-center py-6', darkMode ? 'text-slate-500' : 'text-slate-400']">
      <Target class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm">尚未設定目標</p>
    </div>
  </div>
</template>
