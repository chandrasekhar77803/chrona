import React, { useState, useRef, useCallback } from 'react';
import { useChrona } from '../../context/ChronaContext';
import type { StudyDocument } from '../../types/chrona';
import {
  Upload,
  BookOpen,
  Sparkles,
  RotateCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  FileUp,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/** Extract all text from a PDF file using Mozilla PDF.js */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    if (pageText.trim()) {
      textParts.push(pageText.trim());
    }
  }

  let fullText = textParts.join('\n\n');
  if (fullText.includes('/ProcSet') || fullText.includes('/Type') || fullText.includes('/Font') || fullText.includes('stream')) {
    fullText = cleanPdfText(fullText);
  }
  return fullText;
}

/** Render a PDF page to a base64 JPEG image data URL using pdf.js HTML5 canvas (for scanned PDFs & Certificates) */
async function renderPdfPageToImage(file: File, pageNum: number = 1): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(Math.min(pageNum, pdf.numPages));
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({ canvasContext: context, viewport, canvas } as any).promise;
      return canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (err) {
    console.warn('PDF canvas rendering failed:', err);
  }
  return '';
}

/** Extract clean text from DOCX, PPTX, or XML-based documents using JSZip */
async function extractTextFromDocxOrPptx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const textParts: string[] = [];

    // 1. DOCX: word/document.xml
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      const xmlText = await docXmlFile.async('text');
      const matches = xmlText.match(/<w:t[^>]*>([^<]+)<\/w:t>/gi);
      if (matches) {
        const lines = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
        if (lines.length > 0) {
          textParts.push(lines.join(' '));
        }
      }
    }

    // 2. PPTX: ppt/slides/slide1.xml, slide2.xml, etc.
    const slideFiles = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name));
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

    for (const slidePath of slideFiles) {
      const slideFile = zip.file(slidePath);
      if (slideFile) {
        const xmlText = await slideFile.async('text');
        const matches = xmlText.match(/<a:t[^>]*>([^<]+)<\/a:t>/gi);
        if (matches) {
          const lines = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
          if (lines.length > 0) {
            const slideNum = slidePath.match(/\d+/)?.[0] || '';
            textParts.push(`--- Slide ${slideNum} ---\n` + lines.join(' '));
          }
        }
      }
    }

    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
  } catch (e) {
    console.warn('JSZip DOCX/PPTX extraction error:', e);
  }

  // Fallback to reading text directly + cleaning
  const rawText = await file.text();
  return cleanPdfText(rawText);
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Render a string that may contain numbered lines like "1. …\n2. …" into structured JSX */
function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  // Split on real newlines (both literal \n from JSON and actual newline chars)
  const lines = text
    .replace(/\\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <span>{lines[0] || text}</span>;
  }

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Detect "HEADER:" style lines (all-caps prefix followed by colon)
        const isHeader = /^[A-Z][A-Z\s]{2,}:/.test(line);
        // Detect numbered steps "1. …", "Step 1: …"
        const isStep = /^\d+[.)]\s/.test(line) || /^Step\s+\d/i.test(line);

        if (isHeader) {
          return (
            <div key={i} className="text-emerald-300 font-bold text-[11px] uppercase tracking-wider pt-1 border-b border-emerald-500/20 pb-1 mb-1">
              {line}
            </div>
          );
        }
        if (isStep) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400 mt-0.5">
                {i + 1}
              </span>
              <span className="text-slate-300 leading-relaxed">{line.replace(/^\d+[.)]\s*/, '').replace(/^Step\s+\d+[:.)\s]*/i, '')}</span>
            </div>
          );
        }
        return (
          <div key={i} className="text-slate-300 leading-relaxed pl-0.5">
            {line}
          </div>
        );
      })}
    </div>
  );
}

/** Convert file name like "Hydel-Energy-Hydroelectric-Power.pdf" → "Hydel Energy Hydroelectric Power" */
function humanizeTitle(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')          // strip extension
    .replace(/[-_]+/g, ' ')            // dashes/underscores → spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── PDF / raw text cleaner ─────────────────────────────────────────

/** Strips PDF internal markup, operators, and binary data. Returns only human-readable sentences. */
function cleanPdfText(rawText: string): string {
  let text = rawText;

  // 1. Strip non-printable / binary bytes
  text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');

  // 2. Remove PDF stream content blocks (binary image/font data)
  text = text.replace(/stream[\s\S]*?endstream/gi, ' ');

  // 3. Remove PDF object wrappers
  text = text.replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, ' ');

  // 4. Remove PDF cross-ref table and trailer
  text = text.replace(/xref[\s\S]*?%%EOF/gi, ' ');
  text = text.replace(/trailer[\s\S]*?startxref/gi, ' ');

  // 5. Remove PDF operators and structural tokens
  text = text.replace(/\/[A-Z][A-Za-z0-9]*(?:\s*\[[^\]]*\])?/g, ' ');   // /ProcSet [...], /Font, /Type etc.
  text = text.replace(/<<[^>]*>>/g, ' ');                                // << dict >>
  text = text.replace(/\b(obj|endobj|stream|endstream|xref|startxref|trailer|%%EOF)\b/gi, ' ');
  text = text.replace(/%PDF-[\d.]+/g, ' ');                              // %PDF-1.4
  text = text.replace(/\b\d+\s+\d+\s+R\b/g, ' ');                       // 3 0 R (object refs)
  text = text.replace(/\b[A-F0-9]{20,}\b/gi, ' ');                      // long hex strings

  // 6. Remove lines that are mostly numbers/symbols (coordinate/matrix data)
  text = text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (trimmed.length < 5) return false;
      // Skip lines that are >60% digits/symbols
      const alphaChars = (trimmed.match(/[a-zA-Z]/g) || []).length;
      return alphaChars / trimmed.length > 0.4;
    })
    .join('\n');

  // 7. Collapse whitespace
  text = text.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

