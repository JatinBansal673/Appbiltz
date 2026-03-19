import React from 'react'
import {Route, Routes, NavLink} from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Projects from '../pages/Projects'
import { useTheme } from '../context/ThemeContext'
import TaskBoard from './TaskBoard'
import ActivityChart from './ActivityChart'
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react'

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const themeData = useTheme();
  console.log(themeData);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className=''>
      <nav className="bg-[#ffffff] dark:bg-[#1f2937] border-b-2 border-[#e5e7eb] dark:border-[#374151] sticky top-0 z-50">
        <div className='flex items-center justify-between px-4 py-3'>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Portfolio
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Developer Dashboard
              </p>
            </div>
          </div>
          <ul className='hidden md:flex items-center gap-7'>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/projects">Projects</NavLink></li>
            <li><NavLink to="/tasks">Tasks</NavLink></li>
            <li><NavLink to="/activity">Activity</NavLink></li>
          </ul>
          <div className="hidden md:flex items-center gap-2 mr-5">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3f4f6] dark:bg-[#374151] text-[#374151] dark:text-[#d1d5db] hover:bg-[#e5e7eb] dark:hover:bg-[#4b5563] transition-colors text-sm"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-[#374151] dark:text-[#d1d5db] hover:bg-[#f3f4f6] dark:hover:bg-[#374151] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t flex flex-col border-[#e5e7eb] dark:border-[#374151] bg-[#ffffff] dark:bg-[#1f2937] px-4 py-3 space-y-1">
            <NavLink to="/" onClick={closeMobile}>Home</NavLink>
            <NavLink to="/projects" onClick={closeMobile}>Projects</NavLink>
            <NavLink to="/tasks" onClick={closeMobile}>Tasks</NavLink>
            <NavLink to="/activity"onClick={closeMobile}>Activity</NavLink>
            <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151] mt-2">
              <button
                onClick={() => { toggleTheme(); closeMobile(); }}
                className="flex items-center gap-2 w-full rounded-md text-sm font-medium text-[#374151] dark:text-[#d1d5db] hover:bg-[#f3f4f6] dark:hover:bg-[#374151] transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        )}
      </nav>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/projects' element={<Projects/>}/>
        <Route path='/tasks' element={<TaskBoard/>}/>
        <Route path='/activity' element={<ActivityChart/>}/>
      </Routes>
    </div>
  )
}


export default Navbar



