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
