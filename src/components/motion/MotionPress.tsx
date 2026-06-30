import { motion, type HTMLMotionProps } from 'framer-motion'
import { tapSpring } from './presets'

type MotionPressProps = HTMLMotionProps<'button'>

export function MotionPress({ children, className = '', ...props }: MotionPressProps) {
  return (
    <motion.button className={className} {...tapSpring} {...props}>
      {children}
    </motion.button>
  )
}
