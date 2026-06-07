import { useState, useRef } from "react";

export default function VideoUploader() {
  const [videoUrl, setVideoUrl] = useState(null);  // preview processed video
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click()
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3500/predict", {
        method: "POST",
        body: formData,
      });

      

      if (!response.ok) {
  const errText = await response.text();  // or .json() if server always sends JSON
  throw new Error(`Upload failed: ${errText}`);
}


      // backend sends file → convert to blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
  console.error("Pipeline error:", err);   // full stack trace
  res.status(500).json({ 
    error: "Pipeline failed", 
    details: err.message,
    stack: err.stack,  // add stack trace for debugging
  });
}

    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <button
        onClick={handleButtonClick}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload Video"}
      </button>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {videoUrl && (
        <div className="w-full max-w-lg mt-6">
          <video src={videoUrl} controls className="rounded-lg shadow-md w-full" />
        </div>
      )}
    </div>
  );
}