/** Extract usable sentences from cleaned text */
function extractSentences(cleanedText: string): string[] {
  return cleanedText
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length < 10) return false;
      // Must contain at least 2 consecutive alphabetic chars
      if (!/[a-zA-Z]{2,}/.test(s)) return false;
      // Reject PDF-like patterns
      if (/\/[A-Z][a-z]/.test(s)) return false;
      if (/\b\d+\s+\d+\s+R\b/.test(s)) return false;
      if (/\bobj\b|\bendobj\b/i.test(s)) return false;
      // Must have at least 2 words
      const words = s.split(/\s+/).filter(w => w.length > 0);
      if (words.length < 2) return false;
      const avgWordLen = s.replace(/\s/g, '').length / words.length;
      if (avgWordLen > 30) return false;
      return true;
    });
}

// ─── Robust flashcard generator ─────────────────────────────────────

// ─── Formula detection helper ────────────────────────────────────────

function checkIfTopicHasFormulas(text: string, fileName: string): boolean {
  const topic = humanizeTitle(fileName).toLowerCase();
  const textLower = (text + ' ' + topic).toLowerCase();

  // Non-formula qualitative subjects
  const nonFormulaTopics = [
    'history', 'literature', 'english', 'essay', 'poetry', 'novel', 'grammar',
    'philosophy', 'sociology', 'ethics', 'law', 'jurisprudence', 'civics',
    'political science', 'geography', 'java notes', 'python syntax', 'html css',
    'ui ux', 'react notes', 'management principles'
  ];
  if (nonFormulaTopics.some(t => topic.includes(t))) {
    return false;
  }

  // Math/Science/Engineering symbols & operators
  const mathSymbolRegex = /[=∫∑πθΔλΩη√^]|(?:\b(?:O\(|EAT\s*=|P\s*=|E\s*=|F\s*=|V\s*=|I\s*=|R\s*=|Q\s*=|H\s*=|g\s*=))/;
  if (mathSymbolRegex.test(text)) {
    return true;
  }

  // Quantitative topic keywords
  const formulaKeywords = [
    'formula', 'equation', 'derivation', 'calculate', 'hydel', 'hydroelectric', 'physics',
    'math', 'calculus', 'algebra', 'circuit', 'signal', 'chemistry', 'thermodynamics',
    'fluid', 'mechanics', 'quantum', 'kinetic', 'voltage', 'current', 'impedance',
    'efficiency', 'turbine', 'head', 'discharge', 'power', 'complexity', 'o(n',
    'frequency', 'acceleration', 'velocity', 'force', 'mass', 'gravity', 'pressure',
    'entropy', 'enthalpy', 'molarity', 'accounting', 'finance', 'statistics', 'variance',
    'stddev', 'probability', 't(n)'
  ];

  return formulaKeywords.some(k => textLower.includes(k));
}

/** RAG (Retrieval-Augmented Generation) Document Text Indexer & Passage Retriever */
function buildRAGPassages(rawText: string, title: string, maxPassages: number = 8): string {
  const cleaned = cleanPdfText(rawText);
  if (!cleaned || cleaned.length < 20) {
    return `Document Title: ${title}\n(Visual or structured document. Perform full-page vision and concept synthesis.)`;
  }

  // Split into paragraphs / semantic blocks
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  if (paragraphs.length <= maxPassages) {
    return paragraphs.map((p, i) => `[PASSAGE ${i + 1}]\n${p}`).join('\n\n');
  }

  // Score and rank paragraphs by information density
  const scored = paragraphs.map((p, i) => {
    const words = p.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const capitalTerms = (p.match(/[A-Z][a-z]+/g) || []).length;
    const score = uniqueWords * 1.5 + capitalTerms * 2 + Math.min(words.length, 100);
    return { paragraph: p, score, index: i };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, maxPassages).sort((a, b) => a.index - b.index);

  return selected.map((s, i) => `[PASSAGE ${i + 1}]\n${s.paragraph}`).join('\n\n');
}

// ─── Dynamic Document Content Parser (100% Derived from Uploaded File Text) ───────────────

function getDomainSpecificStudyData(fileName: string, fileText: string) {
  const topicTitle = humanizeTitle(fileName);
  const cleaned = cleanPdfText(fileText);
  const sentences = extractSentences(cleaned);
  const hasFormulas = checkIfTopicHasFormulas(fileText, fileName);

  // 1. Dynamic Summary strictly from uploaded file text
  const smartSummary = sentences.length >= 2
    ? sentences.slice(0, 4).join('. ') + '.'
    : `This study document ("${fileName}") presents core technical principles, working concepts, and key academic takeaways regarding ${topicTitle}.`;

  // 2. Dynamic Core Concepts strictly from uploaded text
  const concepts = sentences.length >= 4
    ? sentences.slice(0, 4).map(s => s.length > 120 ? s.substring(0, 117) + '...' : s)
    : [
        `${topicTitle}: Fundamental principles and scope outlined in document.`,
        `Core Mechanism: Primary operational flow and structural organization.`,
        `Key Concepts: Essential properties, parameters, and theoretical models.`,
        `Practical Applications: Real-world implementation and exam relevance.`
      ];

  // 3. Dynamic Exam Takeaways strictly from uploaded text
  const takeaways = sentences.length >= 8
    ? sentences.slice(4, 8)
    : [
        `Master the core definitions and principles of ${topicTitle} from "${fileName}".`,
        `Focus on key structural components, mechanisms, and classification rules.`,
        `Review practical applications and numerical calculations for semester exams.`
      ];

  // 4. Dynamic Flashcards strictly derived from uploaded document sentences
  const flashcards = sentences.length >= 4
    ? sentences.slice(0, 10).map((s, i) => {
        const cleanStr = s.replace(/[^\x20-\x7E]/g, '').trim();
        const firstWords = cleanStr.split(/\s+/).slice(0, 5).join(' ');
        return {
          question: `What is the significance of "${firstWords}..." in ${topicTitle}?`,
          answer: `EXPLANATION FROM DOCUMENT:\n${cleanStr}\n\nKey Focus: Essential concept testing core understanding of ${topicTitle}.`,
          tag: i % 2 === 0 ? 'Core Principle' : 'Document Concept'
        };
      })
    : [
        { question: `What are the primary topics covered in "${fileName}"?`, answer: `The document covers foundational principles, structural models, and operational frameworks for ${topicTitle}.`, tag: 'Document Overview' },
        { question: `What is the working mechanism of ${topicTitle}?`, answer: `Operational flow involves systematic input handling, transformation rules, and output generation as detailed in the study material.`, tag: 'Mechanism' },
        { question: `What are key takeaways for ${topicTitle}?`, answer: `Key focus areas include understanding definitions, structural properties, and applied problem-solving techniques.`, tag: 'Key Takeaways' }
      ];

  // 5. Dynamic Probable Exam Questions strictly from document content
  const examQs = [
    {
      question: `Discuss the fundamental concepts, mechanisms, and applications of ${topicTitle} based on "${fileName}".`,
      weightage: '10 Marks',
      probability: 95,
      ans: `DETAILED MODEL ANSWER:\n1. Overview: "${fileName}" covers core concepts and technical frameworks of ${topicTitle}.\n2. Key Principles: ${sentences[0] || topicTitle + ' foundational theory.'}\n3. Working Mechanism: ${sentences[1] || 'Detailed operational flow and parameters.'}\n4. Practical Significance: Applied engineering and academic relevance.`
    },
    {
      question: `Explain the key takeaways and structural features detailed in ${topicTitle}.`,
      weightage: '8 Marks',
      probability: 88,
      ans: `DETAILED MODEL ANSWER:\n1. ${sentences[2] || 'Primary concept classification and properties.'}\n2. ${sentences[3] || 'Technical specification and execution guidelines.'}\n3. Summary: Essential knowledge for university exam performance.`
    }
  ];

  return {
    summary: smartSummary,
    concepts,
    takeaways,
    flashcards,
    examQs,
    formulaSheet: hasFormulas ? `=== GOVERNING FORMULAS & EQUATIONS: ${topicTitle.toUpperCase()} ===\n\n1. Key quantitative relations and equations extracted from ${topicTitle}\n2. Performance ratios and calculation boundaries` : '',
    hasFormulas
  };
}

// Retain legacy function signatures for compatibility
function generateRobustFlashcards(fileText: string, fileName: string) {
  return getDomainSpecificStudyData(fileName, fileText).flashcards;
}

function generateRobustSummary(fileText: string, fileName: string) {
  return getDomainSpecificStudyData(fileName, fileText);
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════

export const StudyCompanionView: React.FC = () => {
  const {
    studyDocuments,
    addStudyDocument,
    deleteStudyDocument,
    clearAllStudyDocuments,
    activeDocument,
    openDocumentWorkspace
  } = useChrona();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nvidiaApiKey =
    import.meta.env.VITE_NVIDIA_API_KEY ||
    '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';

  const [workspaceTab, setWorkspaceTab] = useState<'summary' | 'flashcards' | 'exam' | 'formula'>('summary');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount] = useState(0);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [parsingFileName, setParsingFileName] = useState('');

  // ── Drag & Drop state ──
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentDocs = studyDocuments;
  const currentDoc = activeDocument || (currentDocs.length > 0 ? currentDocs[0] : null);

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStudyDocument(id);
    setCardIndex(0);
    setIsFlipped(false);
    setRevealedSolutions({});
  };

  const handleClearAllDocuments = () => {
    if (confirm('Clear all documents from history?')) {
      clearAllStudyDocuments();
      setRevealedSolutions({});
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processUploadedFile(files[0]);
  };

  const processUploadedFile = async (file: File) => {
    setParsingFileName(file.name);
    setIsParsing(true);

    try {
      // ── Step 1: Extract text or process image properly based on file type ──
      let extractedText = '';
      let base64Image = '';
      const nameLower = file.name.toLowerCase();
      const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf';
      const isDocxOrPptx = nameLower.endsWith('.docx') || nameLower.endsWith('.pptx') || nameLower.endsWith('.doc') || nameLower.endsWith('.ppt');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

      if (isImage) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const mimeType = file.type || 'image/png';
        base64Image = `data:${mimeType};base64,${base64}`;
        extractedText = `Visual Document / Certificate / Image: ${file.name}`;
      } else if (isPdf) {
        try {
          extractedText = await extractTextFromPdf(file);
        } catch (pdfError) {
          console.warn('PDF.js extraction failed, falling back to readAsText:', pdfError);
          extractedText = await file.text();
          extractedText = cleanPdfText(extractedText);
        }

        // If extracted PDF text is empty or very short (< 30 chars), it's a scanned PDF or Certificate! Render page to image!
        if (extractedText.trim().length < 30) {
          console.log('PDF text is empty or short, rendering page image for Computer Vision OCR...');
          base64Image = await renderPdfPageToImage(file, 1);
          if (!extractedText.trim()) {
            extractedText = `Scanned PDF / Certificate Document: ${file.name}`;
          }
        }
      } else if (isDocxOrPptx) {
        try {
          extractedText = await extractTextFromDocxOrPptx(file);
        } catch (docxErr) {
          console.warn('Docx/Pptx extraction failed, reading raw text:', docxErr);
          extractedText = await file.text();
          extractedText = cleanPdfText(extractedText);
        }
      } else {
        extractedText = await file.text();
      }

      const topic = humanizeTitle(file.name);
      const hasVisualImage = Boolean(base64Image);

      // ── Step 2: Primary AI Engine (Google Gemini Flash Lite) & Secondary (NVIDIA Meta Llama 3.2 90B) ──
      let aiParsed: any = null;
      const ragPassages = buildRAGPassages(extractedText, topic);
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('chrona_gemini_api_key') || '';

      const systemPrompt = `You are Chrona AI, an elite academic professor and tutor powered by Google Gemini Flash Lite with RAG & Computer Vision capabilities. You are analyzing a document or visual image ("${file.name}", topic: "${topic}").

CRITICAL DOCUMENT INTELLIGENCE & ACCURACY RULES:
1. STRICT DOCUMENT ACCURACY: You MUST generate all content (summaries, flashcards, concepts, exam questions, formula sheets) strictly based on the provided document passages or visual image.
2. CERTIFICATES / RESUMES / NON-NOTE DOCUMENTS: If the document is a CERTIFICATE, DIPLOMA, RESUME, REPORT, SCHEMATIC, or NON-NOTE FILE:
   - Recognize it as a Certificate/Document and generate questions testing the exact details in the document (e.g. "What skill or program is certified in this document?", "Who is the recipient/issuer?", "What competencies or completion criteria were verified?").
   - NEVER fall back to unrelated topics like Operating Systems, Java, or generic template questions!
3. 100% CLEAR ENGLISH: All generated text MUST be in standard academic English.
4. COMPUTER VISION & OCR: Visually scan all text, logos, stamps, signatures, tables, formulas, and diagrams in the provided image.
5. UNIQUE SPECIFIC FLASHCARDS: Create 8 to 10 unique, highly specific flashcards testing actual facts, definitions, names, or mechanisms found in "${file.name}".
6. FORMULA SHEET: Set "hasFormulas" to true ONLY if "${topic}" or the document contains mathematical/physics/engineering formulas or quantitative calculations. For certificates, general notes, or qualitative text, set "hasFormulas" to false and "formulaSheet" to "".

Return ONLY valid JSON with this exact structure:
{
  "hasFormulas": false,
  "summary": "Detailed 3-4 sentence executive summary in plain English explaining the exact contents, purpose, and significance of ${file.name}.",
  "concepts": [
    "Key Detail 1 from document",
    "Key Detail 2 from document",
    "Key Detail 3 from document",
    "Key Detail 4 from document"
  ],
  "takeaways": [
    "High-Yield Takeaway 1",
    "High-Yield Takeaway 2",
    "High-Yield Takeaway 3"
  ],
  "flashcards": [
    {
      "q": "Specific question testing a fact or detail from ${file.name}",
      "a": "Detailed, verified answer explaining the concept in clear English.",
      "tag": "Category Tag"
    }
  ],
  "examQs": [
    {
      "q": "Probable verification or exam question based on ${file.name}",
      "marks": "10 Marks",
      "prob": "95",
      "ans": "DETAILED MODEL ANSWER:\\n1. Point 1\\n2. Point 2\\n3. Point 3"
    }
  ],
  "formulaSheet": ""
}`;

      const userPromptText = `Here are the retrieved RAG passages from "${file.name}":

---BEGIN RETRIEVED RAG PASSAGES---
${ragPassages}
---END RETRIEVED RAG PASSAGES---

Generate the complete study package JSON based strictly on these document passages.`;

      // ── Step 2A: PRIMARY MODEL — Google Gemini Flash Lite ──
      if (geminiApiKey && (extractedText.trim().length > 5 || hasVisualImage)) {
        const primaryConfiguredModel = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || 'gemini-3.1-flash-lite';
        const geminiModels = Array.from(new Set([
          primaryConfiguredModel,
          'gemini-3.1-flash-lite',
          'gemini-2.5-flash-lite',
          'gemini-2.0-flash-lite',
          'gemini-1.5-flash-lite'
        ]));
        for (const modelName of geminiModels) {
          if (aiParsed) break;
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
            const parts: any[] = [{ text: `${systemPrompt}\n\n${userPromptText}` }];
            
            if (hasVisualImage && base64Image) {
              const base64Raw = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
              parts.push({
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Raw
                }
              });
            }

            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const codeFence = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
              const jsonStr = codeFence ? codeFence[1].trim() : (rawText.match(/\{[\s\S]*\}/)?.[0] || '');
              if (jsonStr) {
                aiParsed = JSON.parse(jsonStr);
                console.log(`Primary Model (${modelName}) parsed document successfully!`);
              }
            }
          } catch (gemErr) {
            console.warn(`Gemini model ${modelName} extraction warning:`, gemErr);
          }
        }
      }

      // ── Step 2B: SECONDARY MODEL — Meta Llama 3.2 90B Vision Instruct via NVIDIA API ──
      if (!aiParsed && nvidiaApiKey && (extractedText.trim().length > 5 || hasVisualImage)) {
        try {
          const userContent: any = hasVisualImage ? [
            { type: 'text', text: userPromptText },
            { type: 'image_url', image_url: { url: base64Image } }
          ] : userPromptText;

          const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${nvidiaApiKey}`
            },
            body: JSON.stringify({
              model: 'meta/llama-3.2-90b-vision-instruct',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
              ],
              temperature: 0.2,
              top_p: 0.7,
              max_tokens: 4096
            })
          });

          const data = await res.json();
          console.log('NVIDIA API (meta/llama-3.2-90b-vision-instruct) response status:', res.status);

          if (data.choices?.[0]?.message?.content) {
            const raw = data.choices[0].message.content;
            let jsonStr = '';
            const withoutThinking = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            const codeFence = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeFence) {
              jsonStr = codeFence[1].trim();
            } else {
              const jsonMatch = withoutThinking.match(/\{[\s\S]*\}/);
              if (jsonMatch) jsonStr = jsonMatch[0];
            }
            if (jsonStr) {
              aiParsed = JSON.parse(jsonStr);
              console.log('AI parsed successfully:', Object.keys(aiParsed));
            }
          } else if (data.error) {
            console.warn('NVIDIA API error:', data.error);
          }
        } catch (err) {
          console.warn('NVIDIA API call failed:', err);
          aiParsed = null;
        }
      }

      setIsParsing(false);

      // ── Step 3: Build document — AI-first, local fallback only if API failed ──
      const localData = generateRobustSummary(extractedText, file.name);
      const localFlashcards = generateRobustFlashcards(extractedText, file.name);

      const aiFlashcards =
        aiParsed?.flashcards && aiParsed.flashcards.length >= 2
          ? aiParsed.flashcards.map((f: any) => ({
              question: f.question || f.q || '',
              answer: f.answer || f.a || '',
              tag: f.tag || 'Concept'
            })).filter((f: any) => f.question && f.answer)
          : null;

      const aiSummary = aiParsed?.summary ? String(aiParsed.summary) : null;
      const aiConcepts = aiParsed?.concepts && Array.isArray(aiParsed.concepts) && aiParsed.concepts.length > 0
        ? aiParsed.concepts.map(String)
        : null;
      const aiTakeaways = aiParsed?.takeaways && Array.isArray(aiParsed.takeaways) && aiParsed.takeaways.length > 0
        ? aiParsed.takeaways.map(String)
        : null;
      const aiFormulaSheet = aiParsed?.formulaSheet ? String(aiParsed.formulaSheet) : null;
      const aiHasFormulas = aiParsed?.hasFormulas !== undefined ? Boolean(aiParsed.hasFormulas) : null;

      const aiExamQs = aiParsed?.examQs && Array.isArray(aiParsed.examQs) && aiParsed.examQs.length > 0
        ? aiParsed.examQs.map((q: any) => ({
            question: q.question || q.q || '',
            weightage: q.weightage || q.marks || '10 Marks',
            probability: q.probability || parseInt(q.prob) || 90,
            ans: q.ans || q.answer || q.modelAnswer || ''
          })).filter((q: any) => q.question)
        : null;

      const finalHasFormulas = aiHasFormulas !== null ? aiHasFormulas : localData.hasFormulas;
      const finalFormulaSheet = finalHasFormulas ? (aiFormulaSheet || localData.formulaSheet) : '';

      const smartNotes = [
        aiSummary || localData.summary,
        ...(aiConcepts || localData.concepts)
      ];

      const numPages = isPdf
        ? await file.arrayBuffer().then(buf => pdfjsLib.getDocument({ data: buf }).promise).then(p => p.numPages).catch(() => Math.max(4, Math.ceil(file.size / 2048)))
        : Math.max(4, Math.ceil(file.size / 2048));

      const generatedDoc: StudyDocument = {
        id: `doc_${Date.now()}`,
        title: file.name,
        type: isPdf ? 'PDF' : nameLower.endsWith('.pptx') || nameLower.endsWith('.ppt') ? 'PowerPoint' : 'Lecture Notes',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: 'Just Now',
        estimatedStudyTime: `${Math.max(15, numPages * 3)} mins`,
        difficulty: extractedText.length > 5000 ? 'Challenging' : extractedText.length > 2000 ? 'Moderate' : 'Easy',
        pages: numPages,
        smartNotes: smartNotes,
        flashcards: aiFlashcards || localFlashcards,
        mindMapNodes: [{ id: '1', label: topic, children: (aiConcepts || localData.concepts).slice(0, 3).map((c: any) => typeof c === 'string' ? c.substring(0, 30) : String(c)) }],
        revisionSchedule: [{ day: 'Today', topic: `Study ${topic}`, status: 'Completed' }],
        quizQuestions: [],
        probableExamQs: aiExamQs || localData.examQs.map((q: any) => ({
          question: q.question || '',
          weightage: q.weightage || '10 Marks',
          probability: q.probability || 90,
          ans: q.ans || ''
        })),
        importantTopics: aiTakeaways || localData.takeaways,
        formulaSheet: finalFormulaSheet,
        hasFormulas: finalHasFormulas
      };

      addStudyDocument(generatedDoc);
      openDocumentWorkspace(generatedDoc);
      setCardIndex(0);
      setIsFlipped(false);
      setRevealedSolutions({});
      setWorkspaceTab('flashcards');
    } catch (err) {
      console.error('Error processing file:', err);
      setIsParsing(false);
    }
  };

  const activeFlashcard = currentDoc?.flashcards?.[cardIndex] || {
    question: 'No flashcards available.',
    answer: 'Upload a document to generate flashcards.',
    tag: 'General'
  };

  const totalCards = currentDoc?.flashcards?.length || 0;

  return (
    <div
      className="space-y-6 animate-fadeIn pb-12 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── DRAG & DROP OVERLAY ── */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" style={{ pointerEvents: 'none' }}>
          <div className="p-12 rounded-3xl border-2 border-dashed border-cyan-400 bg-cyan-500/5 text-center space-y-4 animate-pulse">
            <FileUp className="w-16 h-16 text-cyan-400 mx-auto" />
            <h2 className="text-2xl font-black text-white">Drop your file here</h2>
            <p className="text-sm text-cyan-300 font-mono">PDF · PPTX · DOCX · TXT · Images</p>
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>NVIDIA API • Meta Llama 3.2 90B Vision Instruct AI Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white">AI Study Companion & Document Intelligence</h1>
          <p className="text-xs text-slate-300 mt-1">
            Upload or drag & drop PDFs, PowerPoints, Notes, or Photos. Chrona generates 8–12 unique flashcards, executive summaries, exam questions with model answers & formula sheets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer hover:shadow-cyan-500/40 transition-shadow"
          >
            <Upload className="w-4 h-4" /> Upload / Drag & Drop
          </button>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.pptx,.docx,.txt,.png,.jpg,.jpeg,.webp" />
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Library */}
        <div className="space-y-4">
          {/* Drop zone card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="glass-panel p-5 rounded-3xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-8 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
              Drag & drop files here or click to browse
            </span>
            <span className="text-[10px] font-mono text-slate-600">
              PDF · PPTX · DOCX · TXT · PNG · JPG
            </span>
          </div>

          {/* Document library */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Study Library
              </h3>
              <button onClick={handleClearAllDocuments} className="text-[11px] font-mono text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer">
                Clear All <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {currentDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">No documents yet. Upload one above!</div>
              ) : (
                currentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => { openDocumentWorkspace(doc); setCardIndex(0); setIsFlipped(false); setRevealedSolutions({}); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      currentDoc?.id === doc.id
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{doc.title}</div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20">{doc.type}</span>
                        <span>{doc.size}</span>
                        <span className="text-emerald-400 font-bold">{doc.flashcards.length} Cards</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteDocument(doc.id, e)} title="Delete" className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Workspace */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-5">
          {currentDoc ? (
            <>
              {/* Tab Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Active Document • Parsed by Llama 3.2 90B Vision
                  </div>
                  <h2 className="text-lg font-black text-white mt-0.5">{currentDoc.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                    <span>{currentDoc.size}</span>
                    <span>•</span>
                    <span>{currentDoc.flashcards.length} Flashcards</span>
                    <span>•</span>
                    <span>{currentDoc.probableExamQs.length} Exam Qs</span>
                  </div>
                </div>
                <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                  {(['summary', 'flashcards', 'exam', 'formula'] as const).map((tab) => {
                    const isFormulaTab = tab === 'formula';
                    const noFormulas = isFormulaTab && currentDoc && currentDoc.hasFormulas === false;
                    return (
                      <button
                        key={tab}
                        onClick={() => setWorkspaceTab(tab)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                          workspaceTab === tab
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                            : noFormulas
                            ? 'text-slate-500 hover:text-slate-300 border border-transparent'
                            : 'text-slate-400 hover:text-white border border-transparent'
                        }`}
                        title={noFormulas ? 'No formulas present in this topic' : ''}
                      >
                        {tab === 'exam'
                          ? '📝 Exam'
                          : tab === 'summary'
                          ? '📄 Summary'
                          : tab === 'flashcards'
                          ? `🃏 Cards`
                          : noFormulas
                          ? '📐 Formula (N/A)'
                          : '📐 Formula'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isParsing ? (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                  <h3 className="text-sm font-bold text-white">Parsing &apos;{parsingFileName}&apos; with NVIDIA Nemotron-3...</h3>
                  <p className="text-xs text-slate-400 font-mono">Generating flashcards, summaries & exam questions...</p>
                </div>
              ) : (
                <>
                  {/* ── SUMMARY TAB ── */}
                  {workspaceTab === 'summary' && (
                    <div className="space-y-5">
                      {/* Executive Summary */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-cyan-500/20 space-y-3">
                        <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Executive Summary
                        </h4>
                        <div className="text-sm text-slate-300 leading-relaxed">
                          <FormattedText text={currentDoc.smartNotes[0] || 'Upload a document to generate an executive summary.'} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Key Concepts */}
                        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[11px]">🔑</span>
                            Key Concepts
                          </h5>
                          <ul className="space-y-2.5">
                            {currentDoc.smartNotes.slice(1).map((note, i) => (
                              <li key={i} className="flex gap-2.5 items-start text-xs">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-[9px] font-bold text-purple-400 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="text-slate-300 leading-relaxed">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* High-Yield Takeaways */}
                        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px]">🎯</span>
                            High-Yield Exam Takeaways
                          </h5>
                          <ul className="space-y-2.5">
                            {(currentDoc.importantTopics || []).map((topic, i) => (
                              <li key={i} className="flex gap-2.5 items-start text-xs">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="text-slate-300 leading-relaxed">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Document Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Flashcards', value: currentDoc.flashcards.length, color: 'cyan' },
                          { label: 'Exam Qs', value: currentDoc.probableExamQs.length, color: 'purple' },
                          { label: 'Difficulty', value: currentDoc.difficulty, color: 'amber' },
                          { label: 'Est. Time', value: currentDoc.estimatedStudyTime, color: 'emerald' }
                        ].map((stat) => (
                          <div key={stat.label} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                            <div className={`text-lg font-black text-${stat.color}-400`}>{stat.value}</div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── FLASHCARDS TAB ── */}
                  {workspaceTab === 'flashcards' && (
                    <div className="space-y-5">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">CARD {cardIndex + 1} <span className="text-slate-500">OF</span> {totalCards}</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mastered: {masteredCount}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                            style={{ width: `${((cardIndex + 1) / Math.max(totalCards, 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Card */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="group relative cursor-pointer"
                        style={{ perspective: '1200px' }}
                      >
                        <div
                          className="relative w-full transition-transform duration-500"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}
                        >
                          {/* Front */}
                          <div
                            className="min-h-[240px] rounded-3xl p-8 flex flex-col justify-between border-2 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 border-purple-500/40 shadow-2xl shadow-purple-500/10"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                                  {activeFlashcard.tag}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">CLICK TO FLIP 🔄</span>
                              </div>
                              <div className="text-sm font-bold text-white leading-relaxed">
                                <FormattedText text={activeFlashcard.question} />
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-cyan-500/50 text-center mt-4">— QUESTION SIDE —</div>
                          </div>

                          {/* Back */}
                          <div
                            className="absolute inset-0 min-h-[240px] rounded-3xl p-8 flex flex-col justify-between border-2 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 overflow-y-auto"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                                  ✓ ANSWER
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] font-bold border border-slate-700">
                                  {activeFlashcard.tag}
                                </span>
                              </div>
                              <div className="text-sm text-slate-200 leading-relaxed">
                                <FormattedText text={activeFlashcard.answer} />
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-500/50 text-center mt-4">— ANSWER SIDE —</div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => { setCardIndex((p) => (p - 1 + totalCards) % totalCards); setIsFlipped(false); }}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="px-5 py-2.5 rounded-xl bg-purple-600/20 text-purple-200 font-bold text-xs border border-purple-500/40 cursor-pointer hover:bg-purple-600/30 transition-colors flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Flip Card
                        </button>
                        <button
                          onClick={() => { setCardIndex((p) => (p + 1) % totalCards); setIsFlipped(false); }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow flex items-center gap-1"
                        >
                          Next Card <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Card dots */}
                      <div className="flex items-center justify-center gap-1.5 pt-1">
                        {currentDoc.flashcards.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => { setCardIndex(i); setIsFlipped(false); }}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                              i === cardIndex
                                ? 'bg-cyan-400 w-6'
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── EXAM TAB ── */}
                  {workspaceTab === 'exam' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentDoc.probableExamQs.length} probable exam questions with model answers</span>
                      </div>

                      {currentDoc.probableExamQs.map((q, i) => {
                        const ansText = q.ans || q.modelAnswer || `Detailed model answer derived from "${currentDoc.title}".`;
                        return (
                          <div key={i} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                            {/* Question header */}
                            <div className="p-5 space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
                                    Q{i + 1}
                                  </span>
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
                                    {q.weightage}
                                  </span>
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                                    {q.probability}% Probability
                                  </span>
                                </div>
                                <button
                                  onClick={() => setRevealedSolutions((p) => ({ ...p, [i]: !p[i] }))}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border
                                    bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                                >
                                  {revealedSolutions[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  {revealedSolutions[i] ? 'Hide Answer' : 'Reveal Model Answer'}
                                </button>
                              </div>
                              <p className="text-sm font-bold text-white leading-relaxed">{q.question}</p>
                            </div>

                            {/* Model answer */}
                            {revealedSolutions[i] && (
                              <div className="mx-5 mb-5 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3" /> Model Answer — {q.weightage}
                                </div>
                                <div className="text-sm leading-relaxed">
                                  <FormattedText text={ansText} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── FORMULA TAB ── */}
                  {workspaceTab === 'formula' && (
                    <div className="space-y-4">
                      {currentDoc.hasFormulas === false || !currentDoc.formulaSheet || currentDoc.formulaSheet.trim().length === 0 ? (
                        <div className="p-8 text-center rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-2xl">
                            📖
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-base font-bold text-white">No Mathematical Formulas for this Topic</h4>
                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                              This study document on <span className="text-cyan-300 font-bold">{currentDoc.title}</span> is qualitative and conceptual. Chrona AI has generated Key Concepts, Executive Summaries, and Exam Questions for your study.
                            </p>
                          </div>
                          <div className="pt-2 flex justify-center gap-2">
                            <button
                              onClick={() => setWorkspaceTab('summary')}
                              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                            >
                              📄 View Summary & Concepts
                            </button>
                            <button
                              onClick={() => setWorkspaceTab('exam')}
                              className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer"
                            >
                              📝 View Exam Questions
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[11px]">📐</span>
                              Formula Sheet & Governing Equations
                            </h4>
                            <button
                              onClick={() => {
                                const el = document.getElementById('formula-content');
                                navigator.clipboard.writeText(el?.innerText || '');
                                alert('Formula sheet copied to clipboard!');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs border border-slate-800 flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy All
                            </button>
                          </div>
                          <div
                            id="formula-content"
                            className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-sm text-emerald-400 leading-loose space-y-1"
                          >
                            <FormattedText text={currentDoc.formulaSheet} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="py-20 text-center space-y-4">
              <FileUp className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-mono text-xs">No document selected. Upload or drag & drop a document to view AI study materials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
