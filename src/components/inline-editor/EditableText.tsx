import { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useEditMode } from './EditModeContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export const EditableText = ({
  value,
  onSave,
  as: Component = 'span',
  multiline = false,
  className = '',
  placeholder = 'Click to edit...',
  children,
}: EditableTextProps) => {
  const { isEditing: editModeActive } = useEditMode();
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when entering local edit mode
  useEffect(() => {
    if (isLocalEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isLocalEditing]);

  const handleSave = useCallback(() => {
    if (localValue.trim() !== value.trim()) {
      onSave(localValue.trim());
    }
    setIsLocalEditing(false);
  }, [localValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setLocalValue(value);
    setIsLocalEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [multiline, handleSave, handleCancel]);

  const handleClick = useCallback(() => {
    if (editModeActive && !isLocalEditing) {
      setIsLocalEditing(true);
    }
  }, [editModeActive, isLocalEditing]);

  // Not in edit mode - render normally
  if (!editModeActive) {
    return <Component className={className}>{children || value}</Component>;
  }

  // In edit mode but not actively editing this element
  if (!isLocalEditing) {
    return (
      <div
        ref={containerRef}
        onClick={handleClick}
        className={cn(
          'group relative cursor-pointer transition-all duration-200',
          'hover:outline-dashed hover:outline-2 hover:outline-community-green/50 hover:outline-offset-2',
          'rounded'
        )}
      >
        <Component className={className}>{children || value || placeholder}</Component>
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-community-green text-white p-1 rounded-full shadow-lg">
            <Pencil className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  // Actively editing this element
  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            'w-full min-h-[80px] p-2 border-2 border-community-green rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-community-green/50',
            'bg-white text-community-navy',
            className
          )}
          placeholder={placeholder}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            'w-full p-2 border-2 border-community-green rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-community-green/50',
            'bg-white text-community-navy font-inherit',
            className
          )}
          placeholder={placeholder}
        />
      )}
      <div className="absolute -top-2 -right-2 flex gap-1">
        <button
          onClick={handleSave}
          className="bg-community-green text-white p-1 rounded-full shadow-lg hover:bg-community-green/90 transition-colors"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={handleCancel}
          className="bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
