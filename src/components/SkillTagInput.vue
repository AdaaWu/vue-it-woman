<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { SKILL_TAGS } from '../types'

interface Props {
  modelValue: string[]
  darkMode: boolean
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxTags: 10
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const customInput: Ref<string> = ref('')
const showSuggestions: Ref<boolean> = ref(false)

const canAddMore = computed<boolean>(() => props.modelValue.length < props.maxTags)

const availableTags = computed<string[]>(() =>
  SKILL_TAGS.filter(tag => !props.modelValue.includes(tag))
)

const filteredSuggestions = computed<string[]>(() => {
  if (!customInput.value.trim()) return availableTags.value.slice(0, 12)
  const query = customInput.value.toLowerCase()
  return availableTags.value.filter(tag =>
    tag.toLowerCase().includes(query)
  ).slice(0, 8)
})

const addTag = (tag: string): void => {
  if (!canAddMore.value) return
  if (props.modelValue.includes(tag)) return
  emit('update:modelValue', [...props.modelValue, tag])
  customInput.value = ''
}

const addCustomTag = (): void => {
  const tag = customInput.value.trim()
  if (!tag || !canAddMore.value) return
  if (props.modelValue.includes(tag)) {
    customInput.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, tag])
  customInput.value = ''
}

const removeTag = (tag: string): void => {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}

const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (filteredSuggestions.value.length > 0 && customInput.value) {
      addTag(filteredSuggestions.value[0])
    } else if (customInput.value.trim()) {
      addCustomTag()
    }
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- 已選標籤 -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in modelValue"
        :key="tag"
        :class="[
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all',
          darkMode
            ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700'
            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
        ]"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(tag)"
          :class="[
            'p-0.5 rounded-full transition-colors',
            darkMode ? 'hover:bg-indigo-800' : 'hover:bg-indigo-200'
          ]"
        >
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>

    <!-- 輸入區 -->
    <div v-if="canAddMore" class="relative">
      <div class="flex gap-2">
        <input
          v-model="customInput"
          type="text"
          :placeholder="modelValue.length === 0 ? '輸入或選擇技能標籤...' : '新增更多標籤...'"
          @focus="showSuggestions = true"
          @blur="setTimeout(() => showSuggestions = false, 200)"
          @keydown="handleKeydown"
          :class="[
            'flex-1 px-4 py-2 rounded-lg border text-sm transition-all outline-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
        <button
          v-if="customInput.trim()"
          type="button"
          @click="addCustomTag"
          :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-all',
            darkMode
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          ]"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>

      <!-- 建議標籤 -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        :class="[
          'absolute z-10 w-full mt-2 p-2 rounded-lg border shadow-lg max-h-48 overflow-y-auto',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        ]"
      >
        <p :class="['text-xs mb-2', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ customInput ? '符合的標籤' : '熱門技能' }}
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in filteredSuggestions"
            :key="tag"
            type="button"
            @mousedown.prevent="addTag(tag)"
            :class="[
              'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              darkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-indigo-900/50 hover:text-indigo-300'
                : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- 數量提示 -->
    <p :class="['text-xs', darkMode ? 'text-slate-500' : 'text-slate-400']">
      {{ modelValue.length }}/{{ maxTags }} 個標籤
    </p>
  </div>
</template>
