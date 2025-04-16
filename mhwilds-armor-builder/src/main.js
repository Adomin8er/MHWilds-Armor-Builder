import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(vuetify)

app.mount('#app')