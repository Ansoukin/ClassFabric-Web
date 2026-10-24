<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { c } = useLocale()
</script>

<template>
  <section class="page-head" style="min-height: 55vh">
    <div class="wrap">
      <p class="eyebrow">404</p>
      <h1 class="h1">{{ c.notFound.title }}</h1>
      <p class="sub">{{ c.notFound.body }}</p>
      <div class="actions">
        <RouterLink to="/" class="btn btn--primary">{{ c.notFound.back }}</RouterLink>
      </div>
    </div>
  </section>
</template>
