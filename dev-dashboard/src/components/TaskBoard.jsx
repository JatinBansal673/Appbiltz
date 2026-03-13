import React, { useState, useEffect, useRef } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const TaskBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [{ id: 1, title: 'Task 1' }],
    inProgress: [],
    done: []
  });

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

  const addTask = (column) => {
    const newTask = { id: Date.now(), title: `New Task ${Date.now()}` };
    setTasks({ ...tasks, [column]: [...tasks[column], newTask] });
  };

  // Register drop targets for columns
  useEffect(() => {
    Object.keys(tasks).forEach(column => {
      const element = columnRefs.current[column];
      if (element) {
        const cleanup = dropTargetForElements({
          element,
          onDrop: ({ source }) => {
            const taskId = source.data.taskId;
            handleDrop(column, taskId);
          }
        });
        return cleanup;
      }
    });
  }, [tasks]);

  // Register draggables for tasks
  useEffect(() => {
    Object.keys(tasks).forEach(column => {
      tasks[column].forEach(task => {
        const element = taskRefs.current[task.id];
        if (element) {
          const cleanup = draggable({
            element,
            getInitialData: () => ({ taskId: task.id })
          });
          return cleanup;
        }
      });
    });
  }, [tasks]);

  return (
    <div className='flex flex-col items-center mt-[5vh] gap-8'>
      <h2 className='text-2xl font-bold'>Task Board</h2>
      <div className='flex gap-5 justify-center'>
        {Object.keys(tasks).map(column => (
          <div
            key={column}
            ref={(el) => {
              if (el) columnRefs.current[column] = el;
            }}
            className="w-50 min-h-75 border-2 border-gray-300 p-2.5 rounded-lg"
          >
            <h3>{column.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
            <button onClick={() => addTask(column)} className="mb-2.5 px-2.5 py-1.25">
              Add Task
            </button>
            {tasks[column].map(task => (
              <div
                key={task.id}
                ref={(el) => {
                  if (el) taskRefs.current[task.id] = el;
                }}
                className="p-2.5 m-1.25 bg-gray-100 cursor-grab rounded border dark:bg-gray-700  border-gray-300"
              >
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;