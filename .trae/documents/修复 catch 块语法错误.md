## 修复 catch 块语法错误

### 问题
第550行的 `catch ()` 缺少错误参数，JavaScript 语法要求 catch 块必须有一个参数。

### 修复
将 `catch ()` 改为 `catch (err)`：

```javascript
} catch (err) {
  ElMessage.error('复制失败，请手动复制')
}
```

这是一个 JavaScript 语法错误，Vite 编译时无法解析这个文件。