// NewCourierDialog.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import type { Courier, CourierType, CourierPriority } from "../types/courier";
import { v4 as uuidv4 } from "uuid";
import { courierService } from "../services/courierService";
import decisionService from "../services/decisionService";
import toast from "react-hot-toast";
import { SuccessToast } from "./SuccessToast";
import { Label } from "./Label";
import { Input } from "./Input";

interface NewCourierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: CourierType;
  language: "fr" | "ar";
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: Courier;
}

interface FormData {
  date: string;
  subject: string;
  reference: string;
  sender: string;
  recipient: string;
  priority: CourierPriority;
  nature?: string;
  orientation?: string;
  referenceDate?: string;
  number: string;
}

const getNextNumber = (type: CourierType) => {
  const allItems =
    type === "decision" ? decisionService.getAll() : courierService.getAll();
  const filteredItems = allItems.filter(
    (item) => "type" in item && item.type === type
  );
  const lastNumber = filteredItems.reduce((max, item) => {
    const num = parseInt(item.number, 10);
    return num > max ? num : max;
  }, 0);
  return (lastNumber + 1).toString();
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatReferenceDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const NewCourierDialog: React.FC<NewCourierDialogProps> = ({
  isOpen,
  onClose,
  type,
  language,
  onSuccess,
  editMode = false,
  initialData,
}) => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: editMode
      ? {
          date: initialData?.date.toString().split("T")[0],
          subject: initialData?.subject,
          reference: initialData?.reference,
          sender: initialData?.sender,
          recipient: initialData?.recipient,
          priority: initialData?.priority,
          nature: (initialData as any)?.nature || "",
          orientation: (initialData as any)?.orientation || "",
          referenceDate: (initialData as any)?.referenceDate || "",
          number: initialData?.number || "",
        }
      : {
          date: "",
          subject: "",
          reference: "",
          sender: "",
          recipient: "",
          priority: "normal",
          nature: "",
          orientation: "",
          referenceDate: "",
          number: "",
        },
  });

  const formValues = watch();

  const [nextNumber, setNextNumber] = useState("");

  useEffect(() => {
    if (isOpen && !editMode) {
      const number = getNextNumber(type);
      setNextNumber(number);
    } else if (editMode && initialData) {
      setNextNumber(initialData.number.toString());
    }
  }, [isOpen, type, editMode, initialData]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editMode && initialData) {
        const updatedCourier = {
          ...initialData,
          ...data,
          date: new Date(data.date),
          updatedAt: new Date(),
          updatedBy: "current-user",
        };
        await courierService.update(updatedCourier);
        toast.success(
          language === "ar"
            ? "تم تعديل المراسلة بنجاح"
            : "Courrier modifié avec succès"
        );
      } else {
        const courierId = uuidv4();
        const currentYear = new Date().getFullYear();

        const courier: Courier = {
          id: courierId,
          type,
          number: nextNumber,
          date: new Date(data.date),
          subject: data.subject,
          reference: data.reference || "",
          referenceDate: data.referenceDate || "",
          sender: data.sender || "",
          recipient: data.recipient || "",
          status: "pending",
          priority: data.priority || "normal",
          nature: data.nature || "",
          orientation: data.orientation || "",
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
        };

        await courierService.add(courier);

        if (type === "outgoing") {
          setShowSuccessToast(true);
        }

        reset();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء الحفظ"
          : "Erreur lors de l'enregistrement"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <SuccessToast
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={
          language === "ar"
            ? "تم حفظ البريد بنجاح ✅"
            : "Courrier enregistré avec succès ✅"
        }
      />

      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 backdrop-blur-[100px] bg-slate-900/70" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
              <h2 className="text-2xl font-bold text-slate-800">
                {type === "incoming"
                  ? language === "ar"
                    ? "بريد وارد جديد"
                    : "Nouveau Courrier Arrivée"
                  : type === "outgoing"
                  ? language === "ar"
                    ? "بريد صادر جديد"
                    : "Nouveau Courrier Départ"
                  : type === "decision"
                  ? language === "ar"
                    ? "قرار جديد"
                    : "Nouvelle décision"
                  : ""}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {type === "incoming" && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          N° BO
                        </label>
                        <input
                          type="text"
                          value={nextNumber}
                          readOnly
                          className="w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Date arrivée BO
                        </label>
                        <input
                          type="date"
                          {...register("date", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.date && (
                          <span className="text-red-500 text-sm">
                            {errors.date.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Expéditeur
                        </label>
                        <input
                          type="text"
                          {...register("sender", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.sender && (
                          <span className="text-red-500 text-sm">
                            {errors.sender.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Objet
                        </label>
                        <input
                          type="text"
                          {...register("subject", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.subject && (
                          <span className="text-red-500 text-sm">
                            {errors.subject.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Destinataire
                        </label>
                        <select
                          {...register("recipient", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Présidente du Conseil Préfectoral">
                            Présidente du Conseil Préfectoral
                          </option>
                          <option value="رئيسة مجلس عمالة الصخيرات تمارة">
                            رئيسة مجلس عمالة الصخيرات تمارة
                          </option>
                        </select>
                        {errors.recipient && (
                          <span className="text-red-500 text-sm">
                            {errors.recipient.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Nature du courrier
                        </label>
                        <input
                          type="text"
                          {...register("nature")}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Orientation
                        </label>
                        <select
                          {...register("orientation")}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        >
                          <option value="">Sélectionner</option>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reference">
                            {language === "ar" ? "المرجع" : "Référence"}
                          </Label>
                          <Input
                            id="reference"
                            {...register("reference")}
                            value={formValues.reference}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              register("reference").onChange(e)
                            }
                            placeholder={
                              language === "ar"
                                ? "رقم المرجع"
                                : "Numéro de référence"
                            }
                          />
                          {errors.reference && (
                            <p className="text-red-500 text-sm mt-1">
                              {language === "ar"
                                ? "الرجاء إدخال المرجع"
                                : "Veuillez entrer la référence"}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referenceDate">
                            {language === "ar" ? "تاريخ المرجع" : "Date de référence"}
                          </Label>
                          <Input
                            id="referenceDate"
                            type="date"
                            {...register("referenceDate")}
                            value={formValues.referenceDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              register("referenceDate").onChange(e)
                            }
                          />
                          {errors.referenceDate && (
                            <p className="text-red-500 text-sm mt-1">
                              {language === "ar"
                                ? "الرجاء إدخال تاريخ المرجع"
                                : "Veuillez entrer la date de référence"}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {type === "outgoing" && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Numéro
                        </label>
                        <input
                          type="text"
                          value={nextNumber}
                          readOnly
                          className="w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm sm:text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Date
                        </label>
                        <input
                          type="date"
                          {...register("date", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.date && (
                          <span className="text-red-500 text-sm">
                            {errors.date.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Expéditeur
                        </label>
                        <select
                          {...register("sender", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Présidente du Conseil Préfectoral">
                            Présidente du Conseil Préfectoral
                          </option>
                          <option value="رئيسة مجلس عمالة الصخيرات تمارة">
                            رئيسة مجلس عمالة الصخيرات تمارة
                          </option>
                        </select>
                        {errors.sender && (
                          <span className="text-red-500 text-sm">
                            {errors.sender.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Destinataire
                        </label>
                        <input
                          type="text"
                          {...register("recipient", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.recipient && (
                          <span className="text-red-500 text-sm">
                            {errors.recipient.message}
                          </span>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Objet
                        </label>
                        <input
                          type="text"
                          {...register("subject", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.subject && (
                          <span className="text-red-500 text-sm">
                            {errors.subject.message}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {type !== "incoming" && type !== "outgoing" && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Expéditeur
                        </label>
                        {type === "decision" ? (
                          <select
                            {...register("sender", {
                              required: "Ce champ est requis",
                            })}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Présidente du Conseil Préfectoral">
                              Présidente du Conseil Préfectoral
                            </option>
                            <option value="رئيسة مجلس عمالة الصخيرات تمارة">
                              رئيسة مجلس عمالة الصخيرات تمارة
                            </option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            {...register("sender", {
                              required: "Ce champ est requis",
                            })}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          />
                        )}
                        {errors.sender && (
                          <span className="text-red-500 text-sm">
                            {errors.sender.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Destinataire
                        </label>
                        {type === "decision" ? (
                          <select
                            {...register("recipient", {
                              required: "Ce champ est requis",
                            })}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Présidente du Conseil Préfectoral">
                              Présidente du Conseil Préfectoral
                            </option>
                            <option value="رئيسة مجلس عمالة الصخيرات تمارة">
                              رئيسة مجلس عمالة الصخيرات تمارة
                            </option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            {...register("recipient", {
                              required: "Ce champ est requis",
                            })}
                            className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                          />
                        )}
                        {errors.recipient && (
                          <span className="text-red-500 text-sm">
                            {errors.recipient.message}
                          </span>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Objet
                        </label>
                        <input
                          type="text"
                          {...register("subject", {
                            required: "Ce champ est requis",
                          })}
                          className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm"
                        />
                        {errors.subject && (
                          <span className="text-red-500 text-sm">
                            {errors.subject.message}
                          </span>
                        )}
                      </div>
                    </>
                  )}
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
    </>
  );
};
