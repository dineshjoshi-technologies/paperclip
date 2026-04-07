import React from "react";
import clsx from "clsx";

export function Card({
  children,
  className = "",
  variant = "default",
  interactive = false,
  onClick = null,
  ...props
}) {
  const variants = {
    default: "bg-card text-card-foreground border border-border",
    elevated:
      "bg-card text-card-foreground border-0 shadow-lg",
    outlined: "bg-transparent text-card-foreground border-2 border-border",
    ghost: "bg-transparent text-card-foreground border-0",
  };

  return (
    <div
      className={clsx(
        "rounded-lg p-4",
        variants[variant],
        interactive &&
          "cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={clsx("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", as: Component = "h3", ...props }) {
  return (
    <Component
      className={clsx("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={clsx("text-sm text-muted-foreground mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={clsx("", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={clsx("mt-4 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
