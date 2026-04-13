import type { ButtonHTMLAttributes, FC } from "react"

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  inactive?: boolean
}

export const Button: FC<ButtonProps> = ({
  children,
  className = "",
  inactive = false,
  disabled,
  ...rest
}) => {
  const isDisabled = inactive || disabled

  return (
    <button
      disabled={isDisabled}
      className={`
        flex px-4 py-2.5 items-center gap-1 rounded justify-center transition-all border-3
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
            : "bg-blue-500 text-white border-blue-500 cursor-pointer hover:bg-blue-600 hover:border-blue-600 hover:text-white active:bg-blue-700"
        }
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  )
}
