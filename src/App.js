import React from 'react';
import { TodoProvider } from './TodoContext'; 
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css'; 
import Todo from './Todo';

function App() {
  return (
    <TodoProvider>
      <Todo/>
    </TodoProvider>
  );
}

export default App;
