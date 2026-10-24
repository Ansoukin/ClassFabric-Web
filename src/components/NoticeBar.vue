<script setup lang="ts">
/** Reminder banner shown over the main window (class / weather / automation). */
defineProps<{ kind: string; a: string; b?: string; size?: number; progress?: number }>()
</script>

<template>
  <div class="nb" :class="kind" :style="{ fontSize: `${size ?? 18}px` }">
    <span class="nb__dot" />
    <b>{{ a }}</b>
    <template v-if="b">
      <span class="nb__sep" />
      <span>{{ b }}</span>
    </template>
    <span class="nb__bar"><span :style="{ width: `${(progress ?? 0.7) * 100}%` }" /></span>
  </div>
</template>

<style scoped>
.nb {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.7em 1.3em 0.8em;
  border-radius: 0.4em;
  color: #fff;
  font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif;
  white-space: nowrap;
  background: #1c8fe0;
  box-shadow: 0 0.4em 1.4em rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
.nb.weather {
  background: #a7791a;
}
.nb.auto {
  background: #3b3f55;
}
.nb b {
  font-weight: 600;
}
.nb__dot {
  width: 0.85em;
  height: 0.85em;
  border-radius: 50%;
  border: 0.14em solid rgba(255, 255, 255, 0.95);
}
.nb__sep {
  width: 0.08em;
  height: 1.1em;
  background: rgba(255, 255, 255, 0.6);
}
.nb__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0.16em;
  background: rgba(255, 255, 255, 0.25);
}
.nb__bar > span {
  display: block;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
}
</style>
