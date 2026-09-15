import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/styles/variables.css'
import '@/styles/element-overrides.css'
import '@/style.css'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Avatar, Back, Bell, Box,
  Calendar, ChatDotRound, ChatLineSquare, Check, CircleCheck, CircleClose,
  Clock, Close, Connection, CopyDocument, Cpu, DataAnalysis, DataLine, Delete,
  Document, DocumentChecked, Download, EditPen, House, InfoFilled, Key,
  Lightning, List, Loading, Location, Message, Monitor, OfficeBuilding, Plus,
  QuestionFilled, Refresh, RefreshLeft, RefreshRight, Search, ShoppingCart,
  Star, SwitchButton, Timer, Tools, Top, TrendCharts, Upload, User, UserFilled,
  Van, View, Wallet, Warning
} from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

// 说明：
//  - Element Plus 组件和函数式 API（ElMessage/ElMessageBox 等）由
//    unplugin-vue-components + unplugin-auto-import 按需引入（见 vite.config.js），
//    不再需要 `app.use(ElementPlus)` 与 `element-plus/dist/index.css` 的全量注册。
//  - Element Plus icons 目前仍全局注册，避免破坏 <el-icon><UserFilled /></el-icon>
//    这类无显式 import 的用法。后续可按 view 迁移到显式 import 以进一步瘦身。

const app = createApp(App)
const pinia = createPinia()

// 全局注册用到的 Element Plus icons（按需引入，避免打包全部图标）
const icons = {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Avatar, Back, Bell, Box,
  Calendar, ChatDotRound, ChatLineSquare, Check, CircleCheck, CircleClose,
  Clock, Close, Connection, CopyDocument, Cpu, DataAnalysis, DataLine, Delete,
  Document, DocumentChecked, Download, EditPen, House, InfoFilled, Key,
  Lightning, List, Loading, Location, Message, Monitor, OfficeBuilding, Plus,
  QuestionFilled, Refresh, RefreshLeft, RefreshRight, Search, ShoppingCart,
  Star, SwitchButton, Timer, Tools, Top, TrendCharts, Upload, User, UserFilled,
  Van, View, Wallet, Warning
}
for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)

app.mount('#app')
