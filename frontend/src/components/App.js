import React, { Component } from "react";
import { render } from "react-dom";
import Dashboard from "./Dashboard";

function App() {
  return <Dashboard></Dashboard>;
}
export default App;

const container = document.getElementById("app");
render(<App />, container);
