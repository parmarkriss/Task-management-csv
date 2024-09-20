import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const TodoContext = createContext();

export const useTodoContext = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState({ current: [], pending: [], completed: [] });
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('state')) || {
      todos: { current: [], pending: [], completed: [] },
      filters: {},
      sortBy: 'dueDate',
      searchTerm: '',
    };
    setTodos(savedState.todos);
    setFilters(savedState.filters);
    setSortBy(savedState.sortBy);
    setSearchTerm(savedState.searchTerm);
  }, []);

  const saveStateToLocalStorage = () => {
    localStorage.setItem('state', JSON.stringify({
      todos,
      filters,
      sortBy,
      searchTerm,
    }));
  };

  const addTodo = (todo) => {
    const newTodos = {
      ...todos,
      current: [...todos.current, { ...todo, id: Date.now().toString() }],
    };
    setTodos(newTodos);
    saveStateToLocalStorage();
    toast.success("Todo added successfully!");
  };

  const deleteTodo = (id, status) => {
    const newTodos = {
      ...todos,
      [status]: todos[status].filter(todo => todo.id !== id),
    };
    setTodos(newTodos);
    saveStateToLocalStorage();
    toast.success("Todo deleted!");
  };

  const updateTodo = (id, updatedTodo) => {
    let found = false;
    const newTodos = {
      ...todos,
      current: todos.current.map(item => {
        if (item.id === id) {
          found = true;
          return { ...item, ...updatedTodo };
        }
        return item;
      }),
      pending: todos.pending.map(item => {
        if (item.id === id) {
          found = true;
          return { ...item, ...updatedTodo };
        }
        return item;
      }),
      completed: todos.completed.map(item => {
        if (item.id === id) {
          found = true;
          return { ...item, ...updatedTodo };
        }
        return item;
      }),
    };
    if (!found) {
      toast.error("Todo not found!");
      return;
    }
    setTodos(newTodos);
    saveStateToLocalStorage();
    toast.success("Todo updated successfully!");
  };

  const changeStatus = (id, currentStatus, newStatus) => {
    const taskToMove = todos[currentStatus].find(todo => todo.id === id);
    if (!taskToMove) {
      toast.error("Todo not found in the current status!");
      return;
    }

    const newTodos = {
      ...todos,
      [currentStatus]: todos[currentStatus].filter(todo => todo.id !== id),
      [newStatus]: [...todos[newStatus], { ...taskToMove, Status: newStatus }],
    };

    setTodos(newTodos);
    saveStateToLocalStorage();
    toast.success(`Todo moved to ${newStatus}!`);
  };

  useEffect(() => {
    saveStateToLocalStorage();
  }, [todos, filters, sortBy, searchTerm]);

  const value = {
    todos,
    setTodos,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    addTodo,
    deleteTodo,
    updateTodo,
    changeStatus,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
