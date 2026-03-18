import React, { useState } from 'react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', techStack: '', status: 'In Progress' });
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    if (newProject.name) {
      setProjects([...projects, { ...newProject, id: Date.now() }]);
      setNewProject({ name: '', description: '', techStack: '', status: 'In Progress' });
    }
  };

  const handleEdit = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setNewProject(project);
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    setProjects(projects.map(p => p.id === editingId ? { ...newProject, id: editingId } : p));
    setNewProject({ name: '', description: '', techStack: '', status: 'In Progress' });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-xl font-semibold tracking-tight">Project Manager</h1>
          <p className="text-sm">Track and manage your development pipeline.</p>
        </header>

        {/* Input Bar */}
        <div className="rounded-xl p-1 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
            <input
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border"
            />
            <input
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border"
            />
            <input
              placeholder="Tech Stack (e.g. React, Go)"
              value={newProject.techStack}
              onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border"
            />
            <div className="flex gap-1">
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                className="text-xs font-medium px-3 py-2 rounded-lg border focus:ring-0 outline-none grow appearance-none cursor-pointer dark:bg-gray-900"
              >
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="bg-blue-600 text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-colors active:scale-[0.98] will-change-transform border"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative p-5 rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.12),0_8px_16px_-4px_rgba(0,0,0,.08)] transition-all duration-300 border"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    project.status === 'Completed'
                      ? 'bg-green-300 text-green-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {project.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="text-[11px] font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-[11px] font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold mb-1">{project.name}</h3>
              {(!project.description || project.description.length<20)?
                <p className="text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>
                :
                <p className="text-sm leading-relaxed mb-4">
                  {expanded ? project.description : `${project.description.slice(0, 20)}...`}
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="ml-1 hover:underline text-xs font-medium"
                  >
                    {expanded ? 'Read less' : 'Read more'}
                  </button>
                </p>
              }

              {project.techStack && (
                <div className="pt-4 border-t flex flex-wrap gap-1">
                  {project.techStack.split(',').map((tech, i) => (
                    <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md dark:bg-gray-600">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-sm">No projects found. Start by adding one above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
