const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/**
 * Genera un certificado PDF horizontal con diseño limpio y firmas laterales
 * @param {string} nombre - Nombre completo del usuario
 * @param {number} calificacion - Calificación obtenida en el examen
 * @returns {string} Ruta del archivo PDF generado
 */
exports.createCertificate = (nombre, calificacion) => {
  // === 📁 Asegurar carpeta de certificados ===
  const dirCertificados = path.join(__dirname, "../certificados");
  if (!fs.existsSync(dirCertificados)) {
    fs.mkdirSync(dirCertificados, { recursive: true });
  }

  // === 📄 Nombre del archivo ===
  const fileName = `${nombre.replace(/\s+/g, "_")}_certificado.pdf`;
  const pdfPath = path.join(dirCertificados, fileName);

  // === ✏️ Crear documento PDF en horizontal ===
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 50,
  });

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // === 🎨 Fondo y bordes laterales ===
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f9f9ff"); // fondo claro

  // Bordes laterales azul oscuro
  doc.rect(0, 0, 25, doc.page.height).fill("#003366"); // borde izquierdo
  doc.rect(doc.page.width - 25, 0, 25, doc.page.height).fill("#003366"); // borde derecho

  // === 🖼 Logos superiores ===
  const imagesPath = path.join(__dirname, "../images");
  const codeverseLogo = path.join(imagesPath, "codeverse.png");
  const certificadoLogo = path.join(imagesPath, "certificado.png");

  // Logo izquierdo
  if (fs.existsSync(codeverseLogo)) {
    doc.image(codeverseLogo, 50, 20, { width: 120 });
  }

  // Logo derecho
  if (fs.existsSync(certificadoLogo)) {
    doc.image(certificadoLogo, doc.page.width - 170, 20, { width: 120 });
  }

  doc.moveDown(3);

  // === 🏆 Título ===
  doc
    .fillColor("#003366")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text("CERTIFICADO DE APROBACIÓN", { align: "center" });

  doc.moveDown(2);

  // === 👤 Nombre del usuario ===
  doc
    .font("Helvetica")
    .fontSize(18)
    .fillColor("#000")
    .text("Otorgado a:", { align: "center" })
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(nombre, { align: "center" });

  doc.moveDown(1.5);

  // === 📜 Descripción ===
  doc
    .font("Helvetica")
    .fontSize(16)
    .fillColor("#333")
    .text(
      "Por haber aprobado exitosamente el examen de certificación en:",
      { align: "center" }
    )
    .moveDown(0.3)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("JavaScript Developer", { align: "center" });

  doc.moveDown(1.5);

  // === 📈 Calificación y fecha ===
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#000")
    .text(`Calificación obtenida: ${calificacion.toFixed(2)}%`, {
      align: "center",
    })
    .moveDown(0.5)
    .text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, {
      align: "center",
    })
    .moveDown(0.2)
    .text("Aguascalientes, México", { align: "center" }); // ← añadido

  doc.moveDown(3);

  // === 🖊 Firmas ===
  const firma1 = path.join(imagesPath, "firma.jpg");
  const firma2 = path.join(imagesPath, "firma2.png");

  const yFirmas = doc.page.height - 160;
  const yTexto = doc.page.height - 95;

  // Firma izquierda
  if (fs.existsSync(firma1)) {
    doc.image(firma1, 100, yFirmas, { width: 130 });
  }

  // Firma derecha
  if (fs.existsSync(firma2)) {
    doc.image(firma2, doc.page.width - 230, yFirmas, { width: 130 });
  }

  // === 🏢 Nombres bajo las firmas ===
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#003366")
    .text("Instructor: Angel Daniel García de Lara", 80, yTexto, { align: "left" }); // ← cambiado

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#003366")
    .text("Dr. Luis Ángel Barragán González", -80, yTexto, { align: "right" });

  // === 🔲 Marco decorativo ===
  doc
    .lineWidth(2)
    .strokeColor("#003366")
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .stroke();

  // === ✅ Finalizar documento ===
  doc.end();

  console.log(`[PDF] Certificado generado para ${nombre}: ${pdfPath}`);
  return pdfPath;
};
