import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

const PdfExportButton = ({ document, fileName = 'export.pdf', label = 'Export To PDF' }) => {
  return (
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading, error }) => (
        <button
          type="button"
          disabled={loading || !!error}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Preparing PDF...' : label}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default PdfExportButton;
