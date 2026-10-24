<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLocale } from '@/composables/useLocale'
import IslandBar, { type Lesson, type Tile } from './IslandBar.vue'
import EditorWindow from './EditorWindow.vue'

/*
 * A scripted walkthrough on a recreated Windows desktop. The main window bar, the tray menu
 * and the profile editor are rebuilt in HTML/CSS from the app's own layout and labels.
 * Flow: tray icon → "Edit profile…" → pick a subject for each lesson (the app moves to the
 * next lesson by itself) → close → the schedule shows on the main window.
 * The canvas is a fixed 1280×720 design scaled to fit; the cursor target is measured from
 * real DOM rects at every step, so it cannot drift.
 */
const { c } = useLocale()

const W = 1280
const outer = ref<HTMLElement | null>(null)
const canvas = ref<HTMLElement | null>(null)
const scale = ref(0.5)
const reduced = ref(false)
const s = reactive({ menu: false, editor: false, step: 0, done: false })
const cur = reactive({ x: 1040, y: 560, down: false })

const subjects = computed<(number | null)[]>(() =>
  c.value.demo.times.map((_, i) => (i < s.step ? c.value.demo.picks[i] : null)),
)
const sel = computed(() => (s.editor && s.step < c.value.demo.times.length ? s.step : -1))

const lessons = computed<Lesson[]>(() =>
  s.done
    ? c.value.demo.picks.map((p, i) => ({
        short: c.value.demo.picker[p].s,
        full: c.value.demo.picker[p].f,
        time: c.value.demo.times[i].replace('-', '–'),
      }))
    : [],
)
const tiles = computed<Tile[]>(() => [
  { kind: 'date', text: c.value.demo.date },
  { kind: 'clock', text: c.value.demo.clock },
  ...(s.done ? [{ kind: 'countdown', text: c.value.demo.countdown } as Tile] : []),
])

let run = 0
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

class Stop extends Error {}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function reset() {
  s.menu = false
  s.editor = false
  s.step = 0
  s.done = false
  cur.x = 1040
  cur.y = 560
}

async function wait(token: number, ms: number) {
  await sleep(ms)
  if (token !== run) throw new Stop()
}

async function go(token: number, sel: string) {
  await nextTick()
  const cv = canvas.value
  if (!cv) throw new Stop()
  const el = cv.querySelector<HTMLElement>(`[data-t="${sel}"]`)
  if (el) {
    const cr = cv.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    cur.x = (r.left - cr.left + r.width / 2) / scale.value
    cur.y = (r.top - cr.top + r.height / 2) / scale.value
  }
  await wait(token, 800)
}

async function click(token: number, sel: string, after: () => void, hold = 500) {
  await go(token, sel)
  cur.down = true
  await wait(token, 130)
  cur.down = false
  after()
  await wait(token, hold)
}

async function loop(token: number) {
  try {
    while (token === run) {
      reset()
      await wait(token, 1400)
      await click(token, 'tray', () => (s.menu = true), 600)
      await click(token, 'menu-edit', () => {
        s.menu = false
        s.editor = true
      }, 700)
      for (const p of c.value.demo.picks) {
        await click(token, `sub-${p}`, () => s.step++, 260)
      }
      await wait(token, 500)
      await click(token, 'close', () => {
        s.editor = false
        s.done = true
      }, 400)
      cur.x = 760
      cur.y = 330
      await wait(token, 6500)
    }
  } catch (e) {
    if (!(e instanceof Stop)) throw e
  }
}

onMounted(() => {
  const el = outer.value
  if (!el) return
  const measure = () => (scale.value = el.clientWidth / W)
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(el)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reduced.value = true
    s.step = c.value.demo.picks.length
    s.done = true
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      run++
      if (entries[0]?.isIntersecting) void loop(run)
    },
    { threshold: 0.3 },
  )
  io.observe(el)
})

onBeforeUnmount(() => {
  run++
  ro?.disconnect()
  io?.disconnect()
})
</script>

