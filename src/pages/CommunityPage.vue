<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()
</script>

<template>
  <div>
    <section class="page-head">
      <div class="wrap">
        <h1 class="h1">{{ c.communityPage.title }}</h1>
        <p class="sub">{{ c.communityPage.lead }}</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 56px">
      <div class="grid-2">
        <article v-for="(it, i) in c.communityPage.items" :key="it.title" v-reveal="(i % 2) * 70" class="card">
          <span class="tile"><AppIcon :name="it.icon" :size="22" /></span>
          <h3>{{ it.title }}</h3>
          <p>{{ it.desc }}</p>
          <p style="margin-top: 18px">
            <a class="link" :href="it.u" target="_blank" rel="noopener">
              {{ it.label }} <AppIcon name="external" :size="15" />
            </a>
          </p>
        </article>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 112px">
      <div class="grid-2">
        <div v-reveal class="notice">
          <strong>{{ c.communityPage.chatTitle }}</strong><br />{{ c.communityPage.chat }}
        </div>
        <div v-reveal="80" class="notice">
          <strong>{{ c.communityPage.licenseTitle }}</strong><br />{{ c.communityPage.license }}
        </div>
      </div>
    </section>
  </div>
</template>
