import React from "react";
import clsx from "clsx";

const buttonVariants = {
  variant: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow",
    outline: "border border-border bg-transparent hover:bg-muted text-foreground",
    ghost: "hover:bg-muted text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
    link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
  },
  size: {
    xs: "h-7 px-2.5 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
    icon: "h-10 w-10",
  },
  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  radius = "md",
  className = "",
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  as: Component = "button",
  ...props
}) {
  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    buttonVariants.radius[radius],
    className
  );

  return (
    <Component className={baseClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </Component>
  );
}
