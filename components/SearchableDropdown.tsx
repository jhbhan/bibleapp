import React, { useState, useEffect, useMemo, useRef } from 'react';

interface SearchableDropdownProps {
    options: string[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function SearchableDropdown({ options, value, onChange, placeholder, disabled }: SearchableDropdownProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.toLowerCase().startsWith(searchTerm.toLowerCase())
        );
    }, [searchTerm, options]);

    const handleSelect = (option: string) => {
        onChange(option);
        setSearchTerm('');
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                className="px-4 py-3 border border-gray-300 rounded w-full"
                value={searchTerm || value || ''}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value !== value) {
                        onChange(null);
                    }
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredOptions.length > 0) {
                        handleSelect(filteredOptions[0]);
                    }
                }}
                placeholder={placeholder}
                disabled={disabled}
            />
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li
                                key={option}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}
