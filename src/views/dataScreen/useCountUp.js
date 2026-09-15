import { ref, watch, onBeforeUnmount } from 'vue'

/**
 * 数字滚动动画：源值（getter）变化时，从当前值平滑过渡到新值。
 * 返回一个 ref，模板中用 `display.toLocaleString()` 渲染。
 */
export function useCountUp(getSource, duration = 1200) {
  const value = ref(getSource())
  let current = getSource()
  let rafId = null
  let from = current
  let to = current
  let startTime = 0

  const animateTo = (target) => {
    cancelAnimationFrame(rafId)
    from = current
    to = target
    if (from === to) return
    startTime = performance.now()

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      current = from + (to - from) * eased
      value.value = Math.round(current)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        current = to
        value.value = to
      }
    }
    rafId = requestAnimationFrame(step)
  }

  watch(getSource, (newVal) => {
    animateTo(newVal)
  })

  onBeforeUnmount(() => cancelAnimationFrame(rafId))

  return value
}
