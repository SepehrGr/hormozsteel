import React from 'react';
import { Button } from '@heroui/button';
import { Upload, Download, Plus, Package } from 'lucide-react';

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImportClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onAdd: () => void;
}

export default function HeaderActions({
  fileInputRef,
  onImportClick,
  onFileChange,
  onExport,
  onAdd,
}: Props) {
  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
        className="hidden"
      />
      <Button
        startContent={<Upload className="w-4 h-4" />}
        variant="bordered"
        onClick={onImportClick}
      >
        وارد کردن Excel
      </Button>
      <Button
        startContent={<Download className="w-4 h-4" />}
        variant="bordered"
        onClick={onExport}
      >
        خروجی Excel
      </Button>
      <Button
        startContent={<Plus className="w-4 h-4" />}
        color="primary"
        onPress={onAdd}
        className="font-semibold"
      >
        افزودن محصول جدید
      </Button>
    </div>
  );
}
