import { X } from "lucide-react";

// Ajoutez cette interface si elle n'existe pas déjà
interface SuccessToastProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

// Composant SuccessToast (à ajouter si vous ne l'avez pas déjà)
export const SuccessToast: React.FC<SuccessToastProps> = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000]">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between space-x-4 animate-fade-in">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-200 transition-colors duration-200"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
