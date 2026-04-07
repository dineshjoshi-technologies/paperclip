import React from "react";
import clsx from "clsx";

export function Layout({ children, className = "" }) {
  return (
    <div className={clsx("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

export function Container({ children, className = "", size = "xl" }) {
  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div className={clsx("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
}

export function Grid({ children, className = "", cols = { default: 1, sm: 2, md: 3 }, gap = 4 }) {
  const gridCols = (breakpoints) =>
    Object.entries(breakpoints)
      .map(([bp, cols]) => {
        const prefix = bp === "default" ? "" : `${bp}:`;
        return `${prefix}grid-cols-${cols}`;
      })
      .join(" ");

  const gapClass = `gap-${gap}`;

  return (
    <div className={clsx("grid", gridCols(cols), gapClass, className)}>
      {children}
    </div>
  );
}

export function Stack({ children, className = "", direction = "vertical", gap = 4 }) {
  return (
    <div
      className={clsx(
        "flex",
        direction === "horizontal" ? "flex-row items-center" : "flex-col",
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}

export function Separator({ orientation = "horizontal", className = "" }) {
  return (
    <div
      className={clsx(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
    />
  );
}
