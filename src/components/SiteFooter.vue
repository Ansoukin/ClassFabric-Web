<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { c } = useLocale()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="wrap">
      <div class="site-footer__grid">
        <div>
          <RouterLink to="/" class="brand" style="margin-bottom: 12px">
            <img src="/logo.svg" alt="" width="28" height="28" />
            <span>{{ c.brand }}</span>
          </RouterLink>
          <p style="margin: 0; max-width: 320px">{{ c.footer.tagline }}</p>
        </div>
        <div>
          <h4>{{ c.footer.product }}</h4>
          <ul>
            <li><RouterLink to="/features">{{ c.nav.features }}</RouterLink></li>
            <li><RouterLink to="/download">{{ c.nav.download }}</RouterLink></li>
            <li><RouterLink to="/classisland">{{ c.nav.classisland }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4>{{ c.footer.project }}</h4>
          <ul>
            <li><RouterLink to="/community">{{ c.nav.community }}</RouterLink></li>
            <li>
              <a href="https://github.com/Ansoukin/ClassFabric" target="_blank" rel="noopener">GitHub</a>
            </li>
            <li>
              <a href="https://github.com/Ansoukin/ClassFabric/issues" target="_blank" rel="noopener">Issues</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="site-footer__base">
        <span>© {{ year }} ClassFabric · {{ c.footer.license }}</span>
        <span>{{ c.footer.disclaimer }}</span>
      </div>
    </div>
  </footer>
</template>
