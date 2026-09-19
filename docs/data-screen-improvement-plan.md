# 数据大屏下一步改进方案

> 本文档为「数据大屏充电业务化改造」完成后的后续演进规划，按价值排序，P0/P1 建议优先。

## 背景

数据大屏已完成以下改造（见提交 `1198e3d`）：

- 核心 KPI 从用户类指标替换为充电业务指标（总充电电量/实时功率/设备在线率/故障桩/订单总额/总用户）。
- 新增「公桩/私桩」切换与「区域」筛选。
- 布局重构为 KPI 行 → 三栏业务图 → 两栏(认证+占比 Tab) → 通栏热力图 → 底部实时卡片。
- 修复后端返回全 0 导致的「-100%」异常降幅。

当前仍存在以下限制，构成本方案的核心驱动：充电业务指标无后端数据源（mock 兜底）、筛选仅为系数缩放而非真实数据切片、图表渲染存在重复 `echarts.init` 告警。

---

## P0 — 后端数据接入（价值最高）

**现状**：充电业务 KPI（总充电电量/实时功率/设备在线率/故障桩/订单总额）在后端无对应接口，目前由 `src/views/dataScreen/mockData.js` 兜底；`authApi.getPlatformStats()`（`/stats/platform`）只返回用户类指标。

**方案**：

- 后端新增 `/stats/charging/overview` 接口，返回：

  ```json
  {
    "totalChargeEnergy": 0,
    "realtimePower": 0,
    "deviceOnlineRate": 0,
    "faultPileCount": 0,
    "orderTotalAmount": 0,
    "totalUsers": 0
  }
  ```

  并按 `timeRange` / `pileType` / `region` 参数返回筛选后数据。
- 前端新增 `src/api/statistics.js` 领域模块（参照 `auth.js` 组织方式），封装充电统计接口。
- `DataScreen.vue` 的 `fetchData` 改为「后端优先 + mock 兜底」，`mockData.js` 仅作降级，保持现有函数签名不变。

**收益**：数据真实、可运营；彻底消除 mock 与真实数据的口径偏差。

---

## P1 — 图表渲染优化（工程质量）

**现状**：`DataChartsSection.vue` 的 `render()` 对 6 个图表反复调用 `echarts.init()`，会产生「instance already initialized」控制台告警，且整体重绘开销大。

**方案**：

- 首次 `onMounted` 用 `echarts.init` 建实例，后续统一用 `echarts.getInstanceByDom(ref)?.setOption(option, true)` 增量更新。
- 占比 Tab 切换只 `setOption` 饼图，不重建。

**收益**：消除告警、降低切换筛选时的重绘开销、动画更平滑。

---

## P2 — 筛选逻辑真实化

**现状**：公桩/私桩、区域筛选目前只是用 `PILE_FACTOR`/`REGION_FACTOR` 系数缩放整体数据，非真实拆分。

**方案**：

- 公桩/私桩改为「并排对比」而非缩放：区域图、交易图同时展示两套序列，KPI 可切换「公桩 / 私桩 / 合计」三态。
- 区域筛选改为下钻：选「北京」时区域图与热力图聚焦该市，KPI 同步为区域聚合。

**收益**：筛选从「视觉缩放」变成「真实数据切片」，符合运维分析习惯。

---

## P3 — 交互与实时性增强

- **实时推送**：复用现有 `src/utils/CustomerServiceWS.js` 的 WebSocket 通道模式，新增充电实时数据推送，替换 3 分钟轮询，让「实时功率/在线率」真正实时。
- **图表下钻**：点击区域柱 → 展开该市站点明细；点击热力图某格 → 查看该时段负荷。
- **告警联动**：故障桩数量超过阈值时，故障卡片做呼吸灯动效，并联动顶部刷新按钮。

---

## P4 — 工程质量与测试

- 当前无测试脚本。建议引入 Vitest，为纯函数补单测：`mockData` 的 `metricValue`/缩放逻辑、`useCountUp` 动画、`trendText` 的零值保护（`-100%` 回归测试）。
- 超大屏（4K/带鱼屏）适配：`useScreenScale` 目前仅按 min 比例缩放，可加「最大缩放上限 + 居中留白策略」避免低分辨率下文字过小。
