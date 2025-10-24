import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, className, ...props }: InputProps) {
  const id = props.id || props.name;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={clsx(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
          error && 'border-red-300 text-red-900 placeholder-red-300',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
          className
        )}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, helpText, options, className, ...props }: SelectProps) {
  const id = props.id || props.name;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        className={clsx(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
          error && 'border-red-300 text-red-900',
          className
        )}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helpText?: string;
}

export function Checkbox({ label, error, helpText, className, ...props }: CheckboxProps) {
  const id = props.id || props.name;

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          {...props}
          id={id}
          type="checkbox"
          className={clsx(
            'h-4 w-4 rounded border-gray-300 text-primary-600',
            'focus:ring-primary-500',
            error && 'border-red-300',
            className
          )}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}
