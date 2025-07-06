import React, { useState } from 'react';
import '../styles/LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Введіть email та пароль');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Введіть коректний email');
      return;
    }

    setError('');
    console.log('Logging in:', { email, password });
    onClose();
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
