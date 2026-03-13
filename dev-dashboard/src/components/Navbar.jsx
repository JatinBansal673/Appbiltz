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
      <nav className="bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 flex items-center p-3">
        <ul className='flex gap-7 mx-[40vw]'>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/tasks">Tasks</NavLink></li>
          <li><NavLink to="/activity">Activity</NavLink></li>
        </ul>
        <div className="flex items-center gap-2 py-2 ml-[-8vw]">
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



