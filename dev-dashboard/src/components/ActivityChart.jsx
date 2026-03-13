import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ActivityChart = () => {
  const data = [
    { name: 'Mon', hours: 4, tasks: 2, projects: 0 },
    { name: 'Tue', hours: 6, tasks: 3, projects: 1 },
    { name: 'Wed', hours: 5, tasks: 1, projects: 0 },
    { name: 'Thu', hours: 7, tasks: 4, projects: 0 },
    { name: 'Fri', hours: 3, tasks: 2, projects: 1 },
  ];

  return (
    <div className='flex flex-col items-center mt-[5vh] gap-8'>
      <h2 className='text-2xl font-bold'>Coding Activity</h2>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill="#8884d8" name="Hours Coded" />
        <Bar dataKey="tasks" fill="#82ca9d" name="Tasks Completed" />
        <Bar dataKey="projects" fill="#ffc658" name="Projects Completed" />
      </BarChart>
    </div>
  );
};

export default ActivityChart;