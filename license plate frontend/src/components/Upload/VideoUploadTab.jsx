import { useState, useEffect } from 'react';
import { FileVideo, Upload, CheckCircle } from 'lucide-react'

function VideoUploadTab(
{
  handleDrop,
  handleDrag,
  isUploading,
  uploadProgress,
  fileInputRef,
  dragActive,
  uploadedFile,
  handleFileSelect,
})
{

  const [previewURL, setPreviewURL] = useState(null);

  // Whenever uploadedFile changes, update the preview URL
  useEffect(() => {
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    setPreviewURL(url);

    // Cleanup the URL when component unmounts or file changes
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Video for Processing</h2>
        <p className="text-gray-600">Upload your video to detect cars and extract license plates</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : isUploading
              ? 'border-green-500 bg-green-50'
              : uploadedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          // uploading state
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-green-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <p className="text-green-600 font-medium">Processing...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {/* <p className="text-sm text-gray-500">{uploadProgress}% complete</p> */}
            </div>
          </div>
        ) : uploadedFile ? (
          // preview state
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{uploadedFile.name}</h3>
            {uploadedFile && (
              
              <video
                controls
                className="mx-auto rounded-lg shadow-md max-h-64"
                src={previewURL}
              />
            )}
            <p className="text-green-600 font-medium mt-4">
             Head over to the Dashboard to view results.
            </p>
          </div>
        ) : (
          // idle state
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <FileVideo className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your video file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Enter your mp4 file here.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Choose File
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(Array.from(e.target.files))}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default VideoUploadTab;
