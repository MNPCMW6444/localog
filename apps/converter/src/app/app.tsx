import FileUploader from './components/FileUploader';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>NetLog to HAR Converter</h1>
      <p>Upload a Chrome NetLog JSON file and download a HAR file.</p>
      <FileUploader />
    </div>
  );
}

export default App;
