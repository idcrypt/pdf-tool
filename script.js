// === PDF ➝ IMAGES ===
document.getElementById('pdfUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pdfResult = document.getElementById('pdfResult');
  pdfResult.innerHTML = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const img = document.createElement('img');
    img.src = canvas.toDataURL("image/png");

    pdfResult.appendChild(img);
  }
});

// === IMAGES ➝ PDF ===
document.getElementById('makePdf').addEventListener('click', async () => {
  const files = document.getElementById('imgUpload').files;
  if (!files.length) return alert("Please upload some images!");

  const { PDFDocument } = PDFLib;
  const pdfDoc = await PDFDocument.create();

  for (let file of files) {
    const imgBytes = await file.arrayBuffer();
    let img;
    if (file.type === "image/png") {
      img = await pdfDoc.embedPng(imgBytes);
    } else {
      img = await pdfDoc.embedJpg(imgBytes);
    }
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "converted.pdf";
  link.click();
});
