import { useState, useCallback } from 'react';
import { validateBusinessEmail, validateEmailDetailed, validatePassword } from '../utils/validation';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { isValid: boolean; error?: string };
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) return null;

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${field} must be at least ${rule.minLength} characters long`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${field} must be no more than ${rule.maxLength} characters long`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${field} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (!result.isValid) {
        return result.error || `${field} is invalid`;
      }
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [rules, validateField]);

  const validateFieldRealTime = useCallback((field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  }, [validateField]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    validateFieldRealTime,
    clearFieldError,
    clearAllErrors
  };
};

// Predefined validation rules for common fields
export const validationRules = {
  businessEmail: {
    required: true,
    custom: (value: string) => {
      const result = validateBusinessEmail(value);
      return {
        isValid: result.isValid,
        error: result.errors[0]
      };
    }
  },
  email: {
    required: true,
    custom: (value: string) => {
      const result = validateEmailDetailed(value);
      return {
        isValid: result.isValid,
        error: result.errors[0]
      };
    }
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = validatePassword(value);
      return {
        isValid: result.isValid,
        error: result.errors[0]
      };
    }
  },
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  contactName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    required: true,
    minLength: 10,
    maxLength: 20
  },
  registrationNumber: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  taxId: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  street: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50
  }
};

export default useFormValidation; 