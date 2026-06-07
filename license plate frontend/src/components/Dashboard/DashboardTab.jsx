import DashboardCard from "./DashboardCard";

function DashboardTab({ videoData }) {
  if (!videoData || videoData.length === 0) {
    return <p className="text-gray-600">No videos uploaded yet.</p>;
  }
  // <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  return (
    <div>
      {videoData.map((video) => (
        <DashboardCard key={video.id} videoData={video} />
      ))}
    </div>
  );
}

export default DashboardTab;