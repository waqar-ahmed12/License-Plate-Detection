// import React, { useState, useRef, useEffect } from 'react';
// import { Upload, Play, Pause, Download, FileVideo, Image, Search, Filter, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// // Mock data for demonstration
// const mockProcessedVideos = [
//   {
//     id: 1,
//     name: 'traffic_video_1.mp4',
//     originalPath: '/api/video/input/traffic_video_1.mp4',
//     processedPath: '/api/video/output/traffic_video_1_processed.mp4',
//     csvPath: '/api/csv/traffic_video_1_detections.csv',
//     detections: 15,
//     status: 'completed',
//     processedAt: '2024-08-17T10:30:00Z',
//     duration: 45
//   },
//   {
//     id: 2,
//     name: 'parking_lot.mp4',
//     originalPath: '/api/video/input/parking_lot.mp4',
//     processedPath: '/api/video/output/parking_lot_processed.mp4',
//     csvPath: '/api/csv/parking_lot_detections.csv',
//     detections: 8,
//     status: 'completed',
//     processedAt: '2024-08-17T09:15:00Z',
//     duration: 30
//   },
//   {
//     id: 3,
//     name: 'highway_scene.mp4',
//     originalPath: '/api/video/input/highway_scene.mp4',
//     processedPath: null,
//     csvPath: null,
//     detections: 0,
//     status: 'processing',
//     processedAt: null,
//     duration: 60
//   }
// ];

// const mockDetections = [
//   { id: 1, timestamp: '00:05:12', plateText: 'ABC-1234', confidence: 0.92, x: 450, y: 200, w: 120, h: 40 },
//   { id: 2, timestamp: '00:07:33', plateText: 'XYZ-5678', confidence: 0.88, x: 320, y: 180, w: 115, h: 38 },
//   { id: 3, timestamp: '00:12:45', plateText: 'DEF-9012', confidence: 0.95, x: 580, y: 220, w: 125, h: 42 },
//   { id: 4, timestamp: '00:15:21', plateText: 'GHI-3456', confidence: 0.91, x: 390, y: 195, w: 118, h: 39 }
// ];

// function App() {
//   const [activeTab, setActiveTab] = useState('upload');
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef(null);

//   // Filter videos based on search and status
//   const filteredVideos = mockProcessedVideos.filter(video => {
//     const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || video.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   // Handle file upload
//   // const handleFileUpload = (files) => {
//   //   if (files.length > 0) {
//   //     const file = files[0];
//   //     if (file.type.startsWith('video/')) {
//   //       setIsUploading(true);
//   //       setUploadProgress(0);
        
//   //       // Simulate upload progress
//   //       const interval = setInterval(() => {
//   //         setUploadProgress(prev => {
//   //           if (prev >= 100) {
//   //             clearInterval(interval);
//   //             setIsUploading(false);
//   //             setActiveTab('dashboard');
//   //             return 100;
//   //           }
//   //           return prev + 10;
//   //         });
//   //       }, 200);
//   //     }
//   //   }
//   // };
// const handleFileUpload = (files) => {
//   if (files.length > 0) {
//     const file = files[0];
//     if (file.type.startsWith('video/')) {
//       setIsUploading(true);
//       setUploadProgress(0);

//       let progress = 0;
//       const interval = setInterval(() => {
//         progress += 5;
//         if (progress >= 95) {
//           clearInterval(interval); // wait for backend now
//         }
//         setUploadProgress(progress);
//       }, 200);

//       // Simulate backend processing finish
//       fakeBackendCall(file).then(() => {
//         clearInterval(interval);
//         setUploadProgress(100);
//         setIsUploading(false);
//         setActiveTab('dashboard');
//       });
//     }
//   }
// };


//   // Drag and drop handlers
//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     const files = Array.from(e.dataTransfer.files);
//     handleFileUpload(files);
//   };

//   const StatusIcon = ({ status }) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'processing':
//         return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
//       case 'error':
//         return <AlertCircle className="w-5 h-5 text-red-500" />;
//       default:
//         return <Clock className="w-5 h-5 text-gray-400" />;
//     }
//   };

//   const VideoUploadTab = () => (
//     <div className="max-w-4xl mx-auto p-8">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Video for Processing</h2>
//         <p className="text-gray-600">Upload your video to detect cars and extract license plates</p>
//       </div>
      
//       <div
//         className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
//           dragActive 
//             ? 'border-blue-500 bg-blue-50' 
//             : isUploading 
//               ? 'border-green-500 bg-green-50'
//               : 'border-gray-300 hover:border-gray-400'
//         }`}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         {isUploading ? (
//           <div className="space-y-4">
//             <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
//               <Upload className="w-8 h-8 text-green-600 animate-bounce" />
//             </div>
//             <div className="space-y-2">
//               <p className="text-green-600 font-medium">Processing...</p>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-green-500 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${uploadProgress}%` }}
//                 ></div>
//               </div>
//               <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
//               <FileVideo className="w-8 h-8 text-gray-600" />
//             </div>
//             <div>
//               <p className="text-lg font-medium text-gray-700 mb-2">
//                 Drop your video file here, or click to browse
//               </p>
//               <p className="text-sm text-gray-500 mb-4">
//                 Supports MP4, AVI, MOV files up to 500MB
//               </p>
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
//               >
//                 Choose File
//               </button>
//             </div>
//           </div>
//         )}
        
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="video/*"
//           onChange={(e) => handleFileUpload(Array.from(e.target.files))}
//           className="hidden"
//         />
//       </div>
//     </div>
//   );

