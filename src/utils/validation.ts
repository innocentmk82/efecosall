export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailDetailed = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getairmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    errors.push('Please use a valid business email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBusinessEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!email.trim()) {
    errors.push('Business email is required');
    return { isValid: false, errors };
  }
  
  if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getairmail.com',
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com' // Restrict to business emails
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    errors.push('Please use a valid business email address (not personal email)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateNumber = (value: number, min?: number, max?: number): boolean => {
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForm = (data: Record<string, any>, rules: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    if (rule.required && !validateRequired(value)) {
      errors[field] = `${rule.label || field} is required`;
    }
    
    if (rule.email && value && !validateEmail(value)) {
      errors[field] = `${rule.label || field} must be a valid email`;
    }
    
    if (rule.phone && value && !validatePhone(value)) {
      errors[field] = `${rule.label || field} must be a valid phone number`;
    }
    
    if (rule.min && value && !validateNumber(value, rule.min)) {
      errors[field] = `${rule.label || field} must be at least ${rule.min}`;
    }
    
    if (rule.max && value && !validateNumber(value, undefined, rule.max)) {
      errors[field] = `${rule.label || field} must be at most ${rule.max}`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};