import clsx from 'clsx'
import type { ComponentProps } from 'react'
import styles from './Button.module.scss'

type ButtonProps = ComponentProps<'button'> & {
  isCompact?: boolean
}

export const Button = ({ isCompact = false, className, ...props }: ButtonProps) => (
  <button
    type="button"
    className={clsx(styles.button, isCompact && styles.compact, className)}
    {...props}
  />
)
