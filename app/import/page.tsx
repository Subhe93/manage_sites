'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/header').then(m => ({ default: m.Header })), { ssr: false });
const CSVImporter = dynamic(() => import('@/components/import/csv-importer').then(m => ({ default: m.CSVImporter })), { ssr: false });

export default function ImportPage() {
  return (
    <div className="min-h-screen">
      <Header title="Import Data" description="Import websites and data from CSV files" />
      <div className="p-6">
        <CSVImporter />
      </div>
    </div>
  );
}
