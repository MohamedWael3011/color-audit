import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  className,
  children,
  bordered = true,
  hoverable = false,
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-surface-800 rounded-lg overflow-hidden",
        "shadow-sm",
        bordered && "border border-surface-200 dark:border-surface-700",
        hoverable && "transition-all hover:shadow-md hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-surface-200 dark:border-surface-700",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3
      className={cn(
        "text-lg font-medium text-surface-900 dark:text-surface-100 flex items-center gap-2",
        className
      )}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({
  className,
  children,
}) => {
  return (
    <p
      className={cn(
        "text-surface-600 dark:text-surface-400 mt-1 text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return <div className={cn("p-5", className)}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "px-5 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-850",
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
