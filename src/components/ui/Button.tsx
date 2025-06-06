import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variantStyles = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300",
    secondary:
      "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300",
    accent:
      "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 focus:ring-accent-500 disabled:bg-accent-300",
    outline:
      "bg-transparent border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-800 focus:ring-surface-400 disabled:border-surface-200 disabled:text-surface-400 text-surface-700 dark:text-surface-300",
    ghost:
      "bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 active:bg-surface-200 dark:active:bg-surface-800 focus:ring-surface-400 disabled:text-surface-400 text-surface-700 dark:text-surface-300",
    error:
      "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-500 disabled:bg-error-300",
  };

  const sizeStyles = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        isLoading && "opacity-80 cursor-not-allowed",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className={cn(
            "animate-spin -ml-1 mr-2 h-4 w-4",
            iconPosition === "right" && "order-last -mr-1 ml-2"
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {!isLoading && icon && iconPosition === "left" && (
        <span className="mr-2 -ml-0.5">{icon}</span>
      )}

      {children}

      {!isLoading && icon && iconPosition === "right" && (
        <span className="ml-2 -mr-0.5">{icon}</span>
      )}
    </button>
  );
};

export default Button;
