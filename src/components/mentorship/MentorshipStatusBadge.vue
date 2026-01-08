<script setup lang="ts">
import type { MentorshipStatus } from '../../types'
import { MENTORSHIP_STATUS_LABELS } from '../../types'

interface Props {
  status: MentorshipStatus
}

defineProps<Props>()

const statusColors: Record<MentorshipStatus, string> = {
  pending_mentor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pending_mentee: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}
</script>

<template>
  <span :class="[
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    statusColors[status]
  ]">
    {{ MENTORSHIP_STATUS_LABELS[status] }}
  </span>
</template>
