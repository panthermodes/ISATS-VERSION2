import React, { useEffect, useState } from 'react'
import { ISATSLoader } from './ISATSLoader'

interface ProgressLoaderProps {
  onComplete?: () => void
  isReady?: boolean
}

const STAGES = [
  { text: 'Stage 1: Initializing ISATS Platform...', targetProgress: 20 },
  { text: 'Stage 2: Loading ICT Infrastructure & Catalog...', targetProgress: 45 },
  { text: 'Stage 3: Loading Organization Environment...', targetProgress: 70 },
  { text: 'Stage 4: Preparing Workspace & Telemetry...', targetProgress: 90 },
  { text: 'Stage 5: Workspace Ready', targetProgress: 100 },
]

export function ProgressLoader({ onComplete, isReady }: ProgressLoaderProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    if (isReady) {
      setProgress(100)
      setCurrentStageIdx(4)
      const t = setTimeout(() => {
        onComplete?.()
      }, 300)
      return () => clearTimeout(t)
    }

    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 1) {
          const next = prev + 1
          setProgress(STAGES[next].targetProgress)
          return next
        }
        return prev
      })
    }, 450)

    return () => clearInterval(interval)
  }, [isReady, onComplete])

  return (
    <ISATSLoader
      stageText={STAGES[currentStageIdx]?.text || 'Loading ISATS...'}
      progress={progress}
      fullScreen={true}
    />
  )
}
