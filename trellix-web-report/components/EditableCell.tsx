'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './EditableCell.module.css';

interface EditableCellProps {
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    renderDisplay?: (value: string) => React.ReactNode;
}

export default function EditableCell({ value, onChange, multiline = false, renderDisplay }: EditableCellProps) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handleBlur = () => {
        setEditing(false);
        onChange(localValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !multiline) {
            e.preventDefault();
            handleBlur();
        }
    };

    if (editing) {
        if (multiline) {
            return (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className={styles.input}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    rows={3}
                />
            );
        }
        return (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                className={styles.input}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div
            className={styles.display}
            onClick={() => setEditing(true)}
            tabIndex={0}
            onFocus={() => setEditing(true)}
        >
            {renderDisplay ? renderDisplay(value) : (value || <span className="text-gray-400 text-sm">(Empty)</span>)}
        </div>
    );
}
