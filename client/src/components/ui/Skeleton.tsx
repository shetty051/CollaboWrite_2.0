import React from 'react'
import { cn } from '../../utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface/80 border border-border/40', className)}
      {...props}
    />
  )
}
