import { FC, useState } from 'react';
import { parseNetLog } from '../parser/netlogParser';
import { buildHAR } from '../parser/harBuilder';

const FileUploader: FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const text = await file.text();

    try {
      const netlog = JSON.parse(text);
      const parsed = parseNetLog(netlog);
      const har = buildHAR(parsed);

      const blob = new Blob([JSON.stringify(har, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.har';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to parse NetLog JSON file.');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {fileName && <p>Loaded: {fileName}</p>}
    </div>
  );
};

export default FileUploader;
