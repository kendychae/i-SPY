const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value) => {
  const email = (value || '').trim().toLowerCase();
  return email.length > 0 && emailRegex.test(email);
};

export const validatePassword = (value, minLength = 6) => {
  const password = value || '';
  return password.length >= minLength;
};

export const validateLogin = ({ email, password }) => {
  const errors = { email: '', password: '' };

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!password || !password.trim()) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password, 6)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return { valid: !errors.email && !errors.password, errors };
};

export const validateRegister = (formData) => {
  const errors = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  if (!formData.firstName || !formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName || !formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password, 8)) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { valid: !errors.firstName && !errors.lastName && !errors.email && !errors.password && !errors.confirmPassword, errors };
};
