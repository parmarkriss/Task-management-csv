import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CSVLink } from "react-csv";
import Papa from 'papaparse';

function Todo() {
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [todo, setTodo] = useState({
    Title: "",
    Description: "",
    Status: "current",
    DueDate: "",
    Priority: "medium",
    AssignedTo: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    setTodos(savedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTodo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTodo = () => {
    if (!todo.Title.trim()) {
      alert("Task title is required.");
      return;
    }

    const newTodo = {
      ...todo,
      id: Date.now().toString()
    };

    setTodos(prev => [...prev, newTodo]);
    alert("Task added successfully!");
    resetTodo();
  };

  const handleUpdateTodo = () => {
    if (!todo.Title.trim()) {
      alert("Task title is required.");
      return;
    }

    setTodos(prev => prev.map(t => t.id === editId ? { ...todo, id: editId } : t));
    alert("Task updated successfully!");
    resetTodo();
  };

  const resetTodo = () => {
    setIsEditing(false);
    setEditId(null);
    setTodo({ Title: "", Description: "", Status: "current", DueDate: "", Priority: "medium", AssignedTo: "" });
  };

  const handleEdit = (task) => {
    setIsEditing(true);
    setEditId(task.id);
    setTodo({ ...task });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = todos.filter(task =>
      task.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.Description && task.Description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort tasks based on selected criterion and order
    filteredTasks.sort((a, b) => {
      const comparison = sortOrder === 'asc' 
        ? a[sortBy] > b[sortBy] ? 1 : -1
        : a[sortBy] < b[sortBy] ? 1 : -1;

      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.DueDate) - new Date(b.DueDate)
          : new Date(b.DueDate) - new Date(a.DueDate);
      }
      return comparison;
    });

    return filteredTasks;
  }, [todos, sortBy, sortOrder, searchTerm]);

  const prepareCSVData = () => {
    return todos.map(task => ({
      Title: task.Title,
      Description: task.Description || '',
      DueDate: task.DueDate || '',
      Priority: task.Priority || '',
      Status: task.Status,
      AssignedTo: task.AssignedTo || ''
    }));
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validTasks = results.data.filter(row => row.Title);
          if (validTasks.length > 0) {
            setTodos(validTasks.map(task => ({ ...task, id: Date.now().toString() })));
            alert(`Imported ${validTasks.length} tasks successfully!`);
          } else {
            alert("No valid tasks found in the CSV file.");
          }
        },
        error: (error) => {
          alert(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      alert("Please select a file to import.");
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const newTodos = Array.from(todos);
    const [movedTask] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedTask);

    setTodos(newTodos);
    alert("Task reordered successfully!");
  };

  return (
    <div className="container mt-4">
    <form onSubmit={(e) => e.preventDefault()} className="mb-4">
  <h2 className="mb-3">{isEditing ? "Edit Task" : "Add Task"}</h2>
  <input
    type="text"
    name="Title"
    value={todo.Title}
    onChange={handleInputChange}
    className="form-control mb-2"
    placeholder="Enter task title"
    required
  />
  <textarea
    name="Description"
    value={todo.Description}
    onChange={handleInputChange}
    className="form-control mb-2"
    placeholder="Enter task description"
  />
  
  <div className="d-flex mb-2">
    <select
      name="Status"
      value={todo.Status}
      onChange={handleInputChange}
      className="form-control me-2"
    >
      <option value="current">Current</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>
    
    <select
      name="Priority"
      value={todo.Priority}
      onChange={handleInputChange}
      className="form-control me-2"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    
    <input
      type="datetime-local"
      name="DueDate"
      value={todo.DueDate}
      onChange={handleInputChange}
      className="form-control"
    />
  </div>

  <input
    type="text"
    name="AssignedTo"
    value={todo.AssignedTo}
    onChange={handleInputChange}
    className="form-control mb-2"
    placeholder="Assigned To"
  />
  
  <button
    type="button"
    onClick={isEditing ? handleUpdateTodo : handleAddTodo}
    className="btn btn-primary"
  >
    {isEditing ? "Update Task" : "Add Task"}
  </button>
</form>


<div className="mb-4 d-flex align-items-center">
  <input
    type="text"
    placeholder="Search tasks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="form-control me-2" 
  />
  
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="form-control me-2"
  >
    <option value="dueDate">Sort by Due Date</option>
    <option value="Priority">Sort by Priority</option>
    <option value="Title">Sort by Title</option>
  </select>

</div>


      <div className="mb-4 d-flex justify-content-between">
        <CSVLink
          data={prepareCSVData()}
          filename={"tasks.csv"}
          className="btn btn-success"
        >
          Export CSV
        </CSVLink>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="hidden"
          id="csvInput"
        />
        <label htmlFor="csvInput" className="btn btn-info cursor-pointer">
          Import CSV
        </label>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row">
          {['current', 'pending', 'completed'].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="col flex-grow-1 p-3 bg-light border rounded"
                >
                  <h2 className="text-center text-uppercase mb-3">{status}</h2>
                  {filteredAndSortedTasks.filter(todo => todo.Status === status).map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="card mb-3 shadow-sm"
                        >
                          <div className="card-body d-flex justify-content-between">
                            <div>
                              <span className={`${todo.Status === 'completed' ? "text-decoration-line-through" : ""}`}>{todo.Title}</span>
                              <p>{todo.Description}</p>
                              <small>{todo.DueDate ? new Date(todo.DueDate).toLocaleString() : "No due date"}</small>
                            </div>
                            <div>
                              <button className="btn btn-secondary" onClick={() => handleEdit(todo)}>Edit</button>
                              <button className="btn btn-danger" onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}>Delete</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Todo;
