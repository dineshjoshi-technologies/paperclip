import React from "react";
import clsx from "clsx";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    success: "bg-success/20 text-success-foreground border border-success/50",
    warning: "bg-warning/20 text-warning-foreground border border-warning/50",
    destructive: "bg-destructive/20 text-destructive-foreground border border-destructive/50",
    info: "bg-info/20 text-info-foreground border border-info/50",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
