import React, { useState, useRef } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import VideoUploadTab from "./components/Upload/VideoUploadTab";
import DashboardTab from "./components/Dashboard/DashboardTab";
// import ResultsTab from "./components/Results/ResultsTab";
import { FileVideo, Upload, Image } from "lucide-react";
import { useStatus } from "./context/statusContext";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { setStatus } = useStatus();

  const [videoData, setVideoData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  const tabs = [
    { id: "upload", label: "Upload Video", icon: Upload },
    { id: "dashboard", label: "Dashboard", icon: FileVideo },
  ];

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragleave" || e.type === "dragover") {
      setDragActive(e.type !== "dragleave");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }

  function handleClear() {
    setVideoData([]);
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setStatus("Idle");
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("video/")) return;

    setUploadedFile(file);
    setStatus("Processing...");
    setUploadProgress(0);
    setIsUploading(true);

    // Add video entry with "processing"
    const newVideo = {
      id: videoData.length + 1,
      name: file.name,
      status: "processing",
      processedAt: null,
      detections: 0,
      processedUrl: null,
    };
    setVideoData((prev) => [...prev, newVideo]);

    try {
      const formData = new FormData();
      formData.append("video", file);

      // Upload + get processed video
      const response = await fetch("http://localhost:3500/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Update latest video to "done"
      setVideoData((prev) =>
        prev.map((v) =>
          v.id === newVideo.id
            ? { ...v, status: "done", processedAt: new Date().toISOString(), processedUrl: url }
            : v
        )
      );

      setUploadProgress(100);
      setStatus("Upload Complete");
      // setActiveTab("dashboard"); // go to dashboard after upload
    } catch (err) {
      console.error("Error uploading video:", err);
      setStatus("Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };
          console.log(videoData)


  return (
    <div>
      <Header />
      <Navigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="p-6">
        {activeTab === "upload" && (
          <VideoUploadTab
            handleDrop={handleDrop}
            handleDrag={handleDrag}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            fileInputRef={fileInputRef}
            dragActive={dragActive}
            uploadedFile={uploadedFile}
            handleFileSelect={handleFileSelect}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardTab videoData={videoData} />
        )
        }
        {videoData.length > 0 && (
  <div className="flex justify-center mt-6">
    <button
      onClick={handleClear}
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all"
    >
      Clear All
    </button>
  </div>
)}


        {activeTab === "results" && (
          <ResultsTab results={[]} />
        )}
      </main>
    </div>
  );
}

export default App;
