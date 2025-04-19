import { Courier, Decision } from '../types/courier';

export const printItem = (item: Courier | Decision, language: "fr" | "ar") => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const htmlContent = `
    <html>
      <head>
        <title>${language === "ar" ? "تفاصيل المراسلة" : "Détails du courrier"}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .detail-row { margin-bottom: 10px; }
          .label { font-weight: bold; margin-right: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${language === "ar" ? "تفاصيل المراسلة" : "Détails du courrier"}</h1>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="label">${language === "ar" ? "الرقم" : "Numéro"}:</span>
            ${item.number}
          </div>
          <div class="detail-row">
            <span class="label">${language === "ar" ? "التاريخ" : "Date"}:</span>
            ${formatDate(item.date)}
          </div>
          <div class="detail-row">
            <span class="label">${language === "ar" ? "الموضوع" : "Objet"}:</span>
            ${item.subject}
          </div>
          ${item.type === "decision" ? `
            <div class="detail-row">
              <span class="label">${language === "ar" ? "الملاحظة" : "Observation"}:</span>
              ${(item as Decision).observation || "Non spécifié"}
            </div>
          ` : `
            <div class="detail-row">
              <span class="label">${language === "ar" ? "المرسل" : "Expéditeur"}:</span>
              ${(item as Courier).sender || "Non spécifié"}
            </div>
            <div class="detail-row">
              <span class="label">${language === "ar" ? "المستلم" : "Destinataire"}:</span>
              ${(item as Courier).recipient || "Non spécifié"}
            </div>
            ${item.type === "incoming" ? `
              <div class="detail-row">
                <span class="label">${language === "ar" ? "المرجع" : "Référence"}:</span>
                ${(item as Courier).reference || "Non spécifié"}
              </div>
              <div class="detail-row">
                <span class="label">${language === "ar" ? "تاريخ المرجع" : "Date de référence"}:</span>
                ${(item as Courier).referenceDate ? formatDate((item as Courier).referenceDate) : "Non spécifié"}
              </div>
              <div class="detail-row">
                <span class="label">${language === "ar" ? "طبيعة المراسلة" : "Nature du courrier"}:</span>
                ${(item as Courier).nature || "Non spécifié"}
              </div>
              <div class="detail-row">
                <span class="label">${language === "ar" ? "التوجيه" : "Orientation"}:</span>
                ${(item as Courier).orientation || "Non spécifié"}
              </div>
            ` : ""}
          `}
        </div>

        <table>
          <thead>
            <tr>
              <th>${language === "ar" ? "التاريخ" : "Date"}</th>
              <th>${language === "ar" ? "الإجراء" : "Action"}</th>
              <th>${language === "ar" ? "المستخدم" : "Utilisateur"}</th>
            </tr>
          </thead>
          <tbody>
            ${item.history.map(entry => `
              <tr>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.action}</td>
                <td>${entry.user}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}; 