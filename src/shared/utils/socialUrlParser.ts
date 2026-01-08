export type SocialPlatform = 'instagram' | 'facebook' | 'threads'

export interface ParsedSocialUrl {
  platform: SocialPlatform
  url: string
  isShortUrl?: boolean
}

const PLATFORM_PATTERNS: Record<SocialPlatform, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/,
  threads: /^https?:\/\/(www\.)?threads\.(net|com)\/@[\w.]+\/post\/[\w]+/,
  facebook: /^https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/.+/
}

// Facebook 短網址格式（無法直接嵌入）
const FB_SHORT_URL_PATTERN = /^https?:\/\/(www\.)?facebook\.com\/share\/(p|v|r)\//

/**
 * 清理 URL，移除不必要的查詢參數
 * Instagram 嵌入不需要 utm_source, igsh 等追蹤參數
 */
function cleanUrl(url: string, platform: SocialPlatform): string {
  try {
    const urlObj = new URL(url)

    if (platform === 'instagram') {
      // Instagram 嵌入只需要基本路徑，移除所有查詢參數
      return `${urlObj.origin}${urlObj.pathname}`
    }

    // 其他平台保留原始 URL
    return url
  } catch {
    return url
  }
}

export function parseSocialUrl(url: string): ParsedSocialUrl | null {
  const trimmedUrl = url.trim()

  for (const [platform, regex] of Object.entries(PLATFORM_PATTERNS)) {
    if (regex.test(trimmedUrl)) {
      const platformType = platform as SocialPlatform
      const isShortUrl = platform === 'facebook' && FB_SHORT_URL_PATTERN.test(trimmedUrl)
      const cleanedUrl = cleanUrl(trimmedUrl, platformType)

      return {
        platform: platformType,
        url: cleanedUrl,
        isShortUrl
      }
    }
  }

  return null
}

export function isFacebookShortUrl(url: string): boolean {
  return FB_SHORT_URL_PATTERN.test(url)
}

export function getPlatformName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    threads: 'Threads'
  }
  return names[platform]
}

export function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    threads: '#000000'
  }
  return colors[platform]
}