//   const DashboardTab = () => (
//     <div className="space-y-6">
//       {/* Header with search and filter */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <h2 className="text-2xl font-bold text-gray-900">Video Dashboard</h2>
//         <div className="flex gap-3 w-full sm:w-auto">
//           <div className="relative flex-1 sm:w-64">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search videos..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="all">All Status</option>
//             <option value="completed">Completed</option>
//             <option value="processing">Processing</option>
//             <option value="error">Error</option>
//           </select>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Videos</p>
//               <p className="text-2xl font-bold text-gray-900">{mockProcessedVideos.length}</p>
//             </div>
//             <FileVideo className="w-8 h-8 text-blue-500" />
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-sm border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Completed</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {mockProcessedVideos.filter(v => v.status === 'completed').length}
//               </p>
//             </div>
//             <CheckCircle className="w-8 h-8 text-green-500" />
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-sm border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Processing</p>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {mockProcessedVideos.filter(v => v.status === 'processing').length}
//               </p>
//             </div>
//             <Clock className="w-8 h-8 text-yellow-500" />
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-sm border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Detections</p>
//               <p className="text-2xl font-bold text-purple-600">
//                 {mockProcessedVideos.reduce((sum, v) => sum + v.detections, 0)}
//               </p>
//             </div>
//             <Image className="w-8 h-8 text-purple-500" />
//           </div>
//         </div>
//       </div>

//       {/* Video List */}
//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Video
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Detections
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Duration
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Processed
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredVideos.map((video) => (
//                 <tr key={video.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <FileVideo className="w-8 h-8 text-gray-400 mr-3" />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{video.name}</div>
//                         <div className="text-sm text-gray-500">Video file</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <StatusIcon status={video.status} />
//                       <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         video.status === 'completed' 
//                           ? 'bg-green-100 text-green-800'
//                           : video.status === 'processing'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {video.status}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {video.detections}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {video.duration}s
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {video.processedAt ? new Date(video.processedAt).toLocaleDateString() : '-'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                     <button
//                       onClick={() => setSelectedVideo(video)}
//                       className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
//                     >
//                       View
//                     </button>
//                     {video.status === 'completed' && (
//                       <>
//                         <button className="text-green-600 hover:text-green-900 transition-colors duration-200">
//                           <Download className="w-4 h-4" />
//                         </button>
//                         <button className="text-purple-600 hover:text-purple-900 transition-colors duration-200">
//                           Results
//                         </button>
//                       </>
//                     )}
//                     {video.status === 'error' && (
//                       <button className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200">
//                         <RotateCcw className="w-4 h-4" />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );

//   const ResultsTab = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-gray-900">Detection Results</h2>
//         {selectedVideo && (
//           <div className="flex items-center space-x-3">
//             <span className="text-sm text-gray-500">Viewing:</span>
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//               {selectedVideo.name}
//             </span>
//           </div>
//         )}
//       </div>

//       {selectedVideo && selectedVideo.status === 'completed' ? (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Video Comparison */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Comparison</h3>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm font-medium text-gray-700 mb-2">Original Video</p>
//                 <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
//                   <Play className="w-12 h-12 text-white opacity-50" />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700 mb-2">Processed Video</p>
//                 <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
//                   <Play className="w-12 h-12 text-white opacity-50" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Detection Statistics */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Statistics</h3>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                 <span className="text-sm font-medium text-gray-600">Total Detections</span>
//                 <span className="text-lg font-bold text-purple-600">{selectedVideo.detections}</span>
//               </div>
//               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                 <span className="text-sm font-medium text-gray-600">Average Confidence</span>
//                 <span className="text-lg font-bold text-green-600">91.5%</span>
//               </div>
//               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                 <span className="text-sm font-medium text-gray-600">Processing Time</span>
//                 <span className="text-lg font-bold text-blue-600">2.3s</span>
//               </div>
//             </div>
//           </div>
// {/* Detections Table */}
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
//             <div className="p-6 border-b">
//               <h3 className="text-lg font-semibold text-gray-900">License Plate Detections</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Timestamp
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Plate Text
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Confidence
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Position
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {mockDetections.map((detection) => (
//                     <tr key={detection.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {detection.timestamp}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-mono">
//                           {detection.plateText}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             detection.confidence >= 0.9 
//                               ? 'bg-green-100 text-green-800'
//                               : detection.confidence >= 0.8 
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {Math.round(detection.confidence * 100)}%
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
//                         {detection.x},{detection.y}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
//                           View Frame
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
//           <FileVideo className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
//           <p className="text-gray-500">
//             {selectedVideo 
//               ? `Video "${selectedVideo.name}" is still processing. Results will appear here once complete.`
//               : 'Select a completed video from the dashboard to view detection results.'
//             }
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <FileVideo className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Car Detection Dashboard</h1>
//                 <p className="text-sm text-gray-500">YOLO + License Plate Recognition</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-500">
//                 Status: <span className="text-green-600 font-medium">System Ready</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation */}
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex space-x-8">
//             {[
//               { id: 'upload', label: 'Upload Video', icon: Upload },
//               { id: 'dashboard', label: 'Dashboard', icon: FileVideo },
//               { id: 'results', label: 'Results', icon: Image }
//             ].map(({ id, label, icon: Icon }) => (
//               <button
//                 key={id}
//                 onClick={() => setActiveTab(id)}
//                 className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
//                   activeTab === id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 <span>{label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === 'upload' && <VideoUploadTab />}
//         {activeTab === 'dashboard' && <DashboardTab />}
//         {activeTab === 'results' && <ResultsTab />}
//       </main>
//     </div>
//   );
// }

// export default App;