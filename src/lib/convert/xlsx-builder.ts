import type { DocumentModel } from './pdf-text-model';
export async function buildXlsx(model: DocumentModel): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs');
  const book = new ExcelJS.Workbook();
  let count = 0;
  model.pages.forEach((page, index) => {
    const sheet = book.addWorksheet(`Page ${index + 1}`);
    for (const line of page.lines || []) {
      count += line.cells.length;
      if (count > 200000) throw new Error('tooManyCells');
      sheet.addRow(line.cells); // Literal strings, never evaluated formulas.
    }
    sheet.columns.forEach((column) => {
      column.width = 28;
    });
  });
  return new Blob([(await book.xlsx.writeBuffer()) as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
