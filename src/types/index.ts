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

// 使用者資料
export interface UserData {
  nickname: string
  role: string
}

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
