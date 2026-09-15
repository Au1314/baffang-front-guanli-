import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 数据大屏满屏缩放：以固定设计稿尺寸等比缩放，居中铺满窗口。
 * 窗口比例非设计稿比例时会出现留白（letterbox），这是大屏缩放的标准取舍。
 */
export function useScreenScale(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1)

  const handleResize = () => {
    scale.value = Math.min(
      window.innerWidth / designWidth,
      window.innerHeight / designHeight
    )
  }

  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { scale }
}
