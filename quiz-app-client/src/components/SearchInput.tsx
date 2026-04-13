import { type FC } from "react";
import { Input, type InputProps } from "./ui/Input";

export interface SearchInputProps extends InputProps {
    onSearch: () => void;
}

export const SearchInput: FC<SearchInputProps> = ({ value, onChange, onSearch, placeholder }) => {
    return (
        <div className="flex items-center gap-2 w-full">
            <Input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="flex-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
            />
            <button
                onClick={onSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Поиск
            </button>
        </div>
    );
};
