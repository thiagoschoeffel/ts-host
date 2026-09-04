import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { installNavigationBridge } from './navigationBridge'
import { installLabelPrinterRuntime } from './labelPrinterRuntime'
import '@thiagoschoeffel/ts-components/style.css'
import './style.css'

installNavigationBridge(router)
installLabelPrinterRuntime()
createApp(App).use(router).mount('#app')
