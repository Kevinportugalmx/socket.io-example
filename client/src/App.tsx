import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Controls from './components/Controls'
import Chat from './components/Chat'

const App: React.FC = () => {
  return (
    <div>
      <Controls />
      <Routes>
        <Route path="/" element={<Chat />} />
      </Routes>
    </div>
  )
}

export default App
