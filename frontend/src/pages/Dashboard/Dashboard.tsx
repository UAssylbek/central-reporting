// src/pages/Dashboard/Dashboard.tsx
import React from 'react';
import { getUser } from '../../utils/auth';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const user = getUser();

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.login}!</h1>
      <p>Your role: {user?.role}</p>
      <div className="cards">
        <div className="card">Dashboard - Overview</div>
        <div className="card">Access reports and user management (if admin)</div>
      </div>
    </div>
  );
};

export default Dashboard;