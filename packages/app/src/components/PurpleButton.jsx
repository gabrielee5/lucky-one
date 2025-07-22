import React from 'react'
import { motion } from 'framer-motion'

const PurpleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 glow-button relative overflow-hidden"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25",
    secondary: "bg-gradient-to-r from-purple-600/20 to-violet-600/20 hover:from-purple-600/30 hover:to-violet-600/30 text-purple-300 border border-purple-500/30",
    gold: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/25",
    danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/25"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }
  
  const disabledClasses = "opacity-50 cursor-not-allowed"
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim()

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default PurpleButton