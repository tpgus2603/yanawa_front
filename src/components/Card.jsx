import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";

const cardVariants = cva("w-[20rem] rounded-xl shadow-lg p-4 overflow-hidden", {
  variants: {
    theme: {
      black: "bg-black text-white",
      white: "bg-white text-black",
      pink: "bg-gradient-pink text-white",
      purple: "bg-gradient-purple text-white",
      indigo: "bg-gradient-indigo text-white",
      mix: "bg-gradient-mix text-white",
    },
  },
});

export default function Card({
  image,
  title,
  content,
  time,
  headCount,
  theme = "black",
  onClick,
}) {
  const variantClass = cardVariants({ theme });

  return (
    <div className={cn(variantClass)} onClick={onClick}>
      {image && (
        <img
          src={image}
          alt={title}
          className="object-contain w-full h-48 rounded-xl"
        />
      )}
      <div className="p-3">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-base">{content}</p>
        <p className="text-base">{time}</p>
        <p className="mt-5 text-right">{headCount}</p>
      </div>
    </div>
  );
}
