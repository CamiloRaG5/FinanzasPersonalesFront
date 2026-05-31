import { useState, useCallback } from 'react';

export function useCurrencyInput(initialValue: string = '') {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [rawValue, setRawValue] = useState(initialValue);

  const formatNumber = (value: string): string => {
    // Remove all non-digit and non-dot characters
    const cleaned = value.replace(/[^\d.]/g, '');

    // Split into integer and decimal parts
    const parts = cleaned.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add thousand separators to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Return with decimal part if it exists
    if (decimalPart !== undefined) {
      return `${formatted}.${decimalPart}`;
    }

    return formatted;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-digit and non-dot characters for raw value
    const cleaned = inputValue.replace(/[^\d.]/g, '');

    // Prevent multiple dots
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleaned;

    // Update raw value (without formatting)
    setRawValue(sanitized);

    // Update display value (with formatting)
    setDisplayValue(formatNumber(sanitized));
  }, []);

  const reset = useCallback(() => {
    setDisplayValue('');
    setRawValue('');
  }, []);

  const setValue = useCallback((value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    setRawValue(cleaned);
    setDisplayValue(formatNumber(cleaned));
  }, []);

  return {
    displayValue,
    rawValue,
    handleChange,
    reset,
    setValue,
  };
}
