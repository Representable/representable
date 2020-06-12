import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import Dashboard from "./routes/Dashboard";
import Map from "./routes/Map";

const App = () => (
  <Map></Map>
  // TODO: Fix Routes
  // <Router>
  //   <div className="App">
  //     <ul>
  //       <li><Link to="/home">Home</Link></li>
  //       <li><Link to="/map">Page 1</Link></li>
  //     </ul>
  //     <Switch>
  //       <Route path="/home" component={Dashboard} />
  //       <Route path="/map" component={Map} />
  //     </Switch>
  //     </div>
  // </Router>
);
export default App;

const container = document.getElementById("root");
render(<App />, container);
