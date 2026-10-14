import type { DocumentModel } from './pdf-text-model';
export async function buildDocx(model: DocumentModel): Promise<Blob> {
  const { Document, Paragraph, TextRun, Table, TableRow, TableCell, Packer, HeadingLevel } =
    await import('docx');
  const sections = model.pages.map((page) => ({
    children: page.blocks.map((block) => {
      if (block.kind === 'image') return new Paragraph('');
      if (block.kind === 'table')
        return new Table({
          rows: block.rows.map(
            (row) =>
              new TableRow({
                children: row.map((text) => new TableCell({ children: [new Paragraph(text)] })),
              }),
          ),
        });
      return new Paragraph({
        heading: block.kind === 'heading' ? HeadingLevel.HEADING_1 : undefined,
        bidirectional: block.rtl,
        children: [new TextRun({ text: block.text, rightToLeft: block.rtl })],
      });
    }),
  }));
  return Packer.toBlob(new Document({ sections }));
}
