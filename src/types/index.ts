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
