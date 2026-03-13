import React, { useState } from 'react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    techStack: '',
    status: 'In Progress'
  });
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    if (newProject.name) {
      setProjects([...projects, { ...newProject, id: Date.now() }]);
      setNewProject({ name: '', description: '', techStack: '', status: 'In Progress' });
    }
  };

  const handleEdit = (id) => {
    const project = projects.find(p => p.id === id);
    setNewProject(project);
    setEditingId(id);
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
    <div className='flex flex-col items-center mt-[5vh] gap-8'>
      <h2 className='font-bold text-2xl'>Project Manager</h2>
      <div className='flex gap-2'>
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          className='border p-0.5 rounded-md'
        />
        <input
          type="text"
          placeholder="Description"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          className='border p-0.5 rounded-md'
        />
        <input
          type="text"
          placeholder="Tech Stack"
          value={newProject.techStack}
          onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
          className='border p-0.5 rounded-md'
        />
        <select
          value={newProject.status}
          onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
          className='border p-0.5 rounded-md dark:bg-gray-900'
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        {editingId ? (
          <button onClick={handleUpdate}>Update</button>
        ) : (
          <button onClick={handleAdd}>Add Project</button>
        )}
      </div>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p>Tech: {project.techStack}</p>
            <p>Status: {project.status}</p>
            <button onClick={() => handleEdit(project.id)}>Edit</button>
            <button onClick={() => handleDelete(project.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;