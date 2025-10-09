import { useState, useRef } from 'react';

const SafeImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder-book.jpg',
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasErrored, setHasErrored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 1; // Limit retries to prevent memory leaks

  const handleError = (e) => {
    if (retryCountRef.current < maxRetries && !hasErrored) {
      retryCountRef.current++;
      // Try fallback image
      setImageSrc(fallback);
    } else {
      // Stop trying and show broken image state
      setHasErrored(true);
      setIsLoading(false);
    }
    
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasErrored(false);
  };

  // If image has errored and we've exhausted retries, show placeholder div
  if (hasErrored) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}
        {...props}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📚</div>
          <div>لا توجد صورة</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy" // Lazy load to improve performance
      {...props}
    />
  );
};

export default SafeImage;
