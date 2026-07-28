import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import styles from './StatusCard.module.scss'

type StatusCardProps = ComponentProps<'section'> & {
  icon: ReactNode
  title: string
  description: string
  eyebrow?: string
}

export const StatusCard = ({
  icon,
  title,
  description,
  eyebrow,
  children,
  className,
  ...props
}: StatusCardProps) => (
  <section className={clsx(styles.card, className)} {...props}>
    {icon}
    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
    <h1 className={clsx(styles.title, eyebrow && styles.titleWithEyebrow)}>{title}</h1>
    <p className={styles.description}>{description}</p>
    {children}
  </section>
)
