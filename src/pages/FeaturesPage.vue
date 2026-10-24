<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()
</script>

<template>
  <div>
    <section class="page-head">
      <div class="wrap">
        <h1 class="h1">{{ c.featuresPage.title }}</h1>
        <p class="sub">{{ c.featuresPage.lead }}</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 96px">
      <div v-for="g in c.featuresPage.groups" :id="g.id" :key="g.id" v-reveal class="fgroup">
        <div class="fgroup__head">
          <span class="tile"><AppIcon :name="g.icon" :size="22" /></span>
          <h2>{{ g.title }}</h2>
        </div>
        <div>
          <div v-for="it in g.items" :key="it.title" class="fitem">
            <h3>{{ it.title }}</h3>
            <p>{{ it.desc }}</p>
          </div>
        </div>
      </div>
      <div class="notice" style="margin-top: 24px">{{ c.featuresPage.footnote }}</div>
      <p style="margin-top: 24px">
        <a class="link" href="https://docs.classisland.tech/app" target="_blank" rel="noopener">
          {{ c.featuresPage.docs }} <AppIcon name="external" :size="15" />
        </a>
      </p>
    </section>
  </div>
</template>
