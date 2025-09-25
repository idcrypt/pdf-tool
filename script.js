let imageList = []; // Simpan hasil gambar PDF

// === PDF ➝ IMAGES ===
document.getElementById('convertPdf').addEventListener('click', async () => {
  const fileInput = document.getElementById('pdfUpload');
  const file = fileInput.files[0];
  if (!file) return alert("Please upload a PDF first!");

  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pdfResult = document.getElementById('pdfResult');
  pdfResult.innerHTML = "";
  imageList = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const imgData = canvas.toDataURL("image/png");

    // simpan ke list untuk ZIP
    imageList.push({ name: `page_${pageNum}.png`, data: imgData });

    // tampilkan di halaman
    const img = document.createElement('img');
    img.src = imgData;
    pdfResult.appendChild(img);
  }

  if (imageList.length > 0) {
    document.getElementById('downloadZip').style.display = "inline-block";
  }
});

// === DOWNLOAD ZIP ===
document.getElementById('downloadZip').addEventListener('click', async () => {
  if (imageList.length === 0) return alert("No images to download!");

  const zip = new JSZip();
  const imgFolder = zip.folder("images");

  for (let img of imageList) {
    // convert base64 ke binary
    const base64Data = img.data.split(',')[1];
    imgFolder.file(img.name, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "pdf_images.zip");
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
