
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useParams } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import ProjectsPage from './views/ProjectsPage';
import ProjectDetailPage from './views/ProjectDetailPage';
import DailyLogsPage from './views/DailyLogsPage';
import ChecklistsPage from './views/ChecklistsPage';
import SettingsPage from './views/SettingsPage';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { to: '/projects', icon: 'fa-building', label: 'Dự án (Projects)' },
    { to: '/daily-logs', icon: 'fa-calendar-check', label: 'Nhật ký (Logs)' },
    { to: '/checklists', icon: 'fa-tasks', label: 'Kiểm tra (Checklists)' },
    { to: '/settings', icon: 'fa-cog', label: 'Cấu hình (Settings)' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col p-4 z-50">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
          <i className="fas fa-bolt text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Phoenix MEP</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Quản lý Thi công</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-800 rounded-xl">
        <p className="text-xs text-slate-400 mb-2">Trợ lý Dự án</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider">Gemini 3 AI Sẵn sàng</span>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => (
  <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-40">
    <div className="flex items-center gap-4">
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          type="text" 
          placeholder="Tìm kiếm dự án, thiết bị..." 
          className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm w-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
    <div className="flex items-center gap-6">
      <button className="relative text-slate-600 hover:text-orange-600">
        <i className="far fa-bell text-xl"></i>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-[10px] text-white rounded-full flex items-center justify-center border-2 border-white">3</span>
      </button>
      <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold">Quản lý Dự án</p>
          <p className="text-xs text-slate-500">Kỹ sư Trưởng</p>
        </div>
        <img src="https://picsum.photos/40/40" alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
      </div>
    </div>
  </header>
);

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 mt-16 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/daily-logs" element={<DailyLogsPage />} />
              <Route path="/checklists" element={<ChecklistsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
