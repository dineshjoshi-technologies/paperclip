import React from "react";
import clsx from "clsx";

export function Table({ children, className = "", wrapperClassName = "", responsive = true, ...props }) {
  const table = (
    <table className={clsx("w-full caption-bottom text-sm", className)} {...props}>
      {children}
    </table>
  );

  if (responsive) {
    return <div className={clsx("w-full overflow-auto", wrapperClassName)}>{table}</div>;
  }

  return table;
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={clsx("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={clsx("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", hoverable = true, ...props }) {
  return (
    <tr
      className={clsx(
        "border-b border-border transition-colors",
        hoverable && "hover:bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <th
      className={clsx(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td
      className={clsx("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    >
      {children}
    </td>
  );
}
