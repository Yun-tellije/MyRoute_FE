import './assets/css/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import AppHeader from './components/Header.vue'
import { createPinia } from 'pinia'

const app = createApp(App)

app.config.globalProperties.$axios = axios

app.use(router)
app.use(createPinia())
app.component('AppHeader', AppHeader)
app.mount('#app')
