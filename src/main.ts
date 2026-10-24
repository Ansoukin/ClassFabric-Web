import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import { router } from './router'
import { reveal } from './directives/reveal'
import { initColorMode } from './composables/useColorMode'
import { applyHtmlLang } from './composables/useLocale'
import './styles/main.css'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: { primary: '#0f6cbd', background: '#f6f5f2', surface: '#ffffff' },
      },
      dark: {
        dark: true,
        colors: { primary: '#479ef5', background: '#141413', surface: '#1f1f1d' },
      },
    },
  },
})

const app = createApp(App)
app.use(router).use(vuetify)
app.directive('reveal', reveal)

initColorMode(vuetify)
applyHtmlLang()

app.mount('#app')
