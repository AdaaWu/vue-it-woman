<script setup lang="ts">
import { watch } from 'vue'
import UserProfileCard from './UserProfileCard.vue'
import UserProfileEditor from './UserProfileEditor.vue'
import type { UserProfile, UserProfileInput } from '../types'

interface Props {
  show: boolean
  profile: UserProfile | null
  darkMode: boolean
  mode: 'view' | 'edit'
  isOwnProfile: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: UserProfileInput]
  switchToEdit: []
}>()

// 阻止背景滾動
watch(() => props.show, (isShow) => {
  if (isShow) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleBackdropClick = (e: MouseEvent): void => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const handleSave = (data: UserProfileInput): void => {
  emit('save', data)
}

const handleEdit = (): void => {
  emit('switchToEdit')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <!-- Modal 內容 -->
        <div class="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
          <!-- 檢視模式 -->
          <UserProfileCard
            v-if="mode === 'view' && profile"
            :profile="profile"
            :dark-mode="darkMode"
            :is-own-profile="isOwnProfile"
            @close="emit('close')"
            @edit="handleEdit"
          />

          <!-- 編輯模式 -->
          <UserProfileEditor
            v-else-if="mode === 'edit'"
            :profile="profile"
            :dark-mode="darkMode"
            @save="handleSave"
            @cancel="emit('close')"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-in {
  animation-duration: 200ms;
  animation-fill-mode: both;
}

.zoom-in-95 {
  animation-name: zoom-in-95;
}

.fade-in {
  animation-name: fade-in;
}

@keyframes zoom-in-95 {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
