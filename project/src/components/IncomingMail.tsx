import React, { useState, useEffect } from "react";
import { courierService } from "../services/courierService";
import { Courier } from "../types/courier";
import { Download, FileText, Trash2, Edit3, X } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
// @ts-ignore
import 'jspdf-autotable';
// @ts-ignore
import amiri from "../fonts/Amiri-Regular.js";
import { decodeArabicText, encodeArabicText } from "../utils/textUtils";
import exportCourriersPDF from "../utils/exportCourriersPDF";
import { EditDialog } from "./EditDialog";
import { DetailsDialog } from "./DetailsDialog";
import autoTable from "jspdf-autotable";

interface IncomingMailProps {
  isOpen: boolean;
  onClose: () => void;
  language: "fr" | "ar";
}

const customConfirm = (message: string) => {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.backgroundColor = "#fff";
    dialog.style.padding = "20px";
    dialog.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    dialog.style.zIndex = "1000";
    dialog.style.borderRadius = "8px";
    dialog.style.textAlign = "center";

    const messageText = document.createElement("p");
    messageText.innerText = message;
    messageText.style.marginBottom = "20px";
    dialog.appendChild(messageText);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-around";

    const yesButton = document.createElement("button");
    yesButton.innerText = "Oui";
    yesButton.style.padding = "10px 20px";
    yesButton.style.backgroundColor = "#007BFF";
    yesButton.style.color = "#fff";
    yesButton.style.border = "none";
    yesButton.style.borderRadius = "5px";
    yesButton.style.cursor = "pointer";
    yesButton.onclick = () => {
      document.body.removeChild(dialog);
      resolve(true);
    };

    const noButton = document.createElement("button");
    noButton.innerText = "Non";
    noButton.style.padding = "10px 20px";
    noButton.style.backgroundColor = "#ccc";
    noButton.style.color = "#000";
    noButton.style.border = "none";
    noButton.style.borderRadius = "5px";
    noButton.style.cursor = "pointer";
    noButton.onclick = () => {
      document.body.removeChild(dialog);
      resolve(false);
    };

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    dialog.appendChild(buttonContainer);

    document.body.appendChild(dialog);
  });
};

