import React from 'react';
import '../styles/ActionButtons.css';

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onSave, onCancel }) => {
  return (
    <div className="btn-group">
      <button className="save-btn" onClick={onSave}>
        Зберегти
      </button>
      <button className="cancel-btn" onClick={onCancel}>
        Скасувати
      </button>
    </div>
  );
};

export default ActionButtons;
