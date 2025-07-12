import '../styles/CustomAlert.css';

interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ message, onClose }: CustomAlertProps) {
  return (
    <div className="custom-alert-backdrop fade-in" onClick={onClose}>
      <div
        className="custom-alert fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <button className="custom-alert-btn" onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
}
