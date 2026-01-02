interface RetrievalResponse {
  success: boolean;
  answer: string;
  sources: Source[];
}

interface Source {
  source: string;
  pdf: Pdf;
  loc: Loc;
}

interface Pdf {
  version: string;
  info: Info;
  metadata: Metadata;
  totalPages: number;
}

interface Info {
  PDFFormatVersion: string;
  IsAcroFormPresent: boolean;
  IsXFAPresent: boolean;
  Author: string;
  Creator: string;
  Producer: string;
  CreationDate: string;
  ModDate: string;
}

interface Metadata {
  _metadata: Metadata2;
}

interface Metadata2 {
  "xmp:modifydate": string;
  "xmp:createdate": string;
  "xmp:metadatadate": string;
  "xmp:creatortool": string;
  "xmpmm:documentid": string;
  "xmpmm:instanceid": string;
  "xmpmm:subject": string;
  "dc:format": string;
  "dc:creator": string;
  "pdf:producer": string;
  "pdfx:sourcemodified": string;
  "pdfx:company": string;
}

interface Loc {
  pageNumber: number;
  lines: Lines;
}

interface Lines {
  from: number;
  to: number;
}
