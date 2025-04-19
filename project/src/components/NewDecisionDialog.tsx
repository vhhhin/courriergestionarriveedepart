import React, { useState, useEffect } from "react";
import decisionService from "../services/decisionService";
import toast from "react-hot-toast";

interface NewDecisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  language: "fr" | "ar";
  onSuccess?: () => void;
}

export const NewDecisionDialog = ({
  isOpen,
  onClose,
  language,
  onSuccess,
}: NewDecisionDialogProps) => {
  const [newDecision, setNewDecision] = useState({
    date: new Date().toISOString().split("T")[0],
    subject: "",
    observation: "",
    priority: "normal" as const,
  });
  const [nextNumber, setNextNumber] = useState("");

  useEffect(() => {
    if (isOpen) {
      const number = decisionService.getNextNumber();
      setNextNumber(number);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      decisionService.save({
        type: "decision",
        number: nextNumber,
        date: new Date(newDecision.date),
        subject: newDecision.subject,
        description: "",
        reference: `${nextNumber}/${new Date().getFullYear()}`,
        status: "pending",
        priority: newDecision.priority,
        observation: newDecision.observation,
        qrCode: "",
        history: [
          {
            date: new Date(),
            action: "created",
            user: "current-user",
          },
        ],
        createdBy: "current-user",
        createdAt: new Date(),
        updatedBy: "current-user",
        updatedAt: new Date(),
      });
      setNewDecision({
        date: new Date().toISOString().split("T")[0],
        subject: "",
        observation: "",
        priority: "normal",
      });
      toast.success(
        language === "ar"
          ? "تم حفظ القرار بنجاح"
          : "Décision enregistrée avec succès"
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء الحفظ"
          : "Erreur lors de l'enregistrement"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay avec effet de flou professionnel */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-[2px] transition-all duration-500 ease-in-out" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent backdrop-blur-[4px] transition-all duration-500 ease-in-out" />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-[8px] rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-500 ease-in-out scale-100 border border-white/20 dark:border-gray-700/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === "ar" ? "قرار جديد" : "Nouvelle décision"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === "ar" ? "الرقم" : "Numéro"}
                </label>
                <input
                  type="text"
                  value={nextNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/80 dark:bg-gray-700/80 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === "ar" ? "التاريخ" : "Date"}
                </label>
                <input
                  type="date"
                  value={newDecision.date}
                  onChange={(e) =>
                    setNewDecision((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700/80 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === "ar" ? "الموضوع" : "Objet"}
                </label>
                <input
                  type="text"
                  value={newDecision.subject}
                  onChange={(e) =>
                    setNewDecision((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700/80 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === "ar" ? "ملاحظة" : "Observation"}
                </label>
                <textarea
                  value={newDecision.observation}
                  onChange={(e) =>
                    setNewDecision((prev) => ({
                      ...prev,
                      observation: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700/80 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200/90 dark:hover:bg-gray-600/90 transition-colors duration-200 backdrop-blur-sm"
              >
                {language === "ar" ? "إلغاء" : "Annuler"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600/90 text-white rounded-lg hover:bg-indigo-700/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 backdrop-blur-sm"
              >
                {language === "ar" ? "حفظ" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
