import { useState } from 'react'
import Navbar from './components/Navbar'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white max-w-full">
      <Navbar />
    </div>
  );
}

export default App;
