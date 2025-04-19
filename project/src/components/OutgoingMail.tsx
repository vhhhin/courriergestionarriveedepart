import React, { useState, useEffect } from 'react';
import { courierService } from '../services/courierService';
import { Courier } from '../types/courier';
import { Trash2, FileText, Edit3, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DetailsDialog } from './DetailsDialog';
import { EditDialog } from './EditDialog';
import { exportCourriersPDF } from '../services/pdfService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// @ts-ignore
import amiri from "../fonts/Amiri-Regular.js";
import autoTable from "jspdf-autotable";

interface OutgoingMailProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'ar';
}

const customConfirm = (message) => {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#fff';
    dialog.style.padding = '20px';
    dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    dialog.style.zIndex = '1000';
    dialog.style.borderRadius = '8px';
    dialog.style.textAlign = 'center';

    const messageText = document.createElement('p');
    messageText.innerText = message;
    messageText.style.marginBottom = '20px';
    dialog.appendChild(messageText);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-around';

    const yesButton = document.createElement('button');
    yesButton.innerText = 'Oui';
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#007BFF';
    yesButton.style.color = '#fff';
    yesButton.style.border = 'none';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';
    yesButton.onclick = () => {
      document.body.removeChild(dialog);
      resolve(true);
    };

    const noButton = document.createElement('button');
    noButton.innerText = 'Non';
    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#ccc';
    noButton.style.color = '#000';
    noButton.style.border = 'none';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';
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

export const OutgoingMail = ({ isOpen, onClose, language }: OutgoingMailProps) => {
  const [mails, setMails] = useState<Courier[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<Courier | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mailToDelete, setMailToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allMails = courierService.getAll();
      setMails(allMails.filter(mail => mail.type === 'outgoing'));
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
        setMails(prev => prev.filter(mail => mail.id !== mailToDelete));
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
    const mailToEdit = mails.find(mail => mail.id === mailId);
    if (mailToEdit) {
      setSelectedMail(mailToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = (updatedMail: Courier) => {
    setMails(prev => prev.map(mail => (mail.id === updatedMail.id ? updatedMail : mail)));
    setIsEditDialogOpen(false);
    toast.success('Courrier modifié avec succès');
  };

  const handlePrint = () => {
    // Créer un iframe caché pour l'impression
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const tableContent = mails
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
          <title>Liste des Courriers Départ</title>
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
          <h1>Liste des Courriers Départ</h1>
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

  const handleExportPDF = () => {
    console.log("handleExportPDF called");
    if (mails.length === 0) {
      console.log("No mails to export");
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
  
      console.log("Initializing PDF generation");
  
      // Ajouter la police Amiri pour l'arabe
      doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri", "normal");
  
      const columns = [
        { header: language === "ar" ? "رقم" : "N°", dataKey: "number" },
        { header: language === "ar" ? "التاريخ" : "Date", dataKey: "date" },
        { header: language === "ar" ? "المرسل" : "Expéditeur", dataKey: "sender" },
        { header: language === "ar" ? "المستلم" : "Destinataire", dataKey: "recipient" },
        { header: language === "ar" ? "الموضوع" : "Objet", dataKey: "subject" },
      ];
  
      const data = mails.map((mail) => ({
        number: mail.numero || "",
        date: new Date(mail.date).toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR"),
        sender: mail.expediteur || "",
        recipient: mail.destinataire || "",
        subject: mail.objet || "",
      }));
  
      console.log("Data prepared for PDF", data);
  
      autoTable(doc, {
        columns,
        body: data,
        startY: 20,
        styles: {
          fontSize: 8,
          cellPadding: 1,
          overflow: "linebreak",
          halign: "center",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
        },
      });
  
      console.log("Saving PDF");
      doc.save(
        language === "ar"
          ? "قائمة_المراسلات_الصادرة.pdf"
          : "liste_courriers_depart.pdf"
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

  const handleViewDetails = (mailId: string) => {
    const mail = mails.find(mail => mail.id === mailId);
    if (mail) {
      setSelectedMail(mail);
      setIsDetailsDialogOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'البريد الصادر' : 'Courriers Départs'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log("Export PDF button clicked in OutgoingMail");
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
                  {language === 'ar' ? 'تصدير PDF' : 'Exporter en PDF'}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FileText size={18} className="mr-2" />
                  {language === 'ar' ? 'طباعة' : 'Imprimer'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {mails.map(mail => (
                  <div key={mail.id} className="p-4 border rounded-lg hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{mail.subject}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>N° {mail.number}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(mail.date).toLocaleDateString()}</span>
                        </div>
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

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDetailsDialogOpen && (
        <DetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          mail={selectedMail}
        />
      )}

      {isEditDialogOpen && (
        <EditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mail={selectedMail}
          onSave={handleSaveEdit}
        />
      )}

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
