import { forwardRef } from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className = '', error, ...props }, ref) => (
    <input
      ref={ref}
      className={`glass rounded-xl px-4 py-3 w-full text-base text-ink-900 placeholder:text-ink-300 outline-none focus:ring-2 focus:ring-pink-400/50 ${error ? 'ring-2 ring-pink-400 shake' : ''} ${className}`}
      {...props}
    />
  )
)
GlassInput.displayName = 'GlassInput'
