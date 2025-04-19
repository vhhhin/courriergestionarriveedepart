import React, { useState } from 'react';
import { Courier } from '../types/courier';
import { courierService } from '../services/courierService';
import { X } from 'lucide-react';

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mail: Courier;
  onSave: (updatedMail: Courier) => void;
  language: "fr" | "ar";
}

export const EditDialog: React.FC<EditDialogProps> = ({ isOpen, onClose, mail, onSave, language }) => {
  const [formData, setFormData] = useState<Courier>(mail);

  if (!isOpen || !mail) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedMail = {
        ...formData,
        updatedAt: new Date(),
        updatedBy: "current-user",
      };
      await courierService.update(updatedMail);
      onSave(updatedMail);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 backdrop-blur-[100px] bg-slate-900/70" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
            <h2 className="text-2xl font-bold text-slate-800">
              {mail.type === "decision" 
                ? language === "ar" ? "تعديل القرار" : "Modifier la Décision" 
                : language === "ar" ? "تعديل المراسلة" : "Modifier le Courrier"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "الرقم" : "Numéro"}
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "التاريخ" : "Date"}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                    required
                  />
                </div>
                {mail.type !== "decision" && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {language === "ar" ? "المرسل" : "Expéditeur"}
                      </label>
                      <input
                        type="text"
                        name="sender"
                        value={formData.sender || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {language === "ar" ? "المستلم" : "Destinataire"}
                      </label>
                      <select
                        name="recipient"
                        value={formData.recipient || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                      >
                        <option value="">{language === "ar" ? "اختر" : "Sélectionner"}</option>
                        <option value="Présidente du Conseil Préfectoral">
                          {language === "ar" ? "رئيسة مجلس عمالة الصخيرات تمارة" : "Présidente du Conseil Préfectoral"}
                        </option>
                        <option value="رئيسة مجلس عمالة الصخيرات تمارة">
                          {language === "ar" ? "رئيسة مجلس عمالة الصخيرات تمارة" : "رئيسة مجلس عمالة الصخيرات تمارة"}
                        </option>
                      </select>
                    </div>
                    {mail.type === "incoming" && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "المرجع" : "Référence"}
                          </label>
                          <input
                            type="text"
                            name="reference"
                            value={formData.reference || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "تاريخ المرجع" : "Date de référence"}
                          </label>
                          <input
                            type="date"
                            name="referenceDate"
                            value={formData.referenceDate || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "طبيعة المراسلة" : "Nature du courrier"}
                          </label>
                          <input
                            type="text"
                            name="nature"
                            value={formData.nature || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            {language === "ar" ? "التوجيه" : "Orientation"}
                          </label>
                          <select
                            name="orientation"
                            value={formData.orientation || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          >
                            <option value="">{language === "ar" ? "اختر" : "Sélectionner"}</option>
                            <option value="DGS">DGS</option>
                            <option value="DAPC">DAPC</option>
                            <option value="SRHAJ">SRHAJ</option>
                            <option value="CAISE">CAISE</option>
                            <option value="secretariat">Secrétariat</option>
                            <option value="SMCSC">SMCSC</option>
                            <option value="SATDE">SATDE</option>
                            <option value="SAFP">SAFP</option>
                          </select>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {language === "ar" ? "الموضوع" : "Objet"}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  {language === "ar" ? "إلغاء" : "Annuler"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {language === "ar" ? "حفظ" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};