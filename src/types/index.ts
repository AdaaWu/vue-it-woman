import type { Component } from 'vue'

// 訊息類型
export interface Message {
  id: string
  channelId: string
  text: string
  userName: string
  userRole: string
  userId: string
  timestamp: {
    seconds: number
    toMillis?: () => number
  } | null
  type?: string
}

// 使用者資料 (基本)
export interface UserData {
  nickname: string
  role: string
}

// 使用者個人檔案 (完整)
export interface UserProfile {
  userId: string
  nickname: string
  role: string
  title: string
  bio: string
  skills: string[]
  createdAt: {
    seconds: number
    toMillis?: () => number
  } | null
  updatedAt: {
    seconds: number
    toMillis?: () => number
  } | null
}

// 個人檔案輸入 (不含系統欄位)
export interface UserProfileInput {
  nickname: string
  role: string
  title?: string
  bio?: string
  skills?: string[]
}

// 預設技能標籤
export const SKILL_TAGS: string[] = [
  // 前端
  'Vue.js', 'React', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Next.js',
  // 後端
  'Node.js', 'Python', 'Go', 'Java', 'C#', 'Ruby', 'PHP', 'Rust',
  // 資料庫
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase',
  // 雲端/DevOps
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
  // 行動開發
  'iOS', 'Android', 'React Native', 'Flutter',
  // 其他
  'Machine Learning', 'Data Science', 'UI/UX', 'Agile/Scrum', 'Product Management'
]

// 職業角色選項
export const ROLE_OPTIONS: string[] = [
  'Guest', 'Frontend Dev', 'Backend Dev', 'Fullstack', 'Mobile Dev',
  'Data Scientist', 'Product Manager', 'UI/UX Designer',
  'QA Engineer', 'Engineering Manager', 'Student/Learner'
]

// Firebase 使用者
export interface FirebaseUser {
  uid: string
}

// 頻道類型
export interface Channel {
  id: string
  name: string
  icon: Component
  desc: string
}

// Emoji 分類
export interface EmojiCategory {
  cat: string
  emojis: string[]
}

// ===== 導師計畫類型 =====

// Firebase Timestamp 類型
export interface FirebaseTimestamp {
  seconds: number
  toMillis?: () => number
}

