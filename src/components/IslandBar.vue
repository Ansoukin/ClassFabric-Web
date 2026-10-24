<script setup lang="ts">
import { computed } from 'vue'

/*
 * HTML recreation of the app's main window bar ("fluent" and "classic" looks),
 * following the layout of the real main window: a row of lessons where the current
 * lesson expands with its time and a progress line, plus date / clock / countdown tiles.
 */
export interface Lesson {
  short: string
  full: string
  time?: string
}
export interface Tile {
  kind: 'date' | 'clock' | 'countdown' | 'weather'
  text: string
}

const props = withDefaults(
  defineProps<{
    lessons?: Lesson[]
    breakAfter?: number[]
    active?: number
    progress?: number
    tiles?: Tile[]
    variant?: 'fluent' | 'classic'
    size?: number
  }>(),
  { lessons: () => [], breakAfter: () => [], active: -1, progress: 0.4, tiles: () => [], variant: 'fluent', size: 18 },
)

const style = computed(() => ({ fontSize: `${props.size}px` }))
const lead = computed(() => props.tiles.filter((t) => t.kind !== 'countdown'))
const tail = computed(() => props.tiles.filter((t) => t.kind === 'countdown'))
</script>

<template>
  <div class="ib" :class="variant" :style="style">
    <!-- Fluent look: lessons row + tiles row -->
    <template v-if="variant === 'fluent'">
      <div v-if="lessons.length" class="ib__row">
        <template v-for="(l, i) in lessons" :key="i">
          <div class="ib__l" :class="{ act: i === active }">
            <template v-if="i === active">
              <b>{{ l.full }}</b>
              <small>{{ l.time }}</small>
              <span class="ib__bar"><span :style="{ width: `${progress * 100}%` }" /></span>
            </template>
            <b v-else>{{ l.short }}</b>
          </div>
          <span v-if="breakAfter.includes(i)" class="ib__div" />
        </template>
      </div>
      <div v-if="tiles.length" class="ib__tiles">
        <span v-for="(t, i) in tiles" :key="i" class="ib__tile" :class="t.kind">{{ t.text }}</span>
      </div>
    </template>

    <!-- Classic look: one flat row -->
    <div v-else class="ib__flat">
      <template v-for="(t, i) in lead" :key="`a${i}`">
        <span class="ib__f" :class="t.kind">{{ t.text }}</span>
        <span class="ib__div" />
      </template>
      <template v-for="(l, i) in lessons" :key="i">
        <div class="ib__l" :class="{ act: i === active }">
          <template v-if="i === active">
            <b>{{ l.full }}</b>
            <small>{{ l.time }}</small>
            <span class="ib__bar"><span :style="{ width: `${progress * 100}%` }" /></span>
          </template>
          <b v-else>{{ l.short }}</b>
        </div>
      </template>
      <span v-for="(t, i) in tail" :key="`t${i}`" class="ib__f countdown">{{ t.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.ib {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4em;
  color: #fff;
  font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif;
  line-height: 1.2;
  white-space: nowrap;
  user-select: none;
}
.ib__row,
.ib__tiles,
.ib__flat {
  display: flex;
  align-items: center;
}
.fluent .ib__row {
  padding: 0.5em 0.9em;
  border-radius: 0.4em;
  background: rgba(26, 30, 44, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: 0 0.3em 1.2em rgba(0, 0, 0, 0.35);
  gap: 0.1em;
}
.ib__l {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.45em;
  padding: 0.25em 0.7em;
}
.ib__l b {
  font-weight: 600;
  font-size: 1.05em;
}
.ib__l small {
  font-size: 0.62em;
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}
.ib__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.25em;
  height: 0.14em;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 1em;
  overflow: hidden;
}
.ib__bar > span {
  display: block;
  height: 100%;
  background: #a6f0da;
  border-radius: 1em;
}
.ib__div {
  width: 0.09em;
  height: 1.4em;
  margin: 0 0.35em;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1em;
}
.ib__tiles {
  gap: 0.5em;
}
.ib__tile {
  padding: 0.3em 0.75em;
  border-radius: 0.4em;
  background: rgba(24, 28, 56, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: 0 0.2em 0.8em rgba(0, 0, 0, 0.3);
  font-size: 0.9em;
  font-variant-numeric: tabular-nums;
}
.ib__tile.countdown,
.ib__f.countdown {
  color: #2af5c0;
  font-weight: 600;
}

/* classic */
.classic .ib__flat {
  padding: 0.35em 0.8em;
  background: rgba(40, 48, 52, 0.94);
  box-shadow: 0 0.3em 1.2em rgba(0, 0, 0, 0.3);
}
.ib__f {
  padding: 0 0.7em;
  font-size: 0.92em;
  font-variant-numeric: tabular-nums;
}
.ib__f.countdown {
  color: #29e0f2;
}
.classic .ib__div {
  height: 1.2em;
}
</style>
