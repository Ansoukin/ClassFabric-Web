<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

/** Renders children on a fixed w×h design canvas and scales it to the available width. */
const props = defineProps<{ w: number; h: number }>()
const outer = ref<HTMLElement | null>(null)
const scale = ref(0.5)
let ro: ResizeObserver | null = null

onMounted(() => {
  const el = outer.value
  if (!el) return
  const measure = () => (scale.value = el.clientWidth / props.w)
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(el)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="outer" class="sb" :style="{ aspectRatio: `${w} / ${h}` }">
    <div class="sb__in" :style="{ width: `${w}px`, height: `${h}px`, transform: `scale(${scale})` }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.sb {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.sb__in {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
}
</style>
