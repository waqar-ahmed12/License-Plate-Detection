import React from 'react';
import { FileVideo } from 'lucide-react';
import { useStatus } from '../context/statusContext';

function Header() {
  const { status } = useStatus()   

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          {/* Left Section */}
          <div className='flex items-center space-x-3'>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileVideo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Car Detection Dashboard</h1>
              <p className="text-sm text-gray-500">YOLO + License Plate Recognition</p>
            </div>
          </div>

          {/* Right Section (Status) */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Status:{' '}
              <span
                className={`font-medium ${
                  status === 'System Ready'
                    ? 'text-green-600'
                    : status === 'Error'
                    ? 'text-red-600'
                    : status === 'Upload Complete'
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>            
    </header>
  );
}

export default Header;
