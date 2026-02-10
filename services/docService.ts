
import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth';

// Initialize Gemini for high-level semantic tasks
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const splitPdf = async (pdfBytes: Uint8Array, pageRange: string) => {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  
  const pages = pageRange.split(',').flatMap(range => {
    const parts = range.trim().split('-');
    if (parts.length === 2) {
      const start = Number(parts[0]);
      const end = Number(parts[1]);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
    }
    return [Number(parts[0]) - 1];
  });

  const copiedPages = await newDoc.copyPages(srcDoc, pages.filter(p => p >= 0 && p < srcDoc.getPageCount()));
  copiedPages.forEach(page => newDoc.addPage(page));
  
  return await newDoc.save();
};

export const mergePdfs = async (pdfList: Uint8Array[]) => {
  const mergedDoc = await PDFDocument.create();
  for (const bytes of pdfList) {
    const doc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => mergedDoc.addPage(p));
  }
  return await mergedDoc.save();
};

export const imagesToPdf = async (images: string[]) => {
  const doc = new jsPDF();
  for (let i = 0; i < images.length; i++) {
    if (i > 0) doc.addPage();
    const imgProps = doc.getImageProperties(images[i]);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(images[i], 'PNG', 0, 0, pdfWidth, pdfHeight);
  }
  return doc.output('arraybuffer');
};

export const pdfToImage = async (pdfBytes: Uint8Array) => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1); // Default to first page for demo
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context!, viewport }).promise;
  return canvas.toDataURL('image/png');
};

export const wordToPdf = async (docxBytes: Uint8Array) => {
  const { value: text } = await mammoth.extractRawText({ arrayBuffer: docxBytes.buffer });
  const doc = new jsPDF();
  const splitText = doc.splitTextToSize(text, 180);
  doc.text(splitText, 10, 10);
  return doc.output('arraybuffer');
};

export const createWordDoc = async (title: string, content: string) => {
  const ai = getAI();
  const formattingResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Structure the following raw text into a professional document layout. Return only a simple bulleted list of "Section Title: Content" for programmatic parsing: \n\n${content}`,
  });

  const sections = formattingResponse.text.split('\n').filter(l => l.includes(':'));
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 32 })],
        }),
        ...sections.map(s => {
          const parts = s.split(':');
          const head = parts[0];
          const body = parts.slice(1).join(':');
          return new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({ text: head.trim(), bold: true, size: 24 }),
              new TextRun({ text: `\n${body?.trim() || ''}` })
            ]
          });
        })
      ],
    }],
  });

  return await Packer.toBlob(doc);
};
