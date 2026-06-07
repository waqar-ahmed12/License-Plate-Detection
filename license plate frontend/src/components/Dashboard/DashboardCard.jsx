import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { distance } from "fastest-levenshtein";
import {
  Image,
  CheckCircle,
  Clock,
} from "lucide-react";

function normalizePlate(plate) 
{
  return plate.replace(/[^A-Z0-9]/gi, "").toUpperCase(); // remove punctuation/spaces, uppercase
}

function groupPlates(rows) 
{
  const groups = [];

  rows.forEach((row) => {
    let plate = row.licenseNumber?.trim();
    if (!plate) return;

    const normalized = normalizePlate(plate);

    let foundGroup = null;

    for (let g of groups) {
      if (distance(g.key, normalized) <= 2) // if there are a differences of 2 characters than plate is same
      {
        foundGroup = g;
        break;
      }
    }

    if (foundGroup) 
    {
      foundGroup.count++;
      foundGroup.plates.push(plate); // keep original variations if needed
    } 
    else 
    {
      groups.push({
        key: normalized,
        representative: plate, // keep first seen version as display
        count: 1,
        plates: [plate],
      })
    }
  })

  return groups
}


function DashboardCard({ videoData }) 
{
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalPlates, setTotalPlates] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);

  const { name, status, processedUrl } = videoData;
  const nameOnly = name?.split(".")[0];

  useEffect(() => { // get the csv once
    if (!name || status !== "done") return;

    const fetchCsvData = async () => {
      setLoading(true);
      setError(null);

      try 
      {
        const response = await fetch(`http://localhost:3500/predict/${nameOnly}/csv`)

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        const rows = parsed.data.filter((row) => Object.keys(row).length > 0);

        const grouped = groupPlates(rows);
        setDetections(grouped)//  same as totalPlates now
        setTotalPlates(grouped.length)
        setDetectionCount(grouped.reduce((sum, p) => sum + p.count, 0))
      } 
      catch (err) 
      {
        console.error("Error fetching CSV:", err)
        setError("Failed to load detection data")
      } 
      finally 
      {
        setLoading(false);
      }
    };

    fetchCsvData();
  }, [name, status]);

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {videoData.status === "done" ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Detections</p>
              <p className="text-2xl font-bold text-purple-600">{detectionCount}</p>
            </div>
            <Image className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      
      {/* Video Info */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Video: {name}
          </h3>

          {/* Everything below centered */}
          <div className="text-center">
            <p
              className={`font-medium mb-3 ${
                status === "processing" ? "text-yellow-700" : "text-green-700"
              }`}
            >
              Status:
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  status === "processing"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-green-100 text-green-800 border border-green-300"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </p>
            

            {/* Detection Details */}
            {status === "done" && (
              <>
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Detected License Plates:
                </h4>

                {loading && (
                  <p className="text-gray-600 italic">Loading detections...</p>
                )}

                {error && (
                  <p className="text-red-700 bg-red-50 p-2 rounded border border-red-200 inline-block">
                    {error}
                  </p>
                )}

                {!loading && !error && detections.length === 0 && (
                  <p className="text-gray-500 italic">No license plates detected</p>
                )}

                {!loading && !error && detections.length > 0 && (
                  <>
                    <div className="mb-3 text-sm text-gray-700">
                      Unique Plates: <span className="font-bold">{totalPlates}</span> |{" "}
                      Total Detections:{" "}
                      <span className="font-bold">{detectionCount}</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-4 max-w-3xl mx-auto">
            {detections.map((plate, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded p-3 text-center text-gray-800 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center w-32"
              >
                <p className="font-mono font-bold text-lg">
                  {plate.representative.toUpperCase()}
                </p>
                <p className="text-xs text-gray-600">{plate.count} detections</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 flex justify-center">
        <video
          src={processedUrl}
          controls
          width="480"
          className="rounded-lg border border-gray-200"
        />
      </div>
    </>
  )}

  {/* Processing Spinner */}
  {status === "processing" && (
    <div className="text-center py-4">
      <p className="text-gray-600 mb-3">Video is being processed...</p>
      <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )}
</div>

    </>
  );
}

export default DashboardCard;