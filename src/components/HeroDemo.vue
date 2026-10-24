<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useLocale } from '@/composables/useLocale'
import AppIcon from './AppIcon.vue'

/*
 * A stylized, scripted walkthrough built from HTML/CSS (not a screenshot):
 * tray → edit profile → fill the schedule → schedule shows on the desktop.
 * The canvas is a fixed 1000x625 design that is scaled to fit. The cursor
 * target is measured from real DOM rects every step, so it cannot drift.
 */
const { c } = useLocale()

const W = 1000
const outer = ref<HTMLElement | null>(null)
const canvas = ref<HTMLElement | null>(null)
const scale = ref(0.5)
const reduced = ref(false)
const s = reactive({ menu: false, editor: false, filled: 0, configured: false })
const cur = reactive({ x: 780, y: 480, down: false })

let run = 0
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

class Stop extends Error {}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function reset() {
  s.menu = false
  s.editor = false
  s.filled = 0
  s.configured = false
  cur.x = 780
  cur.y = 480
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
  await wait(token, 850)
}

async function click(token: number, sel: string, after: () => void, hold = 600) {
  await go(token, sel)
  cur.down = true
  await wait(token, 140)
  cur.down = false
  after()
  await wait(token, hold)
}

async function loop(token: number) {
  try {
    while (token === run) {
      reset()
      await wait(token, 1200)
      await click(token, 'tray', () => (s.menu = true), 650)
      await click(token, 'menu-edit', () => {
        s.menu = false
        s.editor = true
      }, 800)
      for (let i = 0; i < c.value.demo.subjects.length; i++) {
        await click(token, `cell-${i}`, () => (s.filled = i + 1), 380)
      }
      await click(token, 'done', () => {
        s.editor = false
        s.configured = true
      }, 400)
      cur.x = 640
      cur.y = 360
      await wait(token, 5200)
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
    s.configured = true
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      run++
      if (entries[0]?.isIntersecting) void loop(run)
    },
    { threshold: 0.25 },
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
      <div class="wall" />

      <!-- Desktop island -->
      <div class="island" :class="{ on: s.configured }" data-t="island">
        <div class="island__empty">{{ c.demo.islandEmpty }}</div>
        <div class="island__live">
          <div class="clock">
            <b>08:27</b>
            <span><i class="dot" />{{ c.demo.now }}</span>
          </div>
          <div class="chips">
            <div v-for="(sub, i) in c.demo.subjects" :key="i" class="chip" :class="{ act: i === 0 }">
              <b>{{ sub }}</b>
              <span>{{ c.demo.times[i] }}</span>
            </div>
          </div>
          <div class="side">
            <b>{{ c.demo.remain }}</b>
            <span>{{ c.demo.next }}</span>
          </div>
        </div>
      </div>

      <!-- Profile editor -->
      <div class="win" :class="{ open: s.editor }">
        <div class="win__bar">
          <img src="/logo.svg" alt="" width="18" height="18" />
          <span>{{ c.demo.editorTitle }}</span>
          <AppIcon name="close" :size="16" />
        </div>
        <div class="win__body">
          <ul class="win__nav">
            <li v-for="(n, i) in c.demo.editorNav" :key="i" :class="{ on: i === 0 }">{{ n }}</li>
          </ul>
          <div class="win__main">
            <div v-for="(sub, i) in c.demo.subjects" :key="i" class="row">
              <span class="row__t">{{ c.demo.times[i] }}</span>
              <div class="cell" :class="{ filled: s.filled > i }" :data-t="`cell-${i}`">
                <template v-if="s.filled > i">{{ sub }}</template>
                <span v-else class="plus">+</span>
              </div>
            </div>
          </div>
        </div>
        <div class="win__foot">
          <span class="done" data-t="done">{{ c.demo.editorDone }}</span>
        </div>
      </div>

      <!-- Tray menu -->
      <ul class="menu" :class="{ open: s.menu }">
        <li v-for="(m, i) in c.demo.trayMenu" :key="i" :data-t="i === 0 ? 'menu-edit' : undefined">{{ m }}</li>
      </ul>

      <!-- Taskbar -->
      <div class="taskbar">
        <div class="tb-center">
          <i class="sq win11" />
          <i class="sq" />
          <i class="sq" />
          <i class="sq" />
        </div>
        <div class="tb-right">
          <i class="mini" />
          <i class="mini" />
          <img src="/logo.svg" alt="" width="22" height="22" data-t="tray" />
          <span>08:27</span>
        </div>
      </div>

      <!-- Cursor -->
      <div v-if="!reduced" class="cursor" :class="{ down: cur.down }" :style="{ transform: `translate(${cur.x}px, ${cur.y}px)` }">
        <svg width="24" height="26" viewBox="0 0 24 26">
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
  aspect-ratio: 1000 / 625;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  background: var(--bg-alt);
}
.canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 1000px;
  height: 625px;
  transform-origin: 0 0;
  font-size: 15px;
  line-height: 1.3;
  color: var(--ink);
  user-select: none;
}
.wall {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 500px at 20% 10%, color-mix(in srgb, var(--brand) 22%, transparent), transparent 60%),
    radial-gradient(800px 520px at 90% 90%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 60%),
    linear-gradient(160deg, var(--bg-alt), var(--bg));
}

