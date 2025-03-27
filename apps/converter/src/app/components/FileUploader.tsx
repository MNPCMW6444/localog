import { FC, useState } from 'react';
import { parseNetLog } from '../parser/netlogParser';
import { buildHAR } from '../parser/harBuilder';

const FileUploader: FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setFileName(file.name);
  
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const result = event?.target?.result;
      if (!result || typeof result !== 'string') {
        console.error('File read failed or result is not a string.');
        alert('Failed to read file.');
        return;
      }
  
      console.log('[File Text Preview]', result.slice(0, 200)); // Optional debug
  
      try {
        const cleaned = result.trim().replace(/^\uFEFF/, ''); // Remove BOM if present
        const json = JSON.parse(cleaned);
  
        const parsed = parseNetLog(json);
        const offset = json.timeTickOffset || 0;
        const har = buildHAR(parsed, offset);


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
        console.error('Failed to parse NetLog JSON file:', err);
        alert('Failed to parse NetLog JSON file.');
      }
    };
  
    reader.readAsText(file);
  };
  

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {fileName && <p>Loaded: {fileName}</p>}
    </div>
  );
};

export default FileUploader;
