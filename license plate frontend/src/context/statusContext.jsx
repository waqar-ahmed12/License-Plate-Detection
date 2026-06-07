// StatusContext.jsx 
// this is for the status information to hop between the files 
import React, { createContext, useState, useContext } from 'react'

const StatusContext = createContext()

export function StatusProvider({ children }) 
{
  const [status, setStatus] = useState('System Ready')

  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() 
{
  return useContext(StatusContext)
}
