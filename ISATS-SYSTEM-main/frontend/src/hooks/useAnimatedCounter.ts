import { useEffect, useState } from 'react'

export function useAnimatedCounter(endVal: number | string, duration = 800): string | number {
  const numericEnd = typeof endVal === 'number' ? endVal : parseFloat(String(endVal).replace(/[^0-9.-]/g, ''))
  const isNumeric = !isNaN(numericEnd) && isFinite(numericEnd)

  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (!isNumeric) return

    let start = 0
    const startTime = performance.now()

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentVal = Math.round(start + (numericEnd - start) * easeOut)

      setCount(currentVal)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        setCount(numericEnd)
      }
    }

    const frameId = requestAnimationFrame(updateCounter)
    return () => cancelAnimationFrame(frameId)
  }, [numericEnd, duration, isNumeric])

  if (!isNumeric) return endVal
  return count.toLocaleString()
}
