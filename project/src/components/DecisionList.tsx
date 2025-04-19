import React, { useState, useEffect } from "react";
import decisionService, { Decision } from "../services/decisionService";
import toast from "react-hot-toast";
import { FileText, Printer, Trash2, Edit3, Plus } from "lucide-react";
import exportDecisionsPDF from "../utils/exportDecisionsPDF";
import { EditDialog } from "./EditDialog";
import { DetailsDialog } from "./DetailsDialog";

interface DecisionListProps {
  isOpen: boolean;
  onClose: () => void;
  language: "fr" | "ar";
}

export const DecisionList = ({
  isOpen,
  onClose,
  language,
}: DecisionListProps) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDecision, setNewDecision] = useState<Partial<Decision>>({
    number: "",
    date: "",
    subject: "",
    observation: "",
    author: "",
    status: "",
    additionalDetails: ""
  });

  useEffect(() => {
    console.log("DecisionList isOpen:", isOpen);
    if (isOpen) {
      console.log("Loading decisions...");
      loadDecisions();
    }
  }, [isOpen]);

  const loadDecisions = () => {
    try {
      const allDecisions = decisionService.getAll();
      console.log("Decisions loaded:", allDecisions);
      setDecisions(allDecisions);
    } catch (error) {
      console.error("Error loading decisions:", error);
      toast.error(
        language === "ar"
          ? "خطأ في تحميل القرارات"
          : "Erreur lors du chargement des décisions"
      );
    }
  };

  const handleAddDecision = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      if (!newDecision.number || !newDecision.date || !newDecision.subject) {
        toast.error(
          language === "ar"
            ? "الرجاء إدخال جميع الحقول المطلوبة"
            : "Veuillez remplir tous les champs obligatoires"
        );
        return;
      }

      await decisionService.create(newDecision as Decision);
      await loadDecisions();
      setIsAddDialogOpen(false);
      setNewDecision({
        number: "",
        date: "",
        subject: "",
        observation: "",
        author: "",
        status: "",
        additionalDetails: ""
      });
      toast.success(
        language === "ar"
          ? "تم إضافة القرار بنجاح"
          : "Décision ajoutée avec succès"
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error(
        language === "ar"
          ? "خطأ أثناء إضافة القرار"
          : "Erreur lors de l'ajout de la décision"
      );
    }
  };

  const handleExportPDF = () => {
    if (decisions.length === 0) {
      toast.error(
        language === "ar"
          ? "لا توجد قرارات للتصدير"
          : "Aucune décision à exporter"
      );
      return;
    }
    try {
      const dataToExport = decisions.map((decision) => {
        let formattedDate = "N/A";
        try {
          if (decision.date) {
            const date = new Date(decision.date);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            }
          }
        } catch (error) {
          console.error("Erreur de formatage de date:", error);
        }

        return {
          number: decision.number || "",
          date: formattedDate,
          subject: decision.subject || "",
          observation: decision.observation || "N/A",
          author: decision.author || "N/A",
          status: decision.status || "N/A",
          additionalDetails: decision.additionalDetails || "N/A"
        };
      });

      exportDecisionsPDF(dataToExport);
      toast.success(
        language === "ar" ? "تم تصدير القرارات بنجاح" : "Export PDF réussi"
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error(
        language === "ar"
          ? "خطأ في تصدير القرارات"
          : "Erreur lors de l'export PDF"
      );
    }
  };

  const handlePrint = () => {
    // Créer un iframe caché pour l'impression
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const tableContent = decisions
      .map(
        ({ number, date, sender, recipient, subject, observation }) => `
      <tr>
        <td>${number}</td>
        <td>${recipient || "Non spécifié"}</td>
        <td>${sender || "Non spécifié"}</td>
        <td>${observation || "Non spécifié"}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <title>Liste des Décisions</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste des Décisions</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Destinataire</th>
                <th>Expéditeur</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              ${tableContent}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Écrire le contenu dans l'iframe
    iframe.contentWindow?.document.write(htmlContent);
    iframe.contentWindow?.document.close();

    // Attendre que l'iframe soit chargé avant d'imprimer
    iframe.onload = () => {
      // Imprimer
      iframe.contentWindow?.print();
      
      // Supprimer l'iframe après l'impression
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  const handleEdit = async (decisionId: string) => {
    try {
      const decision = await decisionService.getById(decisionId);
      if (decision) {
        setSelectedDecision(decision);
        setIsEditDialogOpen(true);
      } else {
        toast.error(
          language === "ar"
            ? "لم يتم العثور على القرار"
            : "Décision non trouvée"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la décision:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء تحميل القرار"
          : "Erreur lors du chargement de la décision"
      );
    }
  };

  const handleSave = async (updatedData: Partial<Decision>) => {
    try {
      if (!selectedDecision) return;

      const updatedDecision = await decisionService.update(selectedDecision.id, updatedData);
      setDecisions(prevDecisions =>
        prevDecisions.map(d => d.id === updatedDecision.id ? updatedDecision : d)
      );
      setIsEditDialogOpen(false);
      toast.success(
        language === "ar"
          ? "تم تعديل القرار بنجاح"
          : "Décision modifiée avec succès"
      );
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء تعديل القرار"
          : "Erreur lors de la modification de la décision"
      );
    }
  };

  const handleDelete = async (decisionId: string) => {
    try {
      await decisionService.delete(decisionId);
      setDecisions(prevDecisions => prevDecisions.filter(d => d.id !== decisionId));
      toast.success(
        language === "ar"
          ? "تم حذف القرار بنجاح"
          : "Décision supprimée avec succès"
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء حذف القرار"
          : "Erreur lors de la suppression de la décision"
      );
    }
  };

  const handleViewDetails = (decisionId: string) => {
    const decision = decisions.find((decision) => decision.id === decisionId);
    if (decision) {
      setSelectedDecision(decision);
      setIsDetailsDialogOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === "ar" ? "قائمة القرارات" : "Liste des décisions"}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {language === "ar" ? "تصدير PDF" : "Exporter PDF"}
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {language === "ar" ? "طباعة" : "Imprimer"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-4 border rounded-lg hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{decision.subject}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>N° {decision.number}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(decision.date).toLocaleDateString()}
                        </span>
                      </div>
                      {decision.observation && (
                        <div className="text-sm text-gray-500">
                          {language === "ar" ? "ملاحظة" : "Observation"}:{" "}
                          {decision.observation}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(decision.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title={language === "ar" ? "حذف" : "Supprimer"}
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(decision.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title={language === "ar" ? "تعديل" : "Modifier"}
                      >
                        <Edit3 size={20} />
                      </button>
                      <button
                        onClick={() => handleViewDetails(decision.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title={language === "ar" ? "عرض التفاصيل" : "Voir Détails"}
                      >
                        <FileText size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {language === "ar" ? "إغلاق" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditDialogOpen && (
        <EditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mail={selectedDecision}
          onSave={handleSave}
        />
      )}

      {isDetailsDialogOpen && (
        <DetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          mail={selectedDecision}
        />
      )}

      {showDeleteDialog && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999]">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          ></div>
          <div className="relative z-[10000] bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === "ar" ? "تأكيد الحذف" : "Confirmer la suppression"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "ar"
                ? "هل أنت متأكد من حذف هذا القرار؟"
                : "Êtes-vous sûr de vouloir supprimer cette décision ?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {language === "ar" ? "إلغاء" : "Annuler"}
              </button>
              <button
                onClick={() => {
                  handleDelete(decisionToDelete);
                  setShowDeleteDialog(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {language === "ar" ? "حذف" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
