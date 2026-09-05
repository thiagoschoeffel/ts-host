import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { installNavigationBridge } from './navigationBridge'
import { installLabelPrinterRuntime } from './labelPrinterRuntime'
import { installClientErrorCapture } from './telemetry'
import '@thiagoschoeffel/ts-components/style.css'
import './style.css'

installNavigationBridge(router)
installLabelPrinterRuntime()
installClientErrorCapture()
createApp(App).use(router).mount('#app')
