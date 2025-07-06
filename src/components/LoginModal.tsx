import React, { useState } from 'react';
import '../styles/LoginModal.css';
import apiService from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Введіть email та пароль');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Введіть коректний email');
      return;
    }

    setError('');

    try {
      await apiService.signIn({ email, password });
      console.log('Успішний вхід');
      onClose();
      onLoginSuccess?.();
      // Можно добавить обновление состояния приложения или перенаправление
    } catch (error: any) {
      console.error('Помилка входу:', error);

      const serverError = error.response?.data?.message;
      const statusCode = error.response?.status;

      if (statusCode === 403) {
        setError('Неправильний email або пароль');
      } else if (serverError) {
        setError(serverError);
      } else if (error.code === 'ERR_NETWORK') {
        setError("Помилка підключення до сервера. Перевірте з'єднання.");
      } else {
        setError('Помилка входу. Спробуйте ще раз.');
      }
    }
  };

  const handleRegister = () => {
    onRegisterClick();
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close" onClick={onClose} aria-label="Закрити" />
        <h2>Вхід</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="error">{error}</div>}

        <div className="actions single">
          <button className="login-btn" onClick={handleLogin}>
            Вхід
          </button>
        </div>

        <button className="register-btn" onClick={handleRegister}>
          Зареєструватися
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
