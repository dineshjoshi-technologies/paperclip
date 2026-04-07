import React from "react";
import clsx from "clsx";

export function Text({ children, variant = "body", className = "", as: Component, ...props }) {
  const variantClasses = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-semibold",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
    body: "text-base text-foreground",
    sm: "text-sm text-foreground",
    xs: "text-xs text-foreground",
    muted: "text-sm text-muted-foreground",
    label: "text-sm font-medium text-foreground",
    caption: "text-xs text-muted-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    error: "text-sm text-destructive",
    success: "text-sm text-success-foreground",
  };

  const defaultTags = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
    sm: "p",
    xs: "span",
    muted: "p",
    label: "label",
    caption: "span",
    link: "a",
    error: "p",
    success: "p",
  };

  return (
    <Component className={clsx(variantClasses[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export function Heading({ level = 2, children, className = "", ...props }) {
  const variant = `h${level}`;
  return (
    <Text variant={variant} as={`h${level}`} className={className} {...props}>
      {children}
    </Text>
  );
}
