import { useState } from 'react';
import { Star } from 'lucide-react';

function StarRating({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showValue = true,
  className = ''
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
    xlarge: 'h-8 w-8'
  };
  
  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };
  
  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-all duration-200 ${
              !readonly ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded' : ''
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors duration-200 ${
                star <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } ${
                !readonly && hoverRating >= star ? 'text-yellow-500' : ''
              }`}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 mr-1">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}

export default StarRating;
