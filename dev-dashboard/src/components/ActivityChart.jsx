import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { Plus, Trash2, Edit2, Check, X, TrendingUp, TrendingDown, Clock, Target, FolderOpen, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, getDay } from 'date-fns';


const CATEGORIES = ['Development', 'Meetings', 'Research', 'Design', 'Testing', 'Documentation'];
const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const initialEntries = [
  { id: 1, date: '2026-03-16', day: 'Mon', hours: 4, tasks: 2, projects: 1, category: 'Development', notes: 'API integration' },
  { id: 2, date: '2026-03-17', day: 'Tue', hours: 6, tasks: 3, projects: 1, category: 'Meetings', notes: 'Sprint planning' },
  { id: 3, date: '2026-03-18', day: 'Wed', hours: 5, tasks: 1, projects: 0, category: 'Research', notes: 'Tech spike' },
  { id: 4, date: '2026-03-19', day: 'Thu', hours: 7, tasks: 4, projects: 2, category: 'Development', notes: 'Feature build' },
  { id: 5, date: '2026-03-20', day: 'Fri', hours: 3, tasks: 2, projects: 1, category: 'Testing', notes: 'QA review' },
];

const ActivityChart = () => {
  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem('timesheetEntries');
    return stored ? JSON.parse(stored) : initialEntries;
  });
  const [viewMode, setViewMode] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    tasks: '',
    projects: '',
    category: 'Development',
    notes: '',
  });
  
  useEffect(() => {
    localStorage.setItem('timesheetEntries', JSON.stringify(entries));
  }, [entries]);


  // Navigation
  const navigate = (dir) => {
    setCurrentDate(prev =>
      viewMode === 'weekly'
        ? (dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1))
        : (dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1))
    );
  };

  const rangeStart = viewMode === 'weekly' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
  const rangeEnd = viewMode === 'weekly' ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfMonth(currentDate);
  const rangeLabel = viewMode === 'weekly'
    ? `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  const filteredEntries = useMemo(() =>
    entries.filter(e => {
      const d = new Date(e.date);
      return isWithinInterval(d, { start: rangeStart, end: rangeEnd });
    }),
    [entries, rangeStart, rangeEnd]
  );

  // Stats
  const stats = useMemo(() => {
    const totalHours = filteredEntries.reduce((s, e) => s + e.hours, 0);
    const totalTasks = filteredEntries.reduce((s, e) => s + e.tasks, 0);
    const totalProjects = filteredEntries.reduce((s, e) => s + e.projects, 0);
    const avgHours = filteredEntries.length ? +(totalHours / filteredEntries.length).toFixed(1) : 0;
    const targetHours = viewMode === 'weekly' ? 40 : 160;
    const utilization = targetHours ? +((totalHours / targetHours) * 100).toFixed(0) : 0;
    const peakDay = filteredEntries.length
      ? filteredEntries.reduce((max, e) => e.hours > max.hours ? e : max, filteredEntries[0])
      : null;
    return { totalHours, totalTasks, totalProjects, avgHours, utilization, targetHours, peakDay };
  }, [filteredEntries, viewMode]);

  // Chart data
  const barData = useMemo(() => {
    if (viewMode === 'weekly') {
      const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      return days.map(d => {
        const dayStr = format(d, 'yyyy-MM-dd');
        const entry = filteredEntries.find(e => e.date === dayStr);
        return {
          name: DAY_NAMES[getDay(d)],
          date: format(d, 'MMM d'),
          hours: entry?.hours || 0,
          tasks: entry?.tasks || 0,
          projects: entry?.projects || 0,
        };
      });
    }
    // Monthly: group by week
    const weeks = {};
    filteredEntries.forEach(e => {
      const wk = `W${Math.ceil(new Date(e.date).getDate() / 7)}`;
      if (!weeks[wk]) weeks[wk] = { hours: 0, tasks: 0, projects: 0 };
      weeks[wk].hours += e.hours;
      weeks[wk].tasks += e.tasks;
      weeks[wk].projects += e.projects;
    });
    return Object.keys(weeks).map(name => ({ name, hours: weeks[name].hours, tasks: weeks[name].tasks, projects: weeks[name].projects }));
  }, [filteredEntries, viewMode, rangeStart, rangeEnd]);

  const categoryData = useMemo(() => {
    const cats = {};
    filteredEntries.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.hours;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  const cumulativeData = useMemo(() => {
    let cumHours = 0;
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    const target = stats.targetHours / days.length;
    let cumTarget = 0;
    return days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd');
      const entry = filteredEntries.find(e => e.date === dayStr);
      cumHours += entry?.hours || 0;
      cumTarget += target;
      return {
        name: format(d, 'MMM d'),
        actual: +cumHours.toFixed(1),
        target: +cumTarget.toFixed(1),
      };
    });
  }, [filteredEntries, rangeStart, rangeEnd, stats.targetHours]);

  // CRUD
  const handleAdd = () => {
    if (!formData.hours) return;
    const d = new Date(formData.date);
    const entry = {
      id: Date.now(),
      date: formData.date,
      day: DAY_NAMES[getDay(d)],
      hours: +formData.hours,
      tasks: +formData.tasks || 0,
      projects: +formData.projects || 0,
      category: formData.category,
      notes: formData.notes,
    };
    setEntries(prev => [...prev, entry]);
    setFormData({ date: format(new Date(), 'yyyy-MM-dd'), hours: '', tasks: '', projects: '', category: 'Development', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const handleEditSave = (id, field, value) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const numFields = ['hours', 'tasks', 'projects'];
      return { ...e, [field]: numFields.includes(field) ? +value : value };
    }));
  };

  // Insights
  const insights = useMemo(() => {
    const msgs = [];
    if (stats.utilization >= 90) msgs.push({ icon: <TrendingUp size={16} />, text: `Excellent! ${stats.utilization}% utilization this ${viewMode === 'weekly' ? 'week' : 'month'}.`, type: 'positive' });
    else if (stats.utilization < 60) msgs.push({ icon: <TrendingDown size={16} />, text: `Low utilization at ${stats.utilization}%. Consider logging more hours.`, type: 'negative' });
    if (stats.peakDay) msgs.push({ icon: <Clock size={16} />, text: `Peak day: ${stats.peakDay.day} with ${stats.peakDay.hours}h logged.`, type: 'neutral' });
    const topCat = [...categoryData].sort((a, b) => Number(b.value) - Number(a.value))[0];
    if (topCat) msgs.push({ icon: <Target size={16} />, text: `Most time spent on ${topCat.name} (${topCat.value}h).`, type: 'neutral' });
    if (stats.avgHours > 8) msgs.push({ icon: <TrendingDown size={16} />, text: `Averaging ${stats.avgHours}h/day — watch for burnout.`, type: 'negative' });
    else if (stats.avgHours > 0) msgs.push({ icon: <TrendingUp size={16} />, text: `Averaging ${stats.avgHours}h/day — solid pace.`, type: 'positive' });
    return msgs;
  }, [stats, categoryData, viewMode]);

  const insightColor = (type) =>
    type === 'positive' ? 'text-[#16a34a]' : type === 'negative' ? 'text-[#dc2626]' : 'text-[#6b7280] dark:text-[#9ca3af]';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a] dark:text-[#f1f5f9]">Timesheet</h2>
          <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">Track hours, tasks & project contributions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-lg border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'weekly' ? 'bg-[#2563eb] text-[#ffffff]' : 'bg-[#ffffff] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-[#2563eb] text-[#ffffff]' : 'bg-[#ffffff] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]'}`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8] active:scale-[0.97] transition-all"
          >
            <Plus size={16} /> Log Time
          </button>
        </div>
      </div>

      {/* Date nav */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors active:scale-95">
          <ChevronLeft size={20} className="text-[#475569] dark:text-[#94a3b8]" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-[#2563eb]" />
          <span className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9]">{rangeLabel}</span>
        </div>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors active:scale-95">
          <ChevronRight size={20} className="text-[#475569] dark:text-[#94a3b8]" />
        </button>
      </div>

      {/* Add entry form */}
      {showForm && (
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Log New Entry</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Hours</label>
              <input type="number" min="0" max="24" step="0.5" placeholder="0" value={formData.hours}
                onChange={e => setFormData({ ...formData, hours: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Tasks</label>
              <input type="number" min="0" placeholder="0" value={formData.tasks}
                onChange={e => setFormData({ ...formData, tasks: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Projects</label>
              <input type="number" min="0" placeholder="0" value={formData.projects}
                onChange={e => setFormData({ ...formData, projects: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">Notes</label>
              <input type="text" placeholder="Brief note..." value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="border border-[#e2e8f0] dark:border-[#475569] rounded-lg px-2.5 py-1.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] outline-none focus:ring-2 focus:ring-[#2563eb]" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-[#16a34a] text-[#ffffff] hover:bg-[#15803d] active:scale-[0.97] transition-all">
              <Check size={14} /> Save Entry
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg border border-[#e2e8f0] dark:border-[#475569] text-[#475569] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] active:scale-[0.97] transition-all">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Hours', value: stats.totalHours, icon: <Clock size={18} />, color: '#6366f1' },
          { label: 'Tasks Done', value: stats.totalTasks, icon: <Target size={18} />, color: '#22c55e' },
          { label: 'Projects', value: stats.totalProjects, icon: <FolderOpen size={18} />, color: '#f59e0b' },
          { label: 'Avg Hours/Day', value: stats.avgHours, icon: <TrendingUp size={18} />, color: '#06b6d4' },
          { label: 'Utilization', value: `${stats.utilization}%`, icon: <TrendingUp size={18} />, color: stats.utilization >= 80 ? '#16a34a' : stats.utilization >= 60 ? '#f59e0b' : '#dc2626' },
        ].map((kpi, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: kpi.color + '18', color: kpi.color }}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{kpi.label}</p>
              <p className="text-lg font-bold text-[#0f172a] dark:text-[#f1f5f9] tabular-nums">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Hours, Tasks & Projects</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="hours" fill="#6366f1" name="Hours" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill="#22c55e" name="Tasks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projects" fill="#f59e0b" name="Projects" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Hours by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-65 text-sm text-[#94a3b8]">No data for this period</div>
          )}
        </div>

        {/* Cumulative area chart */}
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Cumulative: Actual vs Target</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="Target" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="actual" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily trend line */}
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Daily Hours Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl p-4 bg-[#ffffff] dark:bg-[#1e293b] shadow-sm">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-3">Smart Insights</h3>
          <div className="flex flex-col gap-2">
            {insights.map((ins, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${insightColor(ins.type)}`}>
                {ins.icon}
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="border border-[#e2e8f0] dark:border-[#334155] rounded-xl bg-[#ffffff] dark:bg-[#1e293b] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e2e8f0] dark:border-[#334155]">
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#f1f5f9]">Timesheet Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a]">
                {['Date', 'Day', 'Hours', 'Tasks', 'Projects', 'Category', 'Notes', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#94a3b8]">No entries for this period. Click "Log Time" to add one.</td></tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-[#f1f5f9] dark:border-[#1e293b] hover:bg-[#f8fafc] dark:hover:bg-[#0f172a]/50 transition-colors">
                    <td className="px-4 py-2.5 text-[#0f172a] dark:text-[#f1f5f9]">{format(new Date(entry.date), 'MMM d')}</td>
                    <td className="px-4 py-2.5 text-[#475569] dark:text-[#94a3b8]">{entry.day}</td>
                    {editingId === entry.id ? (
                      <>
                        <td className="px-4 py-2.5"><input type="number" defaultValue={entry.hours} onBlur={e => handleEditSave(entry.id, 'hours', e.target.value)} className="w-14 border border-[#e2e8f0] dark:border-[#475569] rounded px-1.5 py-0.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]" /></td>
                        <td className="px-4 py-2.5"><input type="number" defaultValue={entry.tasks} onBlur={e => handleEditSave(entry.id, 'tasks', e.target.value)} className="w-14 border border-[#e2e8f0] dark:border-[#475569] rounded px-1.5 py-0.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]" /></td>
                        <td className="px-4 py-2.5"><input type="number" defaultValue={entry.projects} onBlur={e => handleEditSave(entry.id, 'projects', e.target.value)} className="w-14 border border-[#e2e8f0] dark:border-[#475569] rounded px-1.5 py-0.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]" /></td>
                        <td className="px-4 py-2.5">
                          <select defaultValue={entry.category} onBlur={e => handleEditSave(entry.id, 'category', e.target.value)} className="border border-[#e2e8f0] dark:border-[#475569] rounded px-1.5 py-0.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5"><input type="text" defaultValue={entry.notes} onBlur={e => handleEditSave(entry.id, 'notes', e.target.value)} className="w-24 border border-[#e2e8f0] dark:border-[#475569] rounded px-1.5 py-0.5 text-sm bg-[#ffffff] dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]" /></td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 font-medium text-[#0f172a] dark:text-[#f1f5f9] tabular-nums">{entry.hours}h</td>
                        <td className="px-4 py-2.5 text-[#475569] dark:text-[#94a3b8] tabular-nums">{entry.tasks}</td>
                        <td className="px-4 py-2.5 text-[#475569] dark:text-[#94a3b8] tabular-nums">{entry.projects}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: CHART_COLORS[CATEGORIES.indexOf(entry.category) % CHART_COLORS.length] + '20', color: CHART_COLORS[CATEGORIES.indexOf(entry.category) % CHART_COLORS.length] }}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[#475569] dark:text-[#94a3b8] max-w-37.5 truncate">{entry.notes}</td>
                      </>
                    )}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingId(editingId === entry.id ? null : entry.id)} className="p-1 rounded hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors active:scale-90">
                          {editingId === entry.id ? <Check size={14} className="text-[#16a34a]" /> : <Edit2 size={14} className="text-[#64748b]" />}
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:bg-[#fef2f2] dark:hover:bg-[#450a0a] transition-colors active:scale-90">
                          <Trash2 size={14} className="text-[#dc2626]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
