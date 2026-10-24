<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()
const p = computed(() => c.value.aboutPage)
</script>

<template>
  <div>
    <section class="page-head">
      <div class="wrap">
        <h1 class="h1">{{ p.title }}</h1>
        <p class="sub">{{ p.lead }}</p>
      </div>
    </section>

    <section class="wrap wrap--narrow" style="padding-bottom: 40px">
      <div v-for="f in p.faq" :key="f.q" v-reveal class="qa">
        <h2>{{ f.q }}</h2>
        <p v-for="t in f.a" :key="t">{{ t }}</p>
      </div>
      <p style="margin-top: 8px">
        <RouterLink to="/community" class="link">{{ c.nav.community }} <AppIcon name="arrow" :size="16" /></RouterLink>
      </p>
    </section>

    <section class="sec sec--tight sec--alt">
      <div class="wrap">
        <div v-reveal class="wrap--narrow" style="margin: 0 auto 36px">
          <h2 class="h2" style="font-size: 36px">{{ p.planTitle }}</h2>
          <p class="sub" style="font-size: 16px">{{ p.planNote }}</p>
        </div>
        <div class="grid-3">
          <article v-for="(it, i) in p.plan" :key="it.t" v-reveal="(i % 3) * 70" class="card">
            <span class="badge">{{ it.s }}</span>
            <h3>{{ it.t }}</h3>
            <p>{{ it.d }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="wrap wrap--narrow" style="padding: 80px 24px 112px">
      <h2 v-reveal class="h2" style="font-size: 26px; margin-bottom: 20px">{{ p.resourcesTitle }}</h2>
      <div v-reveal class="files" style="margin-top: 0">
        <a v-for="r in p.resources" :key="r.u" :href="r.u" target="_blank" rel="noopener">
          <span>{{ r.t }}</span><AppIcon name="external" :size="16" />
        </a>
      </div>
      <p class="small" style="margin-top: 20px">{{ p.resourcesNote }}</p>
      <p class="small" style="margin-top: 6px">{{ p.thanks }}</p>
    </section>
  </div>
</template>

<style scoped>
.qa {
  padding: 36px 0;
  border-top: 1px solid var(--line);
}
.qa h2 {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.015em;
}
.qa p {
  margin: 0 0 10px;
  color: var(--ink-2);
  font-size: 17px;
  line-height: 1.75;
}
</style>