<template>
  <div ref="outer" class="demo" role="img" :aria-label="c.hero.demoLabel">
    <div ref="canvas" class="canvas" :style="{ transform: `scale(${scale})` }" aria-hidden="true">
      <div class="wallpaper" />

      <!-- Main window bar -->
      <div class="island">
        <IslandBar :lessons="lessons" :break-after="[3]" :active="2" :progress="0.45" :tiles="tiles" :size="21" />
      </div>

      <!-- Profile editor -->
      <div class="win" :class="{ open: s.editor }">
        <EditorWindow :subjects="subjects" :sel="sel" />
      </div>

      <!-- Tray menu -->
      <div class="menu" :class="{ open: s.menu }">
        <div class="menu__head"><img src="/logo.svg" alt="" width="22" height="22" />{{ c.demo.appName }}</div>
        <template v-for="(m, i) in c.demo.trayMenu" :key="i">
          <div class="menu__item" :data-t="i === c.demo.trayEditIndex ? 'menu-edit' : undefined">{{ m }}</div>
          <div v-if="c.demo.trayDividerAfter.includes(i)" class="menu__sep" />
        </template>
      </div>

      <!-- Taskbar -->
      <div class="taskbar">
        <div class="tb-center">
          <span class="start"><i /><i /><i /><i /></span>
          <span class="app edge" />
          <span class="app folder" />
          <img class="app" src="/logo.svg" alt="" width="26" height="26" />
        </div>
        <div class="tb-right">
          <span class="chev">⌃</span>
          <img src="/logo.svg" alt="" width="22" height="22" data-t="tray" />
          <span class="mini" />
          <span class="mini" />
          <span class="mini" />
          <span class="time">10:12<br />2026/10/23</span>
        </div>
      </div>

      <!-- Cursor -->
      <div v-if="!reduced" class="cursor" :class="{ down: cur.down }" :style="{ transform: `translate(${cur.x}px, ${cur.y}px)` }">
        <svg width="26" height="28" viewBox="0 0 24 26">
          <path d="M3 2v18l5-4.4 3.4 7.6 3.2-1.5-3.4-7.4H19z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: var(--shadow-28);
  background: #02060f;
}
.canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  transform-origin: 0 0;
  font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif;
  color: #fff;
  user-select: none;
}
.island {
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}
.win {
  position: absolute;
  left: 140px;
  top: 78px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.win.open {
  opacity: 1;
}

/* Windows 11 context menu */
.menu {
  position: absolute;
  right: 52px;
  bottom: 62px;
  width: 300px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(44, 44, 44, 0.96);
  border: 1px solid #505050;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  font-size: 17px;
}
.menu.open {
  opacity: 1;
}
.menu__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 19px;
}
.menu__item {
  padding: 9px 12px 9px 46px;
  border-radius: 4px;
  font-weight: 500;
}
.menu__sep {
  height: 1px;
  margin: 5px 6px;
  background: #4d4d4d;
}

/* Taskbar */
.taskbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 52px;
  background: rgba(24, 28, 40, 0.92);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tb-center {
  display: flex;
  align-items: center;
  gap: 18px;
}
.start {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  width: 22px;
  height: 22px;
}
.start i {
  background: #4cc2ff;
  border-radius: 1px;
}
.app {
  width: 26px;
  height: 26px;
  border-radius: 6px;
}
.edge {
  background: conic-gradient(from 200deg, #36c1a0, #1a7fd8, #2ca3f0, #36c1a0);
  border-radius: 50%;
}
.folder {
  background: linear-gradient(180deg, #ffd66b, #f5a623);
  border-radius: 4px;
}
.tb-right {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
}
.chev {
  font-size: 15px;
  transform: scaleX(1.4);
  color: #ddd;
}
.mini {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.55);
}
.time {
  text-align: right;
  line-height: 1.25;
  font-size: 12.5px;
}

/* Cursor */
.cursor {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9;
  pointer-events: none;
  transition: transform 0.75s cubic-bezier(0.45, 0, 0.2, 1);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
}
.cursor svg {
  display: block;
  transform-origin: 3px 2px;
  transition: transform 0.12s;
}
.cursor.down svg {
  transform: scale(0.82);
}
</style>
