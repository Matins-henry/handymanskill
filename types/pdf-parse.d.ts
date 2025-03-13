declare module 'pdf-parse' {
  interface PdfParseResults {
    text: string;
    info: any;
    metadata: any;
    version: string;
    numpages: number;
  }

  function pdfParse(dataBuffer: Buffer, options?: any): Promise<PdfParseResults>;
  
  export = pdfParse;
}