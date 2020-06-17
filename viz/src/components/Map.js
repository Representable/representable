import React from "react";
import axios from "axios";
const API_URL = "http://localhost:8000";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
    };
  }
  componentDidMount() {
    var self = this;
    axios.get(`${API_URL}/api/communities/`).then(function (result) {
      console.log(result);
      self.setState({ data: result.data, loaded: true });
    });
  }
  render() {
    return (
      <ul>
        {this.state.data.map((community) => {
          return <li key={community.id}>{community.entry_name}</li>;
        })}
      </ul>
    );
  }
}

export default Map;
