import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Decision } from '../services/decisionService';

export const exportDecisionsPDF = (decisions: Decision[], language: 'fr' | 'ar') => {
  const doc = new jsPDF('landscape');
  const title = language === 'ar' ? 'قائمة القرارات' : 'Liste des Décisions';
  const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR');
  
  // Ajouter le titre
  doc.setFontSize(16);
  doc.text(title, 15, 15);
  
  // Ajouter la date d'exportation
  doc.setFontSize(10);
  doc.text(
    `${language === 'ar' ? 'تاريخ التصدير' : 'Date d\'exportation'}: ${date}`,
    15,
    25
  );

  // Préparer les données pour le tableau
  const tableData = decisions.map(decision => [
    decision.number,
    new Date(decision.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR'),
    decision.subject,
    decision.reference,
    decision.status,
    decision.priority,
    decision.observation || '-'
  ]);

  // Définir les en-têtes du tableau
  const headers = [
    language === 'ar' ? 'الرقم' : 'N°',
    language === 'ar' ? 'التاريخ' : 'Date',
    language === 'ar' ? 'الموضوع' : 'Objet',
    language === 'ar' ? 'المرجع' : 'Référence',
    language === 'ar' ? 'الحالة' : 'Statut',
    language === 'ar' ? 'الأولوية' : 'Priorité',
    language === 'ar' ? 'ملاحظات' : 'Observations'
  ];

  // Configurer le tableau
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'center'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 60 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 40 }
    }
  });

  // Ajouter le numéro de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `${language === 'ar' ? 'صفحة' : 'Page'} ${i} ${language === 'ar' ? 'من' : 'sur'} ${pageCount}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 10
    );
  }

  // Sauvegarder le PDF
  doc.save(`${language === 'ar' ? 'قائمة_القرارات' : 'liste_decisions'}_${date.replace(/\//g, '-')}.pdf`);
}; 