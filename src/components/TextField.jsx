import { cn } from "../libs/index";
import { cva } from "class-variance-authority";
import React from "react";

const TextFieldVariants = cva(
  "pb-5 flex-col justify-start items-start gap-1 inline-flex w-full",
  {
    variants: {
      state: {
        none: "[&_input]:text-grayscale-900 [&_input]:placeholder:text-grayscale-500 [&_input]:border-grayscale-300",
        warning:
          "[&_input]:text-grayscale-900 [&_input]:placeholder:text-grayscale-500 [&_input]:border-warning [&_#helperText]:text-warning",
        correct:
          "[&_input]:text-grayscale-900 [&_input]:placeholder:text-grayscale-500 [&_input]:border-positive [&_#helperText]:text-positive",
        active:
          "[&_input]:text-grayscale-900 [&_input]:placeholder:text-grayscale-500 [&_input]:border-grayscale-500",
      },
    },
  }
);

const TextField = React.forwardRef(function TextField(
  {
    className,
    title,
    description,
    placeholder,
    state,
    helperText,
    value,
    onChange,
    required = false,
    button,
    inputClassName,
    ...props
  },
  ref
) {
  const variantClass = TextFieldVariants({
    state,
  });

  return (
    <div {...props} className={cn(variantClass, className)}>
      {title && (
        <div className="flex flex-col items-start self-stretch justify-center gap-2">
          <div className="flex items-center self-stretch gap-2">
            <label className="label-1 text-grayscale-900">{title}</label>
            {required && <span className="label-1 text-warning">*</span>}
          </div>
          <label className="label-2 text-grayscale-700">{description}</label>
        </div>
      )}
      <div className="flex flex-col items-start self-stretch w-full gap-1">
        <div className="inline-flex items-start justify-start w-full gap-2 h-14">
          <input
            ref={ref}
            className={cn(
              "body-1 inline-flex h-14 w-full items-center justify-start gap-3 rounded-lg border px-6 py-[0.906rem]",
              inputClassName
            )}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            {...props}
          ></input>
          {button && <>{button}</>}
        </div>
        {helperText && (state === "correct" || state === "warning") && (
          <label id="helperText" className="self-stretch label-2">
            {helperText}
          </label>
        )}
      </div>
    </div>
  );
});

export default TextField;
