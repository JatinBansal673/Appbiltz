import React, { useState, useEffect, useRef } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const TaskBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetColumn, setTargetColumn] = useState('todo');
  const [formData, setFormData] = useState({ title: '', description: '', assignee: '' });
  const [expandedDescs, setExpandedDescs] = useState({});

  const columnRefs = useRef({});
  const taskRefs = useRef({});

  const handleDrop = (column, taskId) => {
    const fromColumn = Object.keys(tasks).find(col => tasks[col].some(t => t.id === taskId));
    if (fromColumn && fromColumn !== column) {
      const task = tasks[fromColumn].find(t => t.id === taskId);
      setTasks({
        ...tasks,
        [fromColumn]: tasks[fromColumn].filter(t => t.id !== taskId),
        [column]: [...tasks[column], task]
      });
    }
  };

  const openAddDialog = (column) => {
    setEditingTask(null);
    setTargetColumn(column);
    setFormData({ title: '', description: '', assignee: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (task, column) => {
    setEditingTask(task);
    setTargetColumn(column);
    setFormData({ title: task.title, description: task.description, assignee: task.assignee });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks({
        ...tasks,
        [targetColumn]: tasks[targetColumn].map(t =>
          t.id === editingTask.id ? { ...t, ...formData } : t
        )
      });
    } else {
      const newTask = { id: Date.now(), ...formData };
      setTasks({ ...tasks, [targetColumn]: [...tasks[targetColumn], newTask] });
    }
    setDialogOpen(false);
  };

  const deleteTask = (taskId, column) => {
    setTasks({ ...tasks, [column]: tasks[column].filter(t => t.id !== taskId) });
  };

  const toggleDesc = (id) => {
    setExpandedDescs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const cleanups = [];
    Object.keys(tasks).forEach(column => {
      const element = columnRefs.current[column];
      if (element) {
        cleanups.push(dropTargetForElements({
          element,
          onDrop: ({ source }) => {
            const taskId = source.data.taskId;
            handleDrop(column, taskId);
          }
        }));
      }
    });
    return () => cleanups.forEach(c => c());
  }, [tasks]);

  useEffect(() => {
    const cleanups = [];
    Object.keys(tasks).forEach(column => {
      tasks[column].forEach(task => {
        const element = taskRefs.current[task.id];
        if (element) {
          cleanups.push(draggable({
            element,
            getInitialData: () => ({ taskId: task.id })
          }));
        }
      });
    });
    return () => cleanups.forEach(c => c());
  }, [tasks]);

  const columnLabels = { todo: 'TO DO', inProgress: 'IN PROGRESS', done: 'DONE' };
  const columnColors = {
    todo: { dot: 'bg-[#3b82f6]', count: 'bg-[#dbeafe] text-[#1e40af]' },
    inProgress: { dot: 'bg-[#f59e0b]', count: 'bg-[#fef3c7] text-[#92400e]' },
    done: { dot: 'bg-[#10b981]', count: 'bg-[#d1fae5] text-[#065f46]' }
  };

  return (
    <div className="p-6 flex justify-center md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight">Task Board</h1>
        <div className="flex gap-5 overflow-x-auto pb-4">
          {Object.keys(tasks).map(column => (
            <div
              key={column}
              ref={(el) => { if (el) columnRefs.current[column] = el; }}
              className="w-80 min-h-[400px] shrink-0 border border-[#e2e8f0] p-4 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${columnColors[column].dot}`}></span>
                  <h2 className="text-xs font-bold uppercase tracking-widest">
                    {columnLabels[column]}
                  </h2>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${columnColors[column].count}`}>
                    {tasks[column].length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openAddDialog(column)}
                className="w-full mb-4 px-3 py-2.5 text-sm font-semibold text-[#3b82f6] bg-[#eff6ff] hover:bg-[#dbeafe] rounded-xl border border-dashed border-[#93c5fd] transition-colors"
              >
                + Add Task
              </button>
              <div className="space-y-2.5">
                {tasks[column].map(task => (
                  <div
                    key={task.id}
                    ref={(el) => { if (el) taskRefs.current[task.id] = el; }}
                    className="group p-3.5 bg-[#fafbfc] hover:bg-[#f1f5f9] cursor-grab active:cursor-grabbing rounded-xl border border-[#e2e8f0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#1e293b] leading-tight">{task.title}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditDialog(task, column); }}
                          className="p-1 rounded-md hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id, column); }}
                          className="p-1 rounded-md hover:bg-[#fee2e2] text-[#64748b] hover:text-[#dc2626] transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <div className="mt-1.5">
                        <p className="text-xs text-[#64748b] leading-relaxed">
                          {task.description.length > 20 && !expandedDescs[task.id]
                            ? `${task.description.slice(0, 20)}...`
                            : task.description}
                        </p>
                        {task.description.length > 20 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleDesc(task.id); }}
                            className="text-[10px] font-semibold text-[#3b82f6] hover:text-[#2563eb] mt-0.5"
                          >
                            {expandedDescs[task.id] ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    )}
                    {task.assignee && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#6366f1] text-white text-[10px] font-bold flex items-center justify-center uppercase">
                          {task.assignee.charAt(0)}
                        </span>
                        <span className="text-[11px] text-[#94a3b8] font-medium">{task.assignee}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/50 backdrop-blur-sm">
          <div className="bg-[#ffffff] rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0f172a]">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#475569] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#1e293b] placeholder-[#94a3b8] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#1e293b] placeholder-[#94a3b8] resize-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">Assignee</label>
                <input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Assign to someone"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-[#1e293b] placeholder-[#94a3b8] transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#ffffff] bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl transition-colors shadow-[0_1px_3px_rgba(59,130,246,0.4)]"
              >
                {editingTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
