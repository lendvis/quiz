import type { FC, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    children?: ReactNode;
    className?: string
}

export const Input: FC<InputProps> = ({ children, ...props }) => {
    return (
        <div className={`flex justify-center p-3 gap-2 h-12 border-2 border-gray-200 rounded ${props?.className }`}>
            <input {...props} className="bg-transparent outline-none flex-1 text-left placeholder-gray-500 text-black"  />
            {children}
        </div>
    );
};
