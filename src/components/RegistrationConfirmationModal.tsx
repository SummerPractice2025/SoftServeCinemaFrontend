import React from 'react';
import '../styles/RegistrationConfirmationModal.css';

interface RegistrationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationConfirmationModal: React.FC<
  RegistrationConfirmationModalProps
> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Закрити" />
        <div className="confirmation-content">
          <h2>Реєстрація успішна!</h2>
          <p>Щоб завершити реєстрацію, підтвердіть свою електронну адресу.</p>
          <button className="confirmation-btn" onClick={onClose}>
            Добре
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmationModal;
