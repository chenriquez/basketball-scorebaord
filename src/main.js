import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18nInstance } from './i18n'
import { initGameState } from './state/gameState'

const [i18n] = await Promise.all([createI18nInstance(), initGameState()])

document.documentElement.lang = i18n.global.locale.value

createApp(App).use(i18n).mount('#app')
