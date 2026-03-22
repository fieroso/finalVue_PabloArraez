import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import enrutador from './router'
import './assets/estilos.css'

const aplicacion = createApp(App)

aplicacion.use(createPinia())
aplicacion.use(enrutador)

aplicacion.mount('#app')
