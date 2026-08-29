import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkOrderRecord, MatrixRow, KPISummary } from '../types';

interface ExportPdfOptions {
  monthLabel: string;
  daysCount: number;
  statusMatrix: MatrixRow[];
  unitMatrix: MatrixRow[];
  kpi: KPISummary;
  filteredRecords: WorkOrderRecord[];
  unitFilter: string;
  penyulangFilter: string;
}

export function exportMatrixPDF({
  monthLabel,
  daysCount,
  statusMatrix,
  unitMatrix,
  kpi,
  unitFilter,
  penyulangFilter,
}: ExportPdfOptions): void {
  // A4 Landscape for the full 1-31 Matrix
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900 / navy
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Decorative Accent line
  doc.setFillColor(2, 132, 199); // PLN sky blue
  doc.rect(0, 22, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PT PLN (PERSERO) UID SULSELRABAR - UP3 BULUKUMBA', 14, 9);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`LAPORAN MONITORING HARIAN WORK ORDER T&D - BULAN ${monthLabel.toUpperCase()}`, 14, 16);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8);
  doc.text(`Dicetak: ${printDate}`, pageWidth - 14, 16, { align: 'right' });

  // 2. Filter & Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 27, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('INFORMASI FILTER & REKAPITULASI:', 18, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Periode: ${monthLabel}`, 18, 39);
  doc.text(`• Unit / ULP: ${unitFilter === 'ALL' ? 'Semua ULP' : unitFilter}`, 75, 39);
  doc.text(`• Penyulang: ${penyulangFilter === 'ALL' ? 'Semua Penyulang' : penyulangFilter}`, 140, 39);
  doc.text(`• Target Status: COMP, WFOLLOWUP, WFCOMP`, 215, 39);

  // 3. KPI Badges Bar
  const kpiY = 46;
  const kpiBoxWidth = (pageWidth - 28 - 12) / 4;
  const kpiBoxes = [
    { label: 'TOTAL WORK ORDER', value: `${kpi.totalRecords.toLocaleString()} WO`, color: [30, 41, 59], bg: [241, 245, 249] },
    { label: 'COMPLETED (COMP)', value: `${kpi.compCount.toLocaleString()} WO (${kpi.compPercentage.toFixed(1)}%)`, color: [16, 149, 193], bg: [236, 253, 245] },
    { label: 'WFOLLOWUP', value: `${kpi.wfollowupCount.toLocaleString()} WO (${kpi.wfollowupPercentage.toFixed(1)}%)`, color: [217, 119, 6], bg: [254, 243, 199] },
    { label: 'WFCOMP', value: `${kpi.wfcompCount.toLocaleString()} WO (${kpi.wfcompPercentage.toFixed(1)}%)`, color: [2, 132, 199], bg: [240, 249, 255] },
  ];

  kpiBoxes.forEach((item, idx) => {
    const x = 14 + idx * (kpiBoxWidth + 4);
    doc.setFillColor(item.bg[0], item.bg[1], item.bg[2]);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, kpiY, kpiBoxWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.label, x + 3, kpiY + 4.5);

    doc.setFontSize(9);
    doc.text(item.value, x + 3, kpiY + 9.5);
  });

  // 4. Matrix Table 1 to 31
  const matrixHeaders: string[] = ['Status / Kategori'];
  for (let d = 1; d <= daysCount; d++) {
    matrixHeaders.push(String(d));
  }
  matrixHeaders.push('Total', 'Rata-Rata');

  const matrixBody = statusMatrix.map((row) => {
    const r: string[] = [row.title];
    for (let d = 1; d <= daysCount; d++) {
      const val = row.days[d] || 0;
      r.push(val > 0 ? String(val) : '-');
    }
    r.push(String(row.total), row.avgDaily.toFixed(1));
    return r;
  });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('I. TABEL MATRIKS HARIAN STATUS WORK ORDER (TANGGAL 1 S/D 31)', 14, 63);

  autoTable(doc, {
    startY: 66,
    head: [matrixHeaders],
    body: matrixBody,
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.2,
      halign: 'center',
      valign: 'middle',
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', minCellWidth: 32 },
      [matrixHeaders.length - 2]: { fontStyle: 'bold', fillColor: [241, 245, 249] },
      [matrixHeaders.length - 1]: { fontStyle: 'bold', fillColor: [248, 250, 252] },
    },
    didParseCell: (data) => {
      // Highlight Total Row
      if (data.row.index === matrixBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [224, 231, 255];
        data.cell.styles.textColor = [30, 27, 75];
      }
      // Give soft colors for status rows in first column
      if (data.section === 'body' && data.column.index === 0) {
        const text = String(data.cell.raw);
        if (text.includes('COMP') && !text.includes('WFCOMP')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (text.includes('WFOLLOWUP')) {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (text.includes('WFCOMP')) {
          data.cell.styles.textColor = [2, 132, 199];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Unit Matrix Table
  const lastY = (doc as any).lastAutoTable?.finalY || 110;
  
  if (lastY + 35 < pageHeight) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('II. DISTRIBUSI WORK ORDER PER UNIT LAYANAN PELANGGAN (ULP)', 14, lastY + 8);

    const unitHeaders = ['Unit / ULP'];
    for (let d = 1; d <= daysCount; d++) {
      unitHeaders.push(String(d));
    }
    unitHeaders.push('Total', 'Rata-Rata');

    const unitBody = unitMatrix.map((row) => {
      const r: string[] = [row.title];
      for (let d = 1; d <= daysCount; d++) {
        const val = row.days[d] || 0;
        r.push(val > 0 ? String(val) : '-');
      }
      r.push(String(row.total), row.avgDaily.toFixed(1));
      return r;
    });

    autoTable(doc, {
      startY: lastY + 11,
      head: [unitHeaders],
      body: unitBody,
      theme: 'grid',
      styles: {
        fontSize: 6.5,
        cellPadding: 1.2,
        halign: 'center',
        valign: 'middle',
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 6.5,
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', minCellWidth: 32 },
        [unitHeaders.length - 2]: { fontStyle: 'bold', fillColor: [241, 245, 249] },
        [unitHeaders.length - 1]: { fontStyle: 'bold', fillColor: [248, 250, 252] },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // 6. Signatures & Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  const signatureY = Math.min(pageHeight - 24, Math.max(finalY + 10, pageHeight - 32));

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Mengetahui,', 40, signatureY, { align: 'center' });
  doc.text('Manager Bagian Jaringan & Distribusi', 40, signatureY + 4, { align: 'center' });
  doc.text('( ................................................ )', 40, signatureY + 18, { align: 'center' });

  doc.text(`Bulukumba, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 50, signatureY, { align: 'center' });
  doc.text('Team Leader Pemeliharaan Distribusi', pageWidth - 50, signatureY + 4, { align: 'center' });
  doc.text('( ................................................ )', pageWidth - 50, signatureY + 18, { align: 'center' });

  // Page numbering
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini digenerate secara otomatis oleh Dashboard Monitoring WO T&D PLN UP3 Bulukumba', 14, pageHeight - 4);
  doc.text(`Halaman 1 dari 1`, pageWidth - 14, pageHeight - 4, { align: 'right' });

  // Save PDF
  const filename = `Laporan_Monitoring_WO_TD_${monthLabel.replace(/\s+/g, '_')}_UP3_Bulukumba.pdf`;
  doc.save(filename);
}

export function exportDetailedRecordsPDF(
  records: WorkOrderRecord[],
  monthLabel: string,
  unitFilter: string
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 20, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PT PLN (PERSERO) UID SULSELRABAR - UP3 BULUKUMBA', 14, 8.5);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`REKAPITULASI DETAIL WORK ORDER T&D - PERIODE: ${monthLabel.toUpperCase()}`, 14, 15);

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Total: ${records.length} WO | Cetak: ${printDate}`, pageWidth - 14, 15, { align: 'right' });

  const tableHeaders = [
    'No',
    'No WO',
    'Status',
    'Tgl Status',
    'Unit / ULP',
    'Penyulang',
    'Tipe',
    'Peralatan / Asset',
    'Deskripsi Pekerjaan',
  ];

  const tableData = records.map((r, idx) => [
    String(idx + 1),
    r.workOrder,
    r.status,
    r.statusDate,
    r.unitDescription || r.unit,
    r.descriptionPenyulang || '-',
    r.workType,
    r.asset || '-',
    r.description || '-',
  ]);

  autoTable(doc, {
    startY: 25,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 20 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 18 },
      4: { cellWidth: 32 },
      5: { cellWidth: 35 },
      6: { halign: 'center', cellWidth: 12 },
      7: { cellWidth: 30 },
      8: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const st = String(data.cell.raw);
        if (st === 'COMP') data.cell.styles.textColor = [5, 150, 105];
        else if (st === 'WFOLLOWUP') data.cell.styles.textColor = [217, 119, 6];
        else if (st === 'WFCOMP') data.cell.styles.textColor = [2, 132, 199];
      }
    },
    margin: { left: 14, right: 14, bottom: 12 },
  });

  const filename = `Rekap_Detail_WO_TD_${monthLabel.replace(/\s+/g, '_')}_${records.length}WO.pdf`;
  doc.save(filename);
}
