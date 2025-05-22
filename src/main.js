import '@/assets/styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import AppHeader from '@/components/fragments/Header.vue'
import AppFooter from '@/components/fragments/Footer.vue'
import ChatBotWidget from '@/components/fragments/ChatBotWidget.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@fortawesome/fontawesome-free/js/all.js'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.config.globalProperties.$axios = axios

app.use(router)
app.use(pinia)
app.component('AppHeader', AppHeader)
app.component('AppFooter', AppFooter)
app.component('ChatBotWidget', ChatBotWidget)
app.mount('#app')
