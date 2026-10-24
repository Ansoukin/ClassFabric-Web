import data from '@/generated/release.json'

export interface ReleaseAsset {
  name: string
  size: number
  url: string
}

export interface ReleaseInfo {
  available: boolean
  tag: string
  name: string
  prerelease: boolean
  publishedAt: string | null
  url: string
  assets: ReleaseAsset[]
  generatedAt: string | null
}

export const release = data as ReleaseInfo

export function formatSize(bytes: number): string {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
