import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";

const buttonVariants = cva(
  "font-bold transition duration-300 flex items-center justify-center rounded-full",
  {
    variants: {
      size: {
        xl: "h-14 px-6 py-[0.906rem] title-1",
        lg: "h-14 px-6 py-[0.906rem] body-1",
        md: "h-12 px-5 py-3 body-2",
        sm: "h-9 px-4 py-2.5 label-2",
        icon: "w-14 h-14 p-4",
      },
      state: {
        default: "opacity-100 cursor-pointer",
        disable: "opacity-50 cursor-not-allowed",
      },
      theme: {
        black: "bg-black text-white",
        white: "bg-white text-black border border-gray-300",
        pink: "bg-gradient-pink text-white",
        purple: "bg-gradient-purple text-white",
        indigo: "bg-gradient-indigo text-white",
        mix: "bg-gradient-mix text-white",
      },
    },
  }
);

export default function Button({
  className,
  size = "md",
  state = "default",
  theme = "black",
  icon,
  children,
  onClick,
  ...props
}) {
  const variantClass = buttonVariants({
    size,
    state,
    theme,
  });

  return (
    <button
      {...props}
      className={cn(variantClass, className)}
      onClick={onClick}
      disabled={state === "disable"}
    >
      {icon && (
        <div
          className={
            children
              ? "flex h-[1.5rem] w-[1.5rem] items-center justify-center mr-2"
              : "flex h-[1.5rem] w-[1.5rem] items-center justify-center"
          }
        >
          <div
            className={
              children
                ? "flex items-center justify-center w-6 h-6"
                : "flex items-center justify-center w-7 h-7"
            }
          >
            {icon}
          </div>
        </div>
      )}
      {children}
    </button>
  );
}
