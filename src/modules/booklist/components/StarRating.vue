<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

interface Props {
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  readonly: false,
  size: 'md',
  showValue: false,
  darkMode: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const starSize = computed(() => {
  switch (props.size) {
    case 'sm': return 16
    case 'lg': return 28
    default: return 20
  }
})

const handleClick = (rating: number) => {
  if (props.readonly) return
  emit('update:modelValue', rating)
}

const handleMouseEnter = (rating: number) => {
  if (props.readonly) return
  hoverRating.value = rating
}

const handleMouseLeave = () => {
  hoverRating.value = 0
}

import { ref } from 'vue'
const hoverRating = ref(0)

const displayRating = computed(() => {
  return hoverRating.value || props.modelValue
})
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :class="[
        'transition-transform',
        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
      ]"
      @click="handleClick(i)"
      @mouseenter="handleMouseEnter(i)"
      @mouseleave="handleMouseLeave"
    >
      <Star
        :size="starSize"
        :class="[
          'transition-colors',
          i <= displayRating
            ? 'text-yellow-400 fill-yellow-400'
            : darkMode
              ? 'text-slate-600'
              : 'text-slate-300'
        ]"
      />
    </button>
    <span
      v-if="showValue && modelValue > 0"
      :class="[
        'ml-2 font-medium',
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
        darkMode ? 'text-slate-300' : 'text-slate-600'
      ]"
    >
      {{ modelValue.toFixed(1) }}
    </span>
  </div>
</template>
