<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '@/composables/useLocale'
import type { RouteKey } from '@/router'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const route = useRoute()
const { c } = useLocale()

function setAttr(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

watchEffect(() => {
  const key = (route.meta.key as RouteKey | undefined) ?? 'home'
  const m = c.value.meta[key]
  document.title = m.title
  setAttr('meta[name="description"]', 'content', m.desc)
  setAttr('meta[property="og:title"]', 'content', m.title)
  setAttr('meta[property="og:description"]', 'content', m.desc)
  const url = `https://cf.ansoukin.top${route.path === '/' ? '/' : route.path}`
  setAttr('meta[property="og:url"]', 'content', url)
  setAttr('link[rel="canonical"]', 'href', url)
})
</script>

<template>
  <v-app>
    <a class="skip" href="#main">{{ c.nav.skip }}</a>
    <SiteHeader />
    <v-main id="main">
      <RouterView />
    </v-main>
    <SiteFooter />
  </v-app>
</template>
