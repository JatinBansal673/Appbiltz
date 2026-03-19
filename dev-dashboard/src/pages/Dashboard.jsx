import React from 'react';
import GithubProfile from '../components/GithubProfile';
import ActivityChart from '../components/ActivityChart';
import TaskBoard from '../components/TaskBoard';

const Dashboard = () => {
  return (
    <div className='flex flex-col items-center gap-8 mt-[5vh]'>
      <h1 className='text-4xl font-bold text-center'>Welcome to DEV-Dashboard</h1>
      <GithubProfile />
    </div>
  );
};

export default Dashboard;