export const IncomingMail = ({
  isOpen,
  onClose,
  language,
}: IncomingMailProps) => {
  const [mails, setMails] = useState<Courier[]>([]);
  const [selectedMail, setSelectedMail] = useState<Courier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mailToDelete, setMailToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allMails = courierService.getAll();
      setMails(allMails.filter((mail) => mail.type === "incoming"));
    }
  }, [isOpen]);

  const handleDelete = (mailId: string) => {
    setMailToDelete(mailId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (mailToDelete) {
      try {
        courierService.deleteById(mailToDelete);
        setMails((prev) => prev.filter((mail) => mail.id !== mailToDelete));
        toast.success(
          language === "ar"
            ? "تم حذف البريد بنجاح"
            : "Courrier supprimé avec succès"
        );
      } catch (error) {
        console.error("Erreur de suppression:", error);
        toast.error(
          language === "ar"
            ? "خطأ أثناء الحذف"
            : "Erreur lors de la suppression"
        );
      }
    }
    setShowDeleteDialog(false);
    setMailToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setMailToDelete(null);
  };

  const handleEdit = (mailId: string) => {
    const mailToEdit = mails.find((mail) => mail.id === mailId);
    if (mailToEdit) {
      setSelectedMail(mailToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleViewDetails = (mailId: string) => {
    const mail = mails.find((mail) => mail.id === mailId);
    if (mail) {
      setSelectedMail(mail); // Assurez-vous que `mail` contient toutes les propriétés nécessaires
      setIsDetailsDialogOpen(true);
    }
  };

  const handleExportPDF = () => {
    if (mails.length === 0) {
      toast.error(
        language === "ar"
          ? "لا توجد مراسلات للتصدير"
          : "Aucun courrier à exporter"
      );
      return;
    }
  
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
  
      // Ajouter la police Amiri pour l'arabe
      doc.addFileToVFS("Amiri-Regular.ttf", amiri);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
  
      // Définir les colonnes avec des largeurs optimisées
      const columns = [
        { header: language === "ar" ? "رقم البريد" : "N° BO", dataKey: "number", width: 12 },
        { header: language === "ar" ? "تاريخ الوصول" : "Date Arrivée", dataKey: "date", width: 15 },
        { header: language === "ar" ? "المرسل" : "Expéditeur", dataKey: "sender", width: 25 },
        { header: language === "ar" ? "المستلم" : "Destinataire", dataKey: "recipient", width: 25 },
        { header: language === "ar" ? "الموضوع" : "Objet", dataKey: "subject", width: 35 },
        { header: language === "ar" ? "الطبيعة" : "Nature", dataKey: "nature", width: 15 },
        { header: language === "ar" ? "التوجيه" : "Orientation", dataKey: "orientation", width: 15 },
        { header: language === "ar" ? "المرجع" : "Référence", dataKey: "reference", width: 15 },
        { header: language === "ar" ? "تاريخ المرجع" : "Date Réf.", dataKey: "referenceDate", width: 15 }
      ];
  
      // Préparer les données
      const data = mails.map((mail) => {
        let formattedDate = "N/A";
        let formattedRefDate = "N/A";
  
        try {
          if (mail.date) {
            const date = new Date(mail.date);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }
          }
  
          if (mail.referenceDate) {
            const refDate = new Date(mail.referenceDate);
            if (!isNaN(refDate.getTime())) {
              formattedRefDate = refDate.toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }
          }
        } catch (error) {
          console.error("Erreur de formatage de date:", error);
        }
  
        return {
          number: decodeArabicText(mail.number),
          date: formattedDate,
          sender: decodeArabicText(mail.sender),
          recipient: decodeArabicText(mail.recipient),
          subject: decodeArabicText(mail.subject),
          nature: decodeArabicText(mail.nature),
          orientation: decodeArabicText(mail.orientation),
          reference: decodeArabicText(mail.reference),
          referenceDate: formattedRefDate
        };
      });
  
      // Ajouter le titre
      doc.setFontSize(12);
      doc.text(
        language === "ar" ? "قائمة المراسلات الواردة" : "Liste des Courriers Arrivée",
        148.5,
        15,
        { align: "center" }
      );
  
      // Générer le tableau
      autoTable(doc, {
        columns,
        body: data,
        startY: 20,
        margin: { top: 15, right: 10, bottom: 15, left: 10 },
        styles: {
          fontSize: 6,
          cellPadding: 1,
          overflow: "linebreak",
          halign: "center",
        },
        columnStyles: {
          number: { cellWidth: 12 },
          date: { cellWidth: 15 },
          sender: { cellWidth: 25 },
          recipient: { cellWidth: 25 },
          subject: { cellWidth: 35 },
          nature: { cellWidth: 15 },
          orientation: { cellWidth: 15 },
          reference: { cellWidth: 15 },
          referenceDate: { cellWidth: 15 }
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        theme: "grid",
        tableWidth: "auto",
        horizontalPageBreak: true,
        showHead: "everyPage",
        showFoot: "everyPage",
      });
  
      // Ajouter le pied de page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          282,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
        doc.text(
          new Date().toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR"),
          10,
          doc.internal.pageSize.height - 10,
          { align: "left" }
        );
      }
  
      doc.save(
        language === "ar"
          ? "قائمة_المراسلات_الواردة.pdf"
          : "liste_courriers_arrivee.pdf"
      );
  
      toast.success(
        language === "ar"
          ? "تم تصدير القائمة بنجاح"
          : "Liste exportée avec succès"
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error(
        language === "ar"
          ? "خطأ في تصدير القائمة"
          : "Erreur lors de l'export"
      );
    }
  };

  // Fonction pour décoder le texte dans l'affichage
  const decodeDisplayText = (text: string | undefined) => {
    return decodeArabicText(text);
  };

  const handlePrint = () => {
    // Créer un iframe caché pour l'impression
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const tableContent = mails
      .map(
        ({ number, date, sender, recipient, subject, reference, referenceDate, nature, orientation }) => `
      <tr>
        <td>${number}</td>
        <td>${recipient || "Non spécifié"}</td>
        <td>${sender || "Non spécifié"}</td>
        <td>${reference || "Non spécifié"}</td>
        <td>${referenceDate ? new Date(referenceDate).toLocaleDateString() : "Non spécifié"}</td>
        <td>${nature || "Non spécifié"}</td>
        <td>${orientation || "Non spécifié"}</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <title>Liste des Courriers Arrivée</title>
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
            <h1>Liste des Courriers Arrivée</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Destinataire</th>
                <th>Expéditeur</th>
                <th>Référence</th>
                <th>Date de référence</th>
                <th>Nature</th>
                <th>Orientation</th>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay avec effet de flou extrêmement exagéré */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-black/70" />
      <div className="absolute inset-0 backdrop-blur-[80px] bg-black/50" />
      <div className="absolute inset-0 backdrop-blur-[60px] bg-black/40" />
      
      {/* Contenu de la modale */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === "ar" ? "البريد الوارد" : "Courrier Arrivée"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log("Export PDF button clicked in IncomingMail");
                    try {
                      handleExportPDF();
                    } catch (error) {
                      console.error("Error in PDF export:", error);
                      toast.error(
                        language === "ar"
                          ? "حدث خطأ أثناء التصدير"
                          : "Erreur lors de l'export"
                      );
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <FileText size={18} className="mr-2" />
                  {language === "ar" ? "تصدير PDF" : "Exporter en PDF"}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FileText size={18} className="mr-2" />
                  {language === "ar" ? "طباعة" : "Imprimer"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {mails.map((mail) => (
                  <div
                    key={mail.id}
                    className="p-4 border rounded-lg hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{decodeDisplayText(mail.objet)}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>N° {mail.numero_bo}</span>
                          <span className="mx-2">•</span>
                          <span>{mail.date_arrivee_bo ? new Date(mail.date_arrivee_bo).toLocaleDateString() : ""}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {language === "ar" ? "المرسل" : "Expéditeur"}: {decodeDisplayText(mail.expediteur)}
                        </div>
                        {mail.reference && (
                          <div className="text-sm text-gray-500">
                            Ref: {decodeDisplayText(mail.reference)}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(mail.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button
                          onClick={() => handleEdit(mail.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleViewDetails(mail.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          title="Voir Détails"
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isEditDialogOpen && (
              <EditDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                mail={selectedMail}
                onSave={() => {
                  setIsEditDialogOpen(false);
                  const allMails = courierService.getAll();
                  setMails(allMails.filter((mail) => mail.type === "incoming"));
                  toast.success("Courrier modifié avec succès");
                }}
              />
            )}

            {isDetailsDialogOpen && (
              <DetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => setIsDetailsDialogOpen(false)}
                mail={selectedMail}
              />
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              {language === "ar" ? "إغلاق" : "Fermer"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999]">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={cancelDelete}
          ></div>
          <div className="relative z-[10000] bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === "ar" ? "تأكيد الحذف" : "Confirmer la suppression"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "ar"
                ? "هل أنت متأكد من حذف هذا البريد؟"
                : "Êtes-vous sûr de vouloir supprimer ce courrier ?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {language === "ar" ? "إلغاء" : "Annuler"}
              </button>
              <button
                onClick={confirmDelete}
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
