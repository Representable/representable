import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
const Dashboard = lazy(() => import("./routes/Dashboard"));
const Map = lazy(() => import("./routes/Map"));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/map" component={Map} />
      </Switch>
    </Suspense>
  </Router>
);
export default App;

const container = document.getElementById("root");
render(<App />, container);
