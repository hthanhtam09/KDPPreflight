'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface ProcessingStep {
  id: string
  label: string
  done: boolean
}

interface ProcessingScreenProps {
  steps: ProcessingStep[]
  activeIndex: number
}

export default function ProcessingScreen({ steps, activeIndex }: ProcessingScreenProps) {
  const progressPercent = Math.round((activeIndex / steps.length) * 100)

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-[#f6f8fb] px-4 py-16">

      {/* Spinner ring */}
      <div className="relative mb-10 flex h-20 w-20 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="6"
          />
          <motion.circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="#df8e51"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="text-[#df8e51]/60"
        >
          <Loader2 className="h-7 w-7" />
        </motion.div>
      </div>

      {/* Headline */}
      <h2 className="mb-1 text-2xl font-bold text-[#0f172a]">Reviewing your files</h2>
      <p className="mb-10 text-sm text-black/45">This usually takes a few seconds.</p>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-3">
        {steps.map((step, i) => {
          const isActive = i === activeIndex
          const isDone = step.done

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={[
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300',
                isDone
                  ? 'bg-[#059669]/[0.06]'
                  : isActive
                  ? 'bg-[#df8e51]/[0.07] shadow-sm'
                  : 'opacity-35',
              ].join(' ')}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-4 w-4 shrink-0 text-[#df8e51]" />
                </motion.div>
              ) : (
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-black/20" />
              )}
              <span
                className={[
                  'text-sm font-medium',
                  isDone ? 'text-[#059669]' : isActive ? 'text-[#0f172a]' : 'text-black/40',
                ].join(' ')}
              >
                {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Privacy note */}
      <p className="mt-10 text-center text-xs text-black/30">
        Your files stay private in your browser. Nothing is uploaded to our servers.
      </p>
    </div>
  )
}