/* island */
.island {
  position: absolute;
  top: 28px;
  left: 150px;
  width: 700px;
  height: 78px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
}
.island__empty {
  color: var(--ink-3);
  font-size: 15px;
  transition: opacity 0.4s;
}
.island__live {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 22px;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.island.on .island__live {
  opacity: 1;
  transform: none;
}
.island.on .island__empty {
  opacity: 0;
}
.clock {
  display: grid;
  gap: 2px;
  min-width: 96px;
}
.clock b {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.clock span,
.side span,
.chip span {
  font-size: 12px;
  color: var(--ink-3);
}
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3fb950;
  margin-right: 6px;
}
.chips {
  display: flex;
  gap: 8px;
  flex: 1;
}
.chip {
  flex: 1;
  height: 52px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  display: grid;
  place-content: center;
  text-align: center;
}
.chip b {
  font-size: 15px;
}
.chip.act {
  background: var(--brand);
  border-color: transparent;
  color: var(--brand-ink);
}
.chip.act span {
  color: color-mix(in srgb, var(--brand-ink) 75%, transparent);
}
.side {
  display: grid;
  gap: 2px;
  text-align: right;
  min-width: 110px;
}
.side b {
  font-size: 15px;
}

/* editor window */
.win {
  position: absolute;
  left: 160px;
  top: 128px;
  width: 680px;
  height: 392px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}
.win.open {
  opacity: 1;
}
.win__bar {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  color: var(--ink-2);
}
.win__bar span {
  flex: 1;
}
.win__body {
  flex: 1;
  display: grid;
  grid-template-columns: 150px 1fr;
  min-height: 0;
}
.win__nav {
  list-style: none;
  margin: 0;
  padding: 14px 10px;
  border-right: 1px solid var(--line);
  display: grid;
  gap: 4px;
  align-content: start;
}
.win__nav li {
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--ink-2);
}
.win__nav li.on {
  background: var(--brand-soft);
  color: var(--ink);
  font-weight: 600;
}
.win__main {
  padding: 18px 22px;
  display: grid;
  gap: 10px;
  align-content: start;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.row__t {
  width: 52px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}
.cell {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--ink) 25%, transparent);
  display: grid;
  place-items: center;
  color: var(--ink-3);
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}
.cell.filled {
  border-style: solid;
  border-color: transparent;
  background: var(--brand-soft);
  color: var(--ink);
  font-weight: 600;
}
.win__foot {
  height: 56px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 18px;
}
.done {
  background: var(--brand);
  color: var(--brand-ink);
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 22px;
}

/* tray menu */
.menu {
  position: absolute;
  right: 36px;
  bottom: 56px;
  width: 190px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.menu.open {
  opacity: 1;
}
.menu li {
  padding: 10px 12px;
  border-radius: 8px;
}
.menu li:first-child {
  background: var(--brand-soft);
}

/* taskbar */
.taskbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tb-center {
  display: flex;
  gap: 8px;
}
.sq {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--ink) 12%, transparent);
}
.sq.win11 {
  background: var(--brand);
}
.tb-right {
  position: absolute;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--ink-2);
}
.mini {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ink) 18%, transparent);
}

/* cursor */
.cursor {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  pointer-events: none;
  transition: transform 0.8s cubic-bezier(0.45, 0, 0.2, 1);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
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
