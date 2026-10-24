import { ref } from 'vue'
import type { createVuetify } from 'vuetify'

export type ColorMode = 'system' | 'light' | 'dark'

type VuetifyInstance = ReturnType<typeof createVuetify>

const mode = ref<ColorMode>('system')
let vuetify: VuetifyInstance | null = null
let media: MediaQueryList | null = null

function read(): ColorMode {
  try {
    const v = localStorage.getItem('cf-theme')
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage unavailable */
  }
  return 'system'
}

function apply() {
  const dark = mode.value === 'dark' || (mode.value === 'system' && !!media?.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  if (vuetify) vuetify.theme.global.name.value = dark ? 'dark' : 'light'
}

export function initColorMode(instance: VuetifyInstance) {
  vuetify = instance
  media = window.matchMedia('(prefers-color-scheme: dark)')
  mode.value = read()
  media.addEventListener('change', () => {
    if (mode.value === 'system') apply()
  })
  apply()
}

export function useColorMode() {
  function setMode(m: ColorMode) {
    mode.value = m
    try {
      localStorage.setItem('cf-theme', m)
    } catch {
      /* ignore */
    }
    apply()
  }
  return { mode, setMode }
}
