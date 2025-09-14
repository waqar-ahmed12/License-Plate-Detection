function Navigation({tabs, activeTab, setActiveTab})
{
   const TabsPlacement = tabs.map(({id, label, icon: Icon}) => (
   <button 
         key={id} 
         onClick={() => setActiveTab(id)}
         className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
      >
         <Icon className='w-4 h-4' />
         <span>{label}</span>
      </button>
   ))
   return (
      <div className='bg-white shadow-sm'>
         <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-center space-x-8'>
               {TabsPlacement}
            </div>
         </div>
      </div>
   )
}

export default Navigation