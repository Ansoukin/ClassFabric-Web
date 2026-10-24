import { createRouter, createWebHistory } from 'vue-router'

export type RouteKey = 'home' | 'features' | 'download' | 'about' | 'community' | 'notfound'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/HomePage.vue'), meta: { key: 'home' } },
    { path: '/features', component: () => import('./pages/FeaturesPage.vue'), meta: { key: 'features' } },
    { path: '/download', component: () => import('./pages/DownloadPage.vue'), meta: { key: 'download' } },
    { path: '/about', component: () => import('./pages/AboutPage.vue'), meta: { key: 'about' } },
    { path: '/community', component: () => import('./pages/CommunityPage.vue'), meta: { key: 'community' } },
    { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFoundPage.vue'), meta: { key: 'notfound' } },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  },
})
