import { cn } from '../../utils/helpers'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className,
  text 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3',
    xlarge: 'w-16 h-16 border-4'
  }

  const colorClasses = {
    primary: 'border-gray-300 border-t-primary-brown',
    white: 'border-gray-400 border-t-white',
    gold: 'border-gray-300 border-t-primary-gold'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
