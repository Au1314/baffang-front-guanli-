## 修复 onUnmounted 未定义错误

### 问题
代码中使用了 `onUnmounted` 钩子（第743行）但未从 Vue 导入。

### 修复方案
在导入语句中添加 `onUnmounted` 到 Vue 导入列表：

```javascript
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
```

这将解决 `ReferenceError: onUnmounted is not defined` 错误。