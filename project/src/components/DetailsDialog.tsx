import React from "react";
import { Courier, Decision } from "../types/courier";
import { X } from "lucide-react";

interface DetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mail: Courier | Decision;
  language: "fr" | "ar";
}

export const DetailsDialog: React.FC<DetailsDialogProps> = ({ isOpen, onClose, mail, language }) => {
  if (!isOpen || !mail) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay avec effet de flou */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-slate-900/70" />
      <div className="absolute inset-0 backdrop-blur-[80px] bg-black/50" />
      <div className="absolute inset-0 backdrop-blur-[60px] bg-black/40" />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
            <h2 className="text-2xl font-bold text-slate-800">
              {mail.type === "decision" 
                ? language === "ar" ? "تفاصيل القرار" : "Détails de la décision"
                : language === "ar" ? "تفاصيل المراسلة" : "Détails du courrier"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "الرقم" : "Numéro"}
                  </label>
                  <p className="mt-1">{mail.number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "التاريخ" : "Date"}
                  </label>
                  <p className="mt-1">
                    {new Date(mail.date).toLocaleDateString()}
                  </p>
                </div>
                {mail.type !== "decision" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {language === "ar" ? "المرسل" : "Expéditeur"}
                      </label>
                      <p className="mt-1">{mail.sender || "Non spécifié"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {language === "ar" ? "المستلم" : "Destinataire"}
                      </label>
                      <p className="mt-1">{mail.recipient || "Non spécifié"}</p>
                    </div>
                    {mail.type === "incoming" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "المرجع" : "Référence"}
                          </label>
                          <p className="mt-1">{mail.reference || "Non spécifié"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "تاريخ المرجع" : "Date de référence"}
                          </label>
                          <p className="mt-1">
                            {mail.referenceDate ? new Date(mail.referenceDate).toLocaleDateString() : "Non spécifié"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "طبيعة المراسلة" : "Nature du courrier"}
                          </label>
                          <p className="mt-1">{mail.nature || "Non spécifié"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "التوجيه" : "Orientation"}
                          </label>
                          <p className="mt-1">{mail.orientation || "Non spécifié"}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "الموضوع" : "Objet"}
                  </label>
                  <p className="mt-1">{mail.subject}</p>
                </div>
                {mail.type === "decision" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {language === "ar" ? "ملاحظة" : "Observation"}
                    </label>
                    <p className="mt-1">{(mail as Decision).observation || "Non spécifié"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
