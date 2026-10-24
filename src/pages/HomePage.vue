<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { release } from '@/lib/release'
import HeroDemo from '@/components/HeroDemo.vue'
import IslandBar, { type Lesson, type Tile } from '@/components/IslandBar.vue'
import NoticeBar from '@/components/NoticeBar.vue'
import EditorWindow from '@/components/EditorWindow.vue'
import ScaleBox from '@/components/ScaleBox.vue'
import AppIcon from '@/components/AppIcon.vue'

const { c } = useLocale()

const lessons = computed<Lesson[]>(() =>
  c.value.demo.picks.map((p, i) => ({
    short: c.value.demo.picker[p].s,
    full: c.value.demo.picker[p].f,
    time: c.value.demo.times[i].replace('-', '–'),
  })),
)
const tilesFluent = computed<Tile[]>(() => [
  { kind: 'date', text: c.value.demo.date },
  { kind: 'clock', text: c.value.demo.clock },
  { kind: 'countdown', text: c.value.demo.countdown },
])
const tilesClassic = computed<Tile[]>(() => [
  { kind: 'weather', text: c.value.demo.weather },
  { kind: 'date', text: c.value.demo.date },
  { kind: 'countdown', text: c.value.demo.countdown },
])
const editorSubjects = computed(() => c.value.demo.picks.slice())
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="wrap center">
        <RouterLink to="/about" class="pill">{{ c.hero.pill }} <AppIcon name="arrow" :size="14" /></RouterLink>
        <h1 class="display" style="margin-top: 24px">{{ c.hero.title }}</h1>
        <p class="sub">{{ c.hero.sub }}</p>
        <div class="actions">
          <RouterLink to="/download" class="btn btn--primary">
            <AppIcon name="download" :size="18" />{{ c.hero.primary }}
          </RouterLink>
          <RouterLink to="/features" class="btn">{{ c.hero.secondary }}</RouterLink>
        </div>
        <p class="small" style="margin-top: 16px">{{ c.hero.note }}</p>
      </div>
      <div class="wrap hero__demo">
        <HeroDemo />
      </div>
    </section>

    <!-- Main window -->
    <section class="sec">
      <div class="wrap">
        <div v-reveal class="feature-head">
          <p class="eyebrow">{{ c.island.eyebrow }}</p>
          <h2 class="h2">{{ c.island.title }}</h2>
          <p class="sub">{{ c.island.sub }}</p>
        </div>
        <div v-reveal class="stage">
          <div class="wallpaper" />
          <ScaleBox :w="1200" :h="440">
            <div class="bars">
              <IslandBar :lessons="lessons" :break-after="[3]" :active="2" :progress="0.45" :tiles="tilesFluent" :size="26" />
              <IslandBar variant="classic" :lessons="lessons" :active="2" :progress="0.45" :tiles="tilesClassic" :size="24" />
            </div>
          </ScaleBox>
        </div>
        <ul v-reveal class="points">
          <li v-for="p in c.island.points" :key="p.t"><b>{{ p.t }}</b>{{ p.d }}</li>
        </ul>
      </div>
    </section>

    <!-- Reminders -->
    <section class="sec sec--dark force-dark">
      <div class="wrap">
        <div v-reveal class="feature-head">
          <p class="eyebrow">{{ c.notify.eyebrow }}</p>
          <h2 class="h2">{{ c.notify.title }}</h2>
          <p class="sub">{{ c.notify.sub }}</p>
        </div>
        <div v-reveal class="stage">
          <div class="wallpaper wallpaper--soft" />
          <ScaleBox :w="1200" :h="400">
            <div class="bars bars--notice">
              <NoticeBar v-for="n in c.demo.notices" :key="n.kind" :kind="n.kind" :a="n.a" :b="n.b" :size="25" />
            </div>
          </ScaleBox>
        </div>
        <ul v-reveal class="points">
          <li v-for="p in c.notify.points" :key="p.t"><b>{{ p.t }}</b>{{ p.d }}</li>
        </ul>
      </div>
    </section>

    <!-- Editor -->
    <section class="sec">
      <div class="wrap">
        <div v-reveal class="feature-head">
          <p class="eyebrow">{{ c.edit.eyebrow }}</p>
          <h2 class="h2">{{ c.edit.title }}</h2>
          <p class="sub">{{ c.edit.sub }}</p>
        </div>
        <div v-reveal class="stage">
          <div class="wallpaper" />
          <ScaleBox :w="1200" :h="660">
            <div class="editor-pos"><EditorWindow :subjects="editorSubjects" :sel="-1" /></div>
          </ScaleBox>
        </div>
        <ul v-reveal class="points">
          <li v-for="p in c.edit.points" :key="p.t"><b>{{ p.t }}</b>{{ p.d }}</li>
        </ul>
      </div>
    </section>

    <!-- Components -->
    <section class="sec sec--alt">
      <div class="wrap">
        <div v-reveal class="feature-head" style="margin-bottom: 40px">
          <p class="eyebrow">{{ c.comps.eyebrow }}</p>
          <h2 class="h2">{{ c.comps.title }}</h2>
          <p class="sub">{{ c.comps.sub }}</p>
        </div>
        <div v-reveal class="chips">
          <span v-for="t in c.comps.list" :key="t">{{ t }}</span>
        </div>
      </div>
    </section>

    <!-- More -->
    <section class="sec">
      <div class="wrap">
        <div v-reveal class="feature-head" style="margin-bottom: 48px">
          <p class="eyebrow">{{ c.more.eyebrow }}</p>
          <h2 class="h2">{{ c.more.title }}</h2>
        </div>
        <div class="grid-3">
          <article v-for="(m, i) in c.more.items" :key="m.t" v-reveal="(i % 3) * 70" class="card">
            <span class="tile"><AppIcon :name="m.icon" :size="22" /></span>
            <h3>{{ m.t }}</h3>
            <p>{{ m.d }}</p>
          </article>
        </div>
        <p v-reveal class="center" style="margin-top: 40px">
          <RouterLink to="/features" class="link">{{ c.hero.secondary }} <AppIcon name="arrow" :size="16" /></RouterLink>
        </p>
      </div>
    </section>

    <!-- Honest status -->
    <section class="sec sec--tight sec--alt">
      <div class="wrap">
        <div v-reveal class="feature-head" style="margin-bottom: 36px">
          <h2 class="h2" style="font-size: clamp(28px, 3.6vw, 40px)">{{ c.status.title }}</h2>
        </div>
        <div v-reveal class="status">
          <div v-for="it in c.status.items" :key="it.k">
            <div class="k">{{ it.k }}</div>
            <div class="v">{{ it.v }}</div>
            <p class="d">{{ it.d }}</p>
          </div>
        </div>
        <p v-reveal class="center small" style="margin-top: 20px">
          {{ c.status.latest }} · <strong style="color: var(--ink)">{{ release.tag }}</strong>
          <span v-if="release.prerelease" class="badge" style="margin-left: 8px">{{ c.downloadPage.preview }}</span>
          · <a class="link" style="font-size: 13.5px" :href="release.url" target="_blank" rel="noopener">{{ c.status.viewRelease }}</a>
        </p>
      </div>
    </section>

    <!-- Switching from ClassIsland -->
    <section class="sec">
      <div class="wrap wrap--narrow center">
        <h2 v-reveal class="h2">{{ c.switchBand.title }}</h2>
        <p v-reveal="80" class="sub">{{ c.switchBand.body }}</p>
      </div>
      <div class="wrap" style="margin-top: 56px">
        <div class="grid-2">
          <div v-reveal class="card">
            <h3 style="margin-top: 0">{{ c.fit.yesTitle }}</h3>
            <ul class="list">
              <li v-for="t in c.fit.yes" :key="t">{{ t }}</li>
            </ul>
          </div>
          <div v-reveal="80" class="card">
            <h3 style="margin-top: 0">{{ c.fit.noTitle }}</h3>
            <ul class="list">
              <li v-for="t in c.fit.no" :key="t">{{ t }}</li>
            </ul>
          </div>
        </div>
        <p v-reveal class="center" style="margin-top: 32px">
          <RouterLink to="/about" class="link">{{ c.switchBand.cta }} <AppIcon name="arrow" :size="16" /></RouterLink>
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="sec sec--alt center">
      <div class="wrap">
        <h2 v-reveal class="h1">{{ c.open.title }}</h2>
        <p v-reveal="80" class="sub" style="margin-inline: auto; max-width: 560px">{{ c.open.body }}</p>
        <div v-reveal="140" class="actions">
          <RouterLink to="/download" class="btn btn--primary">
            <AppIcon name="download" :size="18" />{{ c.open.primary }}
          </RouterLink>
          <a class="btn" href="https://github.com/Ansoukin/ClassFabric" target="_blank" rel="noopener">
            <AppIcon name="code" :size="18" />{{ c.open.secondary }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding: 72px 0 40px;
}
.hero__demo {
  margin-top: 56px;
}
.bars {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 90px;
}
.bars--notice {
  gap: 36px;
}
.editor-pos {
  position: absolute;
  left: 100px;
  top: 50px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
}
.chips span {
  padding: 12px 22px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--line-2);
  box-shadow: var(--shadow-4);
  font-size: 17px;
  font-weight: 600;
  font-family: var(--font-display);
}
</style>
