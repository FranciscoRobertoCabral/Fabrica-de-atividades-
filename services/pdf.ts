
import { jsPDF } from "jspdf";
import { ActivityPack, ActivityConfig } from "../types";

export const createActivityPDF = (pack: ActivityPack, config: ActivityConfig) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;

  pack.activities.forEach((activity, index) => {
    if (index > 0) doc.addPage();

    // Cabeçalho institucional do material
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(pack.collectionName.toUpperCase(), margin, margin - 10);

    // Cabeçalho para o aluno
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("ALUNO(A): ________________________________________________", margin, margin);
    doc.text("DATA: ____/____/________", pageWidth - margin - 45, margin);
    doc.setDrawColor(220);
    doc.line(margin, margin + 5, pageWidth - margin, margin + 5);

    // Título da Atividade (Gerado pela IA)
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(activity.title.toUpperCase(), contentWidth);
    doc.text(titleLines, pageWidth / 2, margin + 20, { align: "center" });

    let currentY = margin + 22 + (titleLines.length * 8);

    // Instrução
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, currentY, contentWidth, 12, "F");
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bolditalic");
    const instrText = `Instrução: ${activity.instruction}`;
    const instrLines = doc.splitTextToSize(instrText, contentWidth - 10);
    doc.text(instrLines, margin + 5, currentY + 7.5);
    currentY += 20;

    // Imagem (Desenho da IA) - Aumentado em 50% (75 * 1.5 = 112.5)
    if (activity.imageData) {
      const imgSize = 112.5;
      const imgX = (pageWidth - imgSize) / 2;
      try {
        doc.addImage(activity.imageData, "PNG", imgX, currentY, imgSize, imgSize);
        currentY += imgSize + 15;
      } catch (e) {
        console.warn("Erro ao inserir imagem", e);
      }
    }

    // Conteúdo / Exercício
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(activity.content, contentWidth);
    doc.text(contentLines, margin, currentY, { lineHeightFactor: 1.4 });

    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(180);
    doc.text(`Fábrica de Atividades | ${pack.collectionName}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Pág. ${index + 1}`, pageWidth - margin - 15, pageHeight - 10);
  });

  const sanitizedFileName = pack.collectionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  doc.save(`${sanitizedFileName}.pdf`);
};
