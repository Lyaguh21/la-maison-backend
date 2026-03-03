export function fileToBase64(file: Express.Multer.File): string {
  if (!file) {
    throw new Error('File not provided');
  }

  const base64 = file.buffer.toString('base64');

  return `data:${file.mimetype};base64,${base64}`;
}
