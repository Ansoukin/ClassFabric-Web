<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useColorMode, type ColorMode } from '@/composables/useColorMode'
import AppIcon from './AppIcon.vue'

const { c, locale, setLocale } = useLocale()
const { mode, setMode } = useColorMode()

const links = computed(() => [
  { to: '/features', t: c.value.nav.features },
  { to: '/download', t: c.value.nav.download },
  { to: '/about', t: c.value.nav.about },
  { to: '/community', t: c.value.nav.community },
])

const modes = computed<{ m: ColorMode; t: string; icon: string }[]>(() => [
  { m: 'light', t: c.value.theme.light, icon: 'sun' },
  { m: 'dark', t: c.value.theme.dark, icon: 'moon' },
  { m: 'system', t: c.value.theme.system, icon: 'monitor' },
])
const modeIcon = computed(() => (mode.value === 'light' ? 'sun' : mode.value === 'dark' ? 'moon' : 'monitor'))
</script>

<template>
  <header class="site-header">
    <div class="wrap site-header__in">
      <RouterLink to="/" class="brand" :aria-label="c.nav.home">
        <img src="/logo.svg" alt="" width="28" height="28" />
        <span>{{ c.brand }}</span>
      </RouterLink>

      <nav class="nav" aria-label="Primary">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to">{{ l.t }}</RouterLink>
      </nav>

      <span class="spacer" />

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" size="small" class="icon-btn" :aria-label="c.lang.label">
            <AppIcon name="globe" :size="19" />
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item :active="locale === 'zh'" title="简体中文" @click="setLocale('zh')" />
          <v-list-item :active="locale === 'en'" title="English" @click="setLocale('en')" />
        </v-list>
      </v-menu>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" size="small" class="icon-btn" :aria-label="c.theme.label">
            <AppIcon :name="modeIcon" :size="19" />
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="m in modes"
            :key="m.m"
            :active="mode === m.m"
            :title="m.t"
            @click="setMode(m.m)"
          />
        </v-list>
      </v-menu>

      <a
        class="btn btn--sm nav-gh"
        href="https://github.com/Ansoukin/ClassFabric"
        target="_blank"
        rel="noopener"
      >
        <AppIcon name="code" :size="16" />{{ c.nav.github }}
      </a>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" size="small" class="icon-btn burger" :aria-label="c.nav.menu">
            <AppIcon name="menu" :size="20" />
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item v-for="l in links" :key="l.to" :to="l.to" :title="l.t" />
        </v-list>
      </v-menu>
    </div>
  </header>
</template>

<style scoped>
@media (max-width: 520px) {
  .nav-gh {
    display: none;
  }
}
</style>
