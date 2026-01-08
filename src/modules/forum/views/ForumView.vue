<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { MessageSquare, Plus, Search, Filter, Sun, Moon, Menu } from 'lucide-vue-next'
import ForumPostCard from '../components/ForumPostCard.vue'
import ForumPostEditor from '../components/ForumPostEditor.vue'
import ForumPostDetail from '../components/ForumPostDetail.vue'
import { useForum } from '../composables/useForum'
import type { ForumCategory, ForumPostInput } from '@/types'
import { FORUM_CATEGORY_LABELS } from '@/types'

interface Props {
  userId: string
  userName: string
  userRole: string
  darkMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleDarkMode: []
  openSidebar: []
}>()

// Composable
const {
  posts,
  comments,
  currentPost,
  isLoading,
  loadPosts,
  loadPost,
  createPost,
  deletePost,
  togglePostLike,
  loadComments,
  addComment,
  deleteComment,
  toggleCommentLike
} = useForum(
  computed(() => props.userId),
  computed(() => props.userName),
  computed(() => props.userRole)
)

// State
const showEditor: Ref<boolean> = ref(false)
const showDetail: Ref<boolean> = ref(false)
const searchQuery: Ref<string> = ref('')
const filterCategory: Ref<ForumCategory | 'all'> = ref('all')

// 分類選項
const categoryOptions: { value: ForumCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  ...Object.entries(FORUM_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ForumCategory,
    label
  }))
]

// 篩選後的文章
const filteredPosts = computed(() => {
  let result = posts.value

  // 分類篩選
  if (filterCategory.value !== 'all') {
    result = result.filter(p => p.category === filterCategory.value)
  }

  // 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    )
  }

  return result
})

// Handlers
const handleCreatePost = async (data: ForumPostInput): Promise<void> => {
  const success = await createPost(data)
  if (success) {
    showEditor.value = false
  }
}

const handleViewPost = async (postId: string): Promise<void> => {
  await loadPost(postId)
  await loadComments(postId)
  showDetail.value = true
}

const handleBackToList = (): void => {
  showDetail.value = false
  currentPost.value = null
}

const handleDeletePost = async (postId: string): Promise<void> => {
  if (!confirm('確定要刪除這篇文章嗎？')) return
  const success = await deletePost(postId)
  if (success && showDetail.value) {
    showDetail.value = false
    currentPost.value = null
  }
}

const handleAddComment = async (content: string, parentId?: string): Promise<void> => {
  if (!currentPost.value) return
  await addComment({
    postId: currentPost.value.id,
    content,
    parentId
  })
}

const handleDeleteComment = async (commentId: string): Promise<void> => {
  if (!confirm('確定要刪除這則留言嗎？')) return
  await deleteComment(commentId)
}

// Init
onMounted(() => {
  loadPosts()
})
</script>

<template>
  <!-- 文章詳情頁 -->
  <ForumPostDetail
    v-if="showDetail && currentPost"
    :post="currentPost"
    :comments="comments"
    :current-user-id="userId"
    :current-user-name="userName"
    :current-user-role="userRole"
    :dark-mode="darkMode"
    :is-loading="isLoading"
    @back="handleBackToList"
    @like="togglePostLike"
    @delete="handleDeletePost"
    @add-comment="handleAddComment"
    @like-comment="toggleCommentLike"
    @delete-comment="handleDeleteComment"
  />

  <!-- 主列表頁 -->
  <div v-else :class="['flex-1 flex flex-col h-full overflow-hidden', darkMode ? 'bg-slate-950' : 'bg-slate-50']">
    <!-- Header -->
    <header :class="[
      'h-16 border-b flex items-center px-4 justify-between flex-shrink-0 z-10 shadow-sm',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    ]">
      <div class="flex items-center gap-3">
        <button @click="emit('openSidebar')" class="md:hidden p-2 text-slate-500">
          <Menu class="w-6 h-6" />
        </button>
        <div class="flex items-center gap-2">
          <MessageSquare class="w-5 h-5 text-indigo-500" />
          <h2 :class="['font-bold text-lg', darkMode ? 'text-white' : 'text-slate-800']">
            社群論壇
          </h2>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- 發布按鈕 -->
        <button
          @click="showEditor = true"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            'bg-indigo-600 text-white hover:bg-indigo-700'
          ]"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">發布議題</span>
        </button>

        <!-- Dark Mode 切換 -->
        <button
          @click="emit('toggleDarkMode')"
          :class="[
            'p-2 rounded-full transition-all',
            darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
          :title="darkMode ? '切換至淺色模式' : '切換至深色模式'"
        >
          <Sun v-if="darkMode" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 篩選區 -->
    <div :class="[
      'px-4 py-3 border-b flex flex-col sm:flex-row gap-3',
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    ]">
      <!-- 搜尋 -->
      <div class="relative flex-1">
        <Search :class="[
          'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
          darkMode ? 'text-slate-500' : 'text-slate-400'
        ]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋文章..."
          :class="[
            'w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all outline-none',
            darkMode
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
          ]"
        />
      </div>

      <!-- 分類篩選 -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Filter :class="['w-4 h-4 flex-shrink-0', darkMode ? 'text-slate-500' : 'text-slate-400']" />
        <button
          v-for="cat in categoryOptions"
          :key="cat.value"
          @click="filterCategory = cat.value"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
            filterCategory === cat.value
              ? 'bg-indigo-600 text-white'
              : (darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
          ]"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="isLoading" class="flex items-center justify-center h-40">
        <div :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
          載入中...
        </div>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="flex flex-col items-center justify-center h-40 gap-4">
        <MessageSquare :class="['w-12 h-12', darkMode ? 'text-slate-700' : 'text-slate-300']" />
        <p :class="['text-sm', darkMode ? 'text-slate-500' : 'text-slate-400']">
          {{ searchQuery || filterCategory !== 'all' ? '沒有符合條件的文章' : '還沒有任何議題，來發布第一篇吧！' }}
        </p>
        <button
          v-if="!searchQuery && filterCategory === 'all'"
          @click="showEditor = true"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            'bg-indigo-600 text-white hover:bg-indigo-700'
          ]"
        >
          <Plus class="w-4 h-4" />
          發布議題
        </button>
      </div>

      <div v-else class="max-w-3xl mx-auto space-y-4">
        <ForumPostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          :current-user-id="userId"
          :dark-mode="darkMode"
          @click="handleViewPost(post.id)"
          @like="togglePostLike"
          @delete="handleDeletePost"
        />
      </div>
    </div>
  </div>

  <!-- 發布 Modal -->
  <Teleport to="body">
    <div
      v-if="showEditor"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="showEditor = false"
      />

      <!-- Editor -->
      <ForumPostEditor
        :dark-mode="darkMode"
        class="relative z-10"
        @save="handleCreatePost"
        @cancel="showEditor = false"
      />
    </div>
  </Teleport>
</template>
