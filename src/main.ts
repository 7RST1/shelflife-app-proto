import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/nb-NO'
import quasarIconSet from 'quasar/icon-set/material-symbols-rounded'

// Import icon libraries
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

import './css/index.scss'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'
import {router} from "@/router.ts";

const pinia = createPinia()
const myApp = createApp(App)

myApp.use(router)
myApp.use(pinia)

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  lang: quasarLang,
  iconSet: quasarIconSet,
  config: {
    ripple:true
  }
})

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')
