<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { release, formatSize } from '@/lib/release'
import AppIcon from '@/components/AppIcon.vue'

const { c, locale } = useLocale()

const published = computed(() => {
  if (!release.publishedAt) return ''
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'long' }).format(
    new Date(release.publishedAt),
  )
})
</script>

<template>
  <div>
    <section class="hero weave" style="padding-bottom: 48px">
      <div class="wrap">
        <p class="eyebrow">{{ c.downloadPage.eyebrow }}</p>
        <h1 class="h1">{{ c.downloadPage.title }}</h1>
        <p class="lead">{{ c.downloadPage.lead }}</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 40px">
      <div v-reveal class="release">
        <div class="small" style="margin-bottom: 8px">{{ c.downloadPage.latest }}</div>
        <div class="release__top">
          <span class="release__tag">{{ release.tag }}</span>
          <span class="badge">{{ release.prerelease ? c.downloadPage.preview : c.downloadPage.stable }}</span>
        </div>
        <p class="muted" style="margin: 10px 0 0">
          {{ release.name }}<template v-if="published"> · {{ c.downloadPage.published }} {{ published }}</template>
        </p>
        <div class="actions">
          <a class="btn btn--primary" :href="release.url" target="_blank" rel="noopener">
            <AppIcon name="download" :size="18" />{{ c.downloadPage.go }}
          </a>
          <a class="btn" href="https://github.com/Ansoukin/ClassFabric/releases" target="_blank" rel="noopener">
            {{ c.downloadPage.all }} <AppIcon name="external" :size="15" />
          </a>
        </div>

        <div class="files">
          <div class="small" style="padding: 14px 4px 6px">{{ c.downloadPage.files }}</div>
          <template v-if="release.assets.length">
            <a v-for="a in release.assets" :key="a.url" :href="a.url" target="_blank" rel="noopener">
              <span>{{ a.name }}</span>
              <span class="sz">{{ formatSize(a.size) }}</span>
            </a>
          </template>
          <p v-else class="muted" style="margin: 6px 4px 0; font-size: 14.5px">{{ c.downloadPage.filesEmpty }}</p>
        </div>
        <p class="small" style="margin: 18px 0 0">{{ c.downloadPage.buildNote }}</p>
      </div>
    </section>

    <section class="wrap" style="padding-bottom: 112px">
      <div class="grid-2">
        <div v-reveal class="card">
          <h3 style="margin-top: 0">{{ c.downloadPage.reqTitle }}</h3>
          <ul class="list">
            <li v-for="r in c.downloadPage.req" :key="r">{{ r }}</li>
          </ul>
        </div>
        <div v-reveal="80" class="card">
          <h3 style="margin-top: 0">{{ c.downloadPage.platformTitle }}</h3>
          <p>{{ c.downloadPage.platform }}</p>
        </div>
        <div v-reveal class="notice">
          <strong>{{ c.downloadPage.previewTitle }}</strong><br />{{ c.downloadPage.previewBody }}
        </div>
        <div v-reveal="80" class="notice">
          <strong>{{ c.downloadPage.upstreamTitle }}</strong><br />{{ c.downloadPage.upstream }}
        </div>
      </div>
      <div v-reveal class="card" style="margin-top: 20px">
        <h3 style="margin-top: 0">{{ c.downloadPage.docsTitle }}</h3>
        <p>{{ c.downloadPage.docsBody }}</p>
        <p style="margin-top: 14px">
          <a class="link" href="https://docs.classisland.tech/app/setup" target="_blank" rel="noopener">
            {{ c.downloadPage.docs }} <AppIcon name="external" :size="15" />
          </a>
        </p>
      </div>
    </section>
  </div>
</template>
