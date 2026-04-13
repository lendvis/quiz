import type { FC, TextareaHTMLAttributes, ReactNode } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    children?: ReactNode;
    className?: string;
}

export const Textarea: FC<TextareaProps> = ({ children, ...props }) => {
    return (
        /* Убрали h-12, добавили min-h-[100px] и items-start, чтобы иконки были сверху */
        <div className={`flex justify-center p-3 gap-2 min-h-[120px] items-start border-2 border-gray-200 rounded ${props?.className}`}>
            <textarea 
                {...props} 
                className="bg-transparent outline-none flex-1 text-left placeholder-gray-500 text-black resize-none min-h-full" 
            />
            {children}
        </div>
    );
};