import React from "react";
import clsx from "clsx";

const selectVariants = {
  variant: {
    default: "bg-input text-foreground border-border hover:bg-input/80",
    outline: "bg-transparent text-foreground border-border",
    ghost: "bg-transparent text-foreground border-transparent hover:bg-muted",
  },
  size: {
    sm: "h-8 text-sm px-3",
    md: "h-10 text-sm px-3.5",
    lg: "h-12 text-base px-4",
  },
};

export function Select({
  label = null,
  error = null,
  helperText = null,
  options = [],
  placeholder = "Select an option",
  value = "",
  onChange = null,
  disabled = false,
  className = "",
  wrapperClassName = "",
  size = "md",
  variant = "default",
  ...props
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full border rounded-md appearance-none cursor-pointer",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
          "disabled:opacity-50 disabled:pointer-events-none",
          error && "border-destructive focus-visible:ring-destructive",
          selectVariants.variant[variant],
          selectVariants.size[size],
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label = null,
  error = null,
  helperText = null,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        className={clsx(
          "w-full bg-input border border-border rounded-md",
          "text-foreground placeholder:text-muted-foreground",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
          "disabled:opacity-50 disabled:pointer-events-none",
          "resize-y min-h-[80px] py-2 px-3.5 text-sm",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
