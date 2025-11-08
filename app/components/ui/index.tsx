/**
 * TALLA Design System - Reusable UI Components
 * Premium buttons, inputs, and form elements
 */

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

/* ========================================
   BUTTON COMPONENT
   ======================================== */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClasses = {
      sm: 'px-6 py-2.5 text-xs',
      md: 'px-10 py-3.5 text-sm',
      lg: 'px-12 py-4 text-base',
    };
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClass} ${variantClass} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

/* ========================================
   INPUT COMPONENT
   ======================================== */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-2 text-sm font-semibold uppercase tracking-wide text-talla-text">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-5 py-3.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded text-base transition-all duration-fast focus:outline-none focus:border-talla-text focus:ring-2 focus:ring-talla-text/10 placeholder:text-gray-400 ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ========================================
   TEXTAREA COMPONENT
   ======================================== */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block mb-2 text-sm font-semibold uppercase tracking-wide text-talla-text">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full px-5 py-3.5 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded text-base transition-all duration-fast focus:outline-none focus:border-talla-text focus:ring-2 focus:ring-talla-text/10 placeholder:text-gray-400 resize-vertical ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/* ========================================
   SELECT COMPONENT
   ======================================== */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block mb-2 text-sm font-semibold uppercase tracking-wide text-talla-text">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full px-5 py-3.5 pr-10 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded text-base transition-all duration-fast focus:outline-none focus:border-talla-text focus:ring-2 focus:ring-talla-text/10 appearance-none cursor-pointer ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/* ========================================
   SECTION HEADING
   ======================================== */

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SectionHeading({ title, subtitle, align = 'center', className = '' }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  
  return (
    <div className={`mb-12 lg:mb-16 ${alignClass} ${className}`}>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tighter text-talla-text mb-3">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-sm sm:text-base tracking-wide text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ========================================
   CONTAINER
   ======================================== */

interface ContainerProps {
  children: React.ReactNode;
  size?: 'narrow' | 'default' | 'wide';
  className?: string;
}

export function Container({ children, size = 'default', className = '' }: ContainerProps) {
  const sizeClass = size === 'narrow' ? 'max-w-narrow' : size === 'wide' ? 'max-w-container' : 'max-w-content';
  
  return (
    <div className={`container-talla ${sizeClass} ${className}`}>
      {children}
    </div>
  );
}

/* ========================================
   BADGE
   ======================================== */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'new' | 'soldout';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-talla-text text-white',
    sale: 'bg-red-600 text-white',
    new: 'bg-talla-surface text-talla-text',
    soldout: 'bg-gray-300 text-gray-600',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

/* ========================================
   PRODUCT GRID
   ======================================== */

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ProductGrid({ children, className = '' }: ProductGridProps) {
  return (
    <div className={`grid-products ${className}`}>
      {children}
    </div>
  );
}
