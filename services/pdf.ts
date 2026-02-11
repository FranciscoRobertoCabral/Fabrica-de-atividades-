
import { jsPDF } from "jspdf";
import { ActivityData, ActivityConfig } from "../types";

export const createActivityPDF = (activities: ActivityData[], config: ActivityConfig) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;

  activities.forEach((activity, index) => {
    if (index > 0) doc.addPage();

    // --- Header ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Nome: __________________________________________________", margin, margin);
    doc.text("Data: ____/____/________", pageWidth - margin - 40, margin);
    
    // --- Divider ---
    doc.setDrawColor(200);
    doc.line(margin, margin + 5, pageWidth - margin, margin + 5);

    // --- Title ---
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Indigo-800
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(activity.title.toUpperCase(), contentWidth);
    doc.text(titleLines, pageWidth / 2, margin + 20, { align: "center" });

    let currentY = margin + 20 + (titleLines.length * 10);

    // --- Metadata Badge ---
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text(`${config.level} | ${config.type} | Tema: ${config.theme}`, margin, currentY);
    currentY += 10;

    // --- Instruction Section ---
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(margin, currentY, contentWidth, 15, "F");
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bolditalic");
    const instrText = `Instrução: ${activity.instruction}`;
    const instrLines = doc.splitTextToSize(instrText, contentWidth - 10);
    doc.text(instrLines, margin + 5, currentY + 10);
    currentY += 25;

    // --- Main Content ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(activity.content, contentWidth);
    
    // Check if content fits, if not, it will bleed (simplification for this demo)
    doc.text(contentLines, margin, currentY, { lineHeightFactor: 1.5 });

    // --- Exercises / Space ---
    // Here we could add dynamic lines or boxes if needed.
    
    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("Fábrica de Atividades", pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Página ${index + 1} de ${activities.length}`, pageWidth - margin - 20, pageHeight - 10);
  });

  const filename = `atividades-${config.theme.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
};
