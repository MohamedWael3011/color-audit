import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  className,
  variant = 'error'
}) => {
  const variantStyles = {
    error: 'bg-error-50 text-error-700 border-error-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200'
  };

  const iconStyles = {
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-primary-500'
  };

  return (
    <div className={cn(
      'p-4 border rounded-lg flex items-start gap-3',
      variantStyles[variant],
      className
    )}>
      <AlertCircle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[variant])} />
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-0.5 rounded-md hover:bg-black/10 transition-colors',
            variant === 'error' && 'hover:bg-error-200',
            variant === 'warning' && 'hover:bg-warning-200',
            variant === 'info' && 'hover:bg-primary-200'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert; 