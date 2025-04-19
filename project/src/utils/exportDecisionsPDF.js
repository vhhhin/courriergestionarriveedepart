import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

const exportDecisionsPDF = (decisions, type = "decision") => {
  if (!decisions || decisions.length === 0) {
    console.warn("Aucune donnée à exporter");
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configuration de la police
  doc.setFont("helvetica");

  // Titre du document selon le type
  doc.setFontSize(16);
  const title = type === "decision" 
    ? "Liste des Décisions" 
    : type === "incoming" 
      ? "Liste des Courriers Arrivées" 
      : "Liste des Courriers Départs";
  doc.text(title, 148.5, 10, { align: "center" });

  // Définition des colonnes selon le type
  const headers = type === "decision" 
    ? [["N°", "Date", "Objet", "Observation", "Auteur", "Statut", "Détails supplémentaires"]]
    : [["N°", "Date", "Expéditeur", "Destinataire", "Objet", "Observation", "Référence"]];

  // Préparation des données avec formatage correct des dates
  const rows = decisions.map((item) => {
    let formattedDate = "N/A";
    try {
      if (item.date) {
        const date = new Date(item.date);
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

    if (type === "decision") {
      return [
        item.number || "",
        formattedDate,
        item.subject || "",
        item.observation || "N/A",
        item.author || "N/A",
        item.status || "N/A",
        item.additionalDetails || "N/A"
      ];
    } else {
      return [
        item.number || "",
        formattedDate,
        item.sender || "N/A",
        item.recipient || "N/A",
        item.subject || "",
        item.observation || "N/A",
        item.reference || "N/A"
      ];
    }
  });

  // Configuration et génération du tableau
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center",
      font: "helvetica",
      fontSize: 10,
      lineWidth: 0.1
    },
    columnStyles: type === "decision" 
      ? {
          0: { cellWidth: 15 },  // N°
          1: { cellWidth: 25 },  // Date
          2: { cellWidth: 50 },  // Objet
          3: { cellWidth: 40 },  // Observation
          4: { cellWidth: 30 },  // Auteur
          5: { cellWidth: 25 },  // Statut
          6: { cellWidth: 50 }   // Détails supplémentaires
        }
      : {
          0: { cellWidth: 15 },  // N°
          1: { cellWidth: 25 },  // Date
          2: { cellWidth: 40 },  // Expéditeur
          3: { cellWidth: 40 },  // Destinataire
          4: { cellWidth: 50 },  // Objet
          5: { cellWidth: 40 },  // Observation
          6: { cellWidth: 30 }   // Référence
        },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { 
      top: 20,
      left: 5,
      right: 5,
      bottom: 20
    },
    tableWidth: 'auto',
    theme: 'grid',
    showHead: 'everyPage',
    didDrawPage: function(data) {
      // Pied de page
      doc.setFontSize(8);
      const pageCount = doc.internal.getNumberOfPages();
      doc.text(`Page ${data.pageNumber} / ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 5);
      doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, doc.internal.pageSize.width - data.settings.margin.right - 40, doc.internal.pageSize.height - 5);
    }
  });

  // Sauvegarde du PDF
  doc.save(`${type === "decision" ? "liste-decisions" : type === "incoming" ? "liste-courriers-arrivees" : "liste-courriers-departs"}.pdf`);
};

export default exportDecisionsPDF;
