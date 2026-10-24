<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { release } from '@/lib/release'
import HeroDemo from '@/components/HeroDemo.vue'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()
</script>

<template>
  <div>
    <section class="hero weave">
      <div class="wrap">
        <p class="eyebrow">{{ c.hero.eyebrow }}</p>
        <h1 class="display">{{ c.hero.title }}</h1>
        <p class="lead">{{ c.hero.sub }}</p>
        <div class="actions">
          <RouterLink to="/download" class="btn btn--primary">
            {{ c.hero.primary }} <AppIcon name="download" :size="18" />
          </RouterLink>
          <a class="btn" href="https://github.com/Ansoukin/ClassFabric" target="_blank" rel="noopener">
            <AppIcon name="code" :size="18" />{{ c.hero.secondary }}
          </a>
        </div>
        <p class="note">{{ c.hero.note }}</p>
        <HeroDemo class="hero__demo" />
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <div v-reveal class="section-head">
          <p class="eyebrow">{{ c.pillars.eyebrow }}</p>
          <h2 class="h2">{{ c.pillars.title }}</h2>
        </div>
        <div class="grid-3">
          <article v-for="(p, i) in c.pillars.items" :key="p.title" v-reveal="i * 80" class="card">
            <span class="tile"><AppIcon :name="p.icon" :size="22" /></span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="sec sec--alt">
      <div class="wrap">
        <div v-reveal class="section-head">
          <p class="eyebrow">{{ c.showcase.eyebrow }}</p>
          <h2 class="h2">{{ c.showcase.title }}</h2>
        </div>
        <div class="showcase">
          <div v-for="(f, i) in c.showcase.items" :key="f.title" v-reveal="(i % 3) * 80">
            <span class="tile"><AppIcon :name="f.icon" :size="22" /></span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
        <p v-reveal style="margin-top: 52px">
          <RouterLink to="/features" class="link">{{ c.showcase.cta }} <AppIcon name="arrow" :size="18" /></RouterLink>
        </p>
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <div v-reveal class="section-head">
          <p class="eyebrow">{{ c.status.eyebrow }}</p>
          <h2 class="h2">{{ c.status.title }}</h2>
        </div>
        <div v-reveal class="status">
          <div v-for="it in c.status.items" :key="it.k">
            <div class="k">{{ it.k }}</div>
            <div class="v">{{ it.v }}</div>
            <p class="d">{{ it.d }}</p>
          </div>
        </div>
        <div v-reveal class="latest">
          <span>{{ c.status.latest }}</span>
          <strong style="color: var(--ink)">{{ release.tag }}</strong>
          <span v-if="release.prerelease" class="badge">{{ c.downloadPage.preview }}</span>
          <a class="link" :href="release.url" target="_blank" rel="noopener">
            {{ c.status.viewRelease }} <AppIcon name="external" :size="15" />
          </a>
        </div>
      </div>
    </section>

    <section class="sec sec--alt">
      <div class="wrap split">
        <div v-reveal>
          <p class="eyebrow">{{ c.relation.eyebrow }}</p>
          <h2 class="h2">{{ c.relation.title }}</h2>
        </div>
        <div v-reveal="100">
          <p class="muted" style="margin: 0 0 24px; font-size: 17px">{{ c.relation.body }}</p>
          <RouterLink to="/classisland" class="link">{{ c.relation.cta }} <AppIcon name="arrow" :size="18" /></RouterLink>
        </div>
      </div>
    </section>

    <section class="cta weave">
      <div class="wrap">
        <h2 v-reveal class="h1">{{ c.open.title }}</h2>
        <p v-reveal="80" class="lead">{{ c.open.body }}</p>
        <div v-reveal="160" class="actions">
          <a class="btn btn--primary" href="https://github.com/Ansoukin/ClassFabric" target="_blank" rel="noopener">
            <AppIcon name="code" :size="18" />{{ c.open.primary }}
          </a>
          <RouterLink to="/community" class="btn">{{ c.open.secondary }}</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
