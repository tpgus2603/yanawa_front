import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";

const labelVariants = cva(
  "justify-center items-center gap-1 rounded-lg inline-flex",
  {
    variants: {
      theme: {
        indigo: "bg-secondary-900 text-white",
        solid: "bg-primary-600 text-white",
        lightsolid: "bg-primary-600 text-primary-100 border border-primary-100",
        graysolid: "bg-grayscale-100 text-grayscale-900",
        ghost: "border border-grayscale-500 text-grayscale-900",
      },
      size: {
        lg: "h-8 px-3 py-[0.438rem] label-1",
        sm: "h-6 px-2 py-1 label-2",
      },
    },
  }
);

export default function Label({ className, theme, size, icon, ...props }) {
  const variantClass = labelVariants({
    theme,
    size,
  });
  return (
    <div {...props} className={cn(variantClass, className)}>
      {icon && (
        <div className="flex h-[1rem] w-[1rem] items-center justify-center">
          {icon}
        </div>
      )}
      {props.children}
    </div>
  );
}