// 導師資料
export interface MentorProfile {
  isAvailable: boolean
  teachingAreas: string[]
  maxMentees: number
  introduction: string
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

export interface MentorProfileInput {
  isAvailable: boolean
  teachingAreas: string[]
  maxMentees: number
  introduction: string
}

// 學員資料
export interface MenteeProfile {
  isLooking: boolean
  learningGoals: string[]
  currentLevel: string
  expectations: string
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

export interface MenteeProfileInput {
  isLooking: boolean
  learningGoals: string[]
  currentLevel: string
  expectations: string
}

// 配對狀態
export type MentorshipStatus =
  | 'pending_mentor'   // 等待導師接受
  | 'pending_mentee'   // 等待學員接受
  | 'active'           // 配對中
  | 'completed'        // 已結束
  | 'rejected'         // 已拒絕

// 配對關係
export interface Mentorship {
  id: string
  mentorId: string
  menteeId: string
  status: MentorshipStatus
  initiatedBy: string
  areas: string[]
  message: string
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
  acceptedAt?: FirebaseTimestamp | null
  completedAt?: FirebaseTimestamp | null
  rejectionReason?: string
  // 快取的用戶資料
  mentorName?: string
  menteeName?: string
}

export interface MentorshipRequest {
  targetUserId: string
  areas: string[]
  message: string
}

// 發布類型
export type MentorPostType = 'offer' | 'request'
export type MentorPostStatus = 'active' | 'paused' | 'closed'

// 導師/學員發布
export interface MentorPost {
  id: string
  userId: string
  type: MentorPostType
  title: string
  areas: string[]
  description: string
  status: MentorPostStatus
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
  // 快取的用戶資料
  userName?: string
  userRole?: string
}

export interface MentorPostInput {
  type: MentorPostType
  title: string
  areas: string[]
  description: string
}

// 擴展 UserProfile (含導師/學員資料)
export interface UserProfileWithMentorship extends UserProfile {
  mentorProfile?: MentorProfile
  menteeProfile?: MenteeProfile
}

// 程度選項
export const LEVEL_OPTIONS: string[] = [
  '完全初學者',
  '有基礎概念',
  '初級 (0-1年經驗)',
  '中級 (1-3年經驗)',
  '資深 (3年以上)'
]

// 導師最大學員數選項
export const MAX_MENTEES_OPTIONS: number[] = [1, 2, 3, 5]

// 配對狀態標籤
export const MENTORSHIP_STATUS_LABELS: Record<MentorshipStatus, string> = {
  pending_mentor: '等待導師回應',
  pending_mentee: '等待學員回應',
  active: '配對中',
  completed: '已結束',
  rejected: '已拒絕'
}

// ===== 論壇類型 =====

// 論壇分類
export type ForumCategory = 'tech' | 'career' | 'life' | 'learning' | 'other'

// 論壇分類標籤
export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  tech: '技術討論',
  career: '職涯分享',
  life: '生活點滴',
  learning: '學習心得',
  other: '其他話題'
}

// 貼文狀態
export type ForumPostStatus = 'active' | 'closed' | 'deleted'

// 論壇貼文
export interface ForumPost {
  id: string
  userId: string
  userName: string
  userRole: string
  category: ForumCategory
  title: string
  content: string
  tags: string[]
  status: ForumPostStatus
  viewCount: number
  likeCount: number
  commentCount: number
  likedBy: string[]
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 論壇貼文輸入
export interface ForumPostInput {
  category: ForumCategory
  title: string
  content: string
  tags: string[]
}

// 留言
export interface ForumComment {
  id: string
  postId: string
  userId: string
  userName: string
  userRole: string
  content: string
  likeCount: number
  likedBy: string[]
  parentId?: string  // 回覆其他留言時使用
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 留言輸入
export interface ForumCommentInput {
  postId: string
  content: string
  parentId?: string
}

// ===== 書單系統類型 =====

// 書籍分類
export type BookCategory = 'tech' | 'career' | 'self-growth' | 'business' | 'life' | 'other'

// 書籍分類標籤
export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  tech: '技術書籍',
  career: '職涯發展',
  'self-growth': '自我成長',
  business: '商業管理',
  life: '生活風格',
  other: '其他類型'
}

// 閱讀狀態
export type ReadingStatus = 'want-to-read' | 'reading' | 'finished'

// 閱讀狀態標籤
export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  'want-to-read': '想讀',
  reading: '閱讀中',
  finished: '已讀完'
}

// 書籍資料
export interface Book {
  id: string
  userId: string
  userName: string
  userRole: string
  title: string
  author: string
  category: BookCategory
  coverUrl?: string
  description: string
  tags: string[]
  // 統計
  avgRating: number
  reviewCount: number
  wantToReadCount: number
  readingCount: number
  finishedCount: number
  shareCount: number
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 書籍輸入
export interface BookInput {
  title: string
  author: string
  category: BookCategory
  coverUrl?: string
  description: string
  tags: string[]
}

// 書評/評分
export interface BookReview {
  id: string
  bookId: string
  userId: string
  userName: string
  userRole: string
  rating: number  // 1-5 星
  content: string
  readingStatus: ReadingStatus
  likeCount: number
  likedBy: string[]
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 書評輸入
export interface BookReviewInput {
  bookId: string
  rating: number
  content: string
  readingStatus: ReadingStatus
}

// 書籍分享
export interface BookShare {
  id: string
  bookId: string
  userId: string
  userName: string
  platform: 'copy-link' | 'twitter' | 'facebook' | 'line'
  createdAt: FirebaseTimestamp | null
}

// 使用者閱讀進度 (個人書單)
export interface UserBookProgress {
  id: string
  userId: string
  bookId: string
  status: ReadingStatus
  myRating?: number
  notes?: string
  startedAt?: FirebaseTimestamp | null
  finishedAt?: FirebaseTimestamp | null
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 閱讀成就徽章
export type ReadingBadge =
  | 'first-book'      // 第一本書
  | 'bookworm-10'     // 讀完 10 本
  | 'bookworm-50'     // 讀完 50 本
  | 'reviewer'        // 寫過 5 則書評
  | 'influencer'      // 書評被按讚 10 次
  | 'sharer'          // 分享過 5 本書

// 閱讀徽章標籤
export const READING_BADGE_LABELS: Record<ReadingBadge, { name: string; icon: string; desc: string }> = {
  'first-book': { name: '初心者', icon: '📖', desc: '完成第一本書' },
  'bookworm-10': { name: '書蟲', icon: '📚', desc: '讀完 10 本書' },
  'bookworm-50': { name: '博學者', icon: '🎓', desc: '讀完 50 本書' },
  reviewer: { name: '評論家', icon: '✍️', desc: '寫過 5 則書評' },
  influencer: { name: '意見領袖', icon: '⭐', desc: '書評累計獲得 10 個讚' },
  sharer: { name: '分享達人', icon: '🔗', desc: '分享過 5 本書' }
}

// 使用者閱讀統計
export interface UserReadingStats {
  userId: string
  totalBooks: number
  finishedBooks: number
  reviewsWritten: number
  likesReceived: number
  sharesCount: number
  badges: ReadingBadge[]
  updatedAt: FirebaseTimestamp | null
}

// ===== 二手物拍賣系統類型 =====

// 商品分類
export type MarketplaceCategory = 'electronics' | 'books' | 'clothing' | 'furniture' | 'sports' | 'beauty' | 'other'

// 商品分類標籤
export const MARKETPLACE_CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  electronics: '3C電子',
  books: '書籍教材',
  clothing: '服飾配件',
  furniture: '居家生活',
  sports: '運動休閒',
  beauty: '美妝保養',
  other: '其他'
}

// 商品狀態
export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'

// 商品狀態標籤
export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  new: '全新',
  'like-new': '近全新',
  good: '良好',
  fair: '普通',
  poor: '瑕疵品'
}

// 刊登狀態
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'closed'

// 刊登狀態標籤
export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: '販售中',
  reserved: '已預訂',
  sold: '已售出',
  closed: '已下架'
}

// 面交地點選項
export const TRADE_LOCATION_OPTIONS: string[] = [
  '台北車站',
  '捷運站面交',
  '公司附近',
  '超商取貨',
  '郵寄',
  '其他（私訊詳談）'
]

// 二手商品
export interface MarketplaceItem {
  id: string
  userId: string
  userName: string
  userRole: string
  title: string
  description: string
  category: MarketplaceCategory
  condition: ItemCondition
  price: number
  originalPrice?: number  // 原價（選填）
  images: string[]        // 圖片 URL 列表
  tradeLocation: string   // 面交地點
  status: ListingStatus
  viewCount: number
  wishlistCount: number   // 收藏數
  commentCount: number
  createdAt: FirebaseTimestamp | null
  updatedAt: FirebaseTimestamp | null
}

// 商品輸入
export interface MarketplaceItemInput {
  title: string
  description: string
  category: MarketplaceCategory
  condition: ItemCondition
  price: number
  originalPrice?: number
  images: string[]
  tradeLocation: string
}

// 商品留言（詢問/回應）
export interface MarketplaceComment {
  id: string
  itemId: string
  userId: string
  userName: string
  userRole: string
  content: string
  isSellerReply: boolean  // 是否為賣家回覆
  parentId?: string       // 回覆其他留言時使用
  createdAt: FirebaseTimestamp | null
}

// 留言輸入
export interface MarketplaceCommentInput {
  itemId: string
  content: string
  parentId?: string
}

// 收藏紀錄
export interface MarketplaceWishlist {
  id: string
  userId: string
  itemId: string
  createdAt: FirebaseTimestamp | null
}

// 使用者二手物統計
export interface UserMarketplaceStats {
  userId: string
  totalListings: number     // 總刊登數
  activeListings: number    // 目前販售中
  soldItems: number         // 已售出數量
  totalEarnings: number     // 累計金額
  updatedAt: FirebaseTimestamp | null
}
