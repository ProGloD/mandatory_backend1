import React, { useState } from "react";

import Login from "./components/Login";
import Home from "./components/Home";
import "./App.css";

function App() {
  const [name, updateName] = useState("");
  const [isAuthed, updateAuthed] = useState(false);

  return !isAuthed ? (
    <Login updateAuthed={updateAuthed} name={name} updateName={updateName} />
  ) : (
    <Home updateAuthed={updateAuthed} name={name} />
  );
}

export default App;
