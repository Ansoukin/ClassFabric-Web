import { ref, computed } from 'vue'
import { zh, type Content } from '@/i18n/zh'
import { en } from '@/i18n/en'

export type Locale = 'zh' | 'en'

const contents: Record<Locale, Content> = { zh, en }

function detect(): Locale {
  try {
    const saved = localStorage.getItem('cf-lang')
    if (saved === 'zh' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const locale = ref<Locale>(detect())

export function applyHtmlLang() {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
}

export function useLocale() {
  const c = computed<Content>(() => contents[locale.value])
  function setLocale(l: Locale) {
    locale.value = l
    try {
      localStorage.setItem('cf-lang', l)
    } catch {
      /* ignore */
    }
    applyHtmlLang()
  }
  return { locale, c, setLocale }
}
