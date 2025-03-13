// Since we're having issues with pdf-parse and mammoth, let's use mock parsers
// This is a temporary solution to get the application running

export async function mockParsePdf(buffer: Buffer): Promise<{ text: string }> {
  // In a real app, this would parse the PDF
  return {
    text: "Mock resume with skills including carpentry, plumbing, electrical, painting, drywall, and 5 years of experience in home renovation."
  };
}

export async function mockParseDocx(buffer: Buffer): Promise<{ value: string }> {
  // In a real app, this would parse the DOCX
  return {
    value: "Mock resume with skills including woodworking, tiling, roofing, masonry, and 7 years of experience in construction."
  };
}