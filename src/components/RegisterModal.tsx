import React, { useState } from 'react';
import '../styles/RegisterModal.css';
import RegistrationConfirmationModal from './RegistrationConfirmationModal';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Валидация
  const validateName = (value: string): boolean => {
    return /^[а-яА-ЯіІїЇєЄa-zA-Z\s]{2,30}$/.test(value);
  };

  const validateEmail = (value: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/.test(value);
  };

  const validatePassword = (value: string): boolean => {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,30}$/.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(firstName)) {
      newErrors.firstName =
        "Ім'я повинно містити 2-30 символів (букви та пробіли)";
    }

    if (!validateName(lastName)) {
      newErrors.lastName =
        'Прізвище повинно містити 2-30 символів (букви та пробіли)';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Введіть коректний email';
    }

    if (!validatePassword(password)) {
      newErrors.password =
        'Пароль повинен містити мінімум 8 символів, букви та цифри';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не збігаються';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Здесь будет логика регистрации (пока просто симуляция)
    setTimeout(() => {
      console.log('Реєстрація:', {
        firstName,
        lastName,
        email,
        password,
        notification,
      });
      setIsLoading(false);
      setShowConfirmationModal(true);
      // Очистка формы
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNotification(false);
      setErrors({});
    }, 1000);
  };

  const handleClose = () => {
    // Сбрасываем ошибки при закрытии модального окна
    setErrors({});
    setShowConfirmationModal(false);
    onClose();
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-modal-overlay">
      <div className="register-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={handleClose} aria-label="Закрити" />
        <h2>Реєстрація</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Ім'я"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearError('firstName');
              }}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && (
              <div className="error-message">{errors.firstName}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Прізвище"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearError('lastName');
              }}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && (
              <div className="error-message">{errors.lastName}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="input-group">
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            {!errors.password && (
              <div className="tip">
                Пароль повинен містити мінімум 8 символів, букви та цифри
              </div>
            )}
          </div>

          <div className="input-group">
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Підтвердьте пароль"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError('confirmPassword');
                }}
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="actions">
            <button
              type="submit"
              className="register-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Обробка...' : 'Зареєструватися'}
            </button>
          </div>
        </form>
      </div>
      <RegistrationConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleClose}
      />
    </div>
  );
};

export default RegisterModal;
