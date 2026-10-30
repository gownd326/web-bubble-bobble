'use client'

import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  ariaLabel?: string
}

export default function Button({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
}: ButtonProps) {
  const baseStyles =
    'font-dunggeunmo font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center select-none'

  const variants = {
    primary: 'bg-[#FF5722] hover:bg-[#f4511e] text-white shadow-[#FF5722]/30',
    secondary: 'bg-[#0f3460] hover:bg-[#1b498a] text-white shadow-[#0f3460]/40 border border-[#e94560]/40',
    accent: 'bg-[#e94560] hover:bg-[#d63853] text-white shadow-[#e94560]/30',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-gray-700 hover:bg-gray-600 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm md:text-base',
    lg: 'px-6 py-3 text-lg md:text-xl',
  }

  const combinedClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedClass} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClass}
    >
      {children}
    </button>
  )
}
