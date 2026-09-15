// ECharts 按需装配 —— 替换 3 处的 `import * as echarts from 'echarts'`
//
// 只挑当前项目实际用到的 chart 类型和 component。加新 chart 时在下方 use([...])
// 追加，忘记会得到运行时 "Component xxx not exists" 报错，不会静默失败。
//
// 覆盖情况（2026-07）：
//   Charts:     Line / Bar / Pie / Radar / Heatmap
//   Components: Tooltip / Legend / Grid (xAxis/yAxis) / VisualMap / DataZoom /
//               Title / MarkLine / MarkPoint
//   Renderer:   Canvas

import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  HeatmapChart
} from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  DataZoomComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent,
  PolarComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  HeatmapChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  DataZoomComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent,
  PolarComponent,
  CanvasRenderer
])

export default echarts
export { echarts }
