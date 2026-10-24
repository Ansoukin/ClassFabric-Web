<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()
const p = () => c.value.classislandPage
</script>

<template>
  <div>
    <section class="hero weave" style="padding-bottom: 48px">
      <div class="wrap">
        <p class="eyebrow">{{ p().eyebrow }}</p>
        <h1 class="h1">{{ p().title }}</h1>
        <p class="lead">{{ p().lead }}</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 72px">
      <div class="grid-2">
        <div v-reveal class="card">
          <h3 style="margin-top: 0">{{ p().inheritTitle }}</h3>
          <ul class="list">
            <li v-for="t in p().inherit" :key="t">{{ t }}</li>
          </ul>
        </div>
        <div v-reveal="80" class="card">
          <h3 style="margin-top: 0">{{ p().directionTitle }}</h3>
          <ul class="list">
            <li v-for="t in p().direction" :key="t">{{ t }}</li>
          </ul>
          <p class="small" style="margin-top: 14px">{{ p().directionNote }}</p>
        </div>
      </div>
    </section>

    <section class="sec sec--alt" style="padding: 80px 0">
      <div class="wrap">
        <h2 v-reveal class="h2" style="margin-bottom: 40px">{{ p().honestyTitle }}</h2>
        <div class="grid-3">
          <div v-for="(h, i) in p().honesty" :key="h.t" v-reveal="i * 80" class="card">
            <span class="tile"><AppIcon name="check" :size="22" /></span>
            <h3>{{ h.t }}</h3>
            <p>{{ h.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="wrap" style="padding: 80px 24px 112px">
      <h2 v-reveal class="h2" style="font-size: 28px; margin-bottom: 24px">{{ p().resourcesTitle }}</h2>
      <div v-reveal class="files" style="margin-top: 0">
        <a v-for="r in p().resources" :key="r.u" :href="r.u" target="_blank" rel="noopener">
          <span>{{ r.t }}</span><AppIcon name="external" :size="16" />
        </a>
      </div>
      <p class="small" style="margin-top: 20px">{{ p().resourcesNote }}</p>
      <p class="small" style="margin-top: 6px">{{ p().thanks }}</p>
    </section>
  </div>
</template>
