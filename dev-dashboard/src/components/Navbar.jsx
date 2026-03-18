import React from 'react'
import {Route, Routes, NavLink} from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Projects from '../pages/Projects'
import { useTheme } from '../context/ThemeContext'
import TaskBoard from './TaskBoard'
import ActivityChart from './ActivityChart'

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const themeData = useTheme();
  console.log(themeData);
  return (
    <div className=''>
      <nav className="bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 flex items-center justify-between p-3">
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
        <ul className='flex gap-7'>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/tasks">Tasks</NavLink></li>
          <li><NavLink to="/activity">Activity</NavLink></li>
        </ul>
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={toggleTheme}
            className="relative flex items-center h-6 w-12 bg-gray-300 rounded-full p-1 transition-colors duration-300"
          >
            <div
              className={`bg-black rounded-full h-4 w-4 transform transition-transform duration-300 ease-in-out ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
          Theme
        </div>
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



