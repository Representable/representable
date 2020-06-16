import axios from "axios";
const API_URL = "http://localhost:8000";

export default class Communities {
  constructor() {}

  async getCommunities() {
    const url = `${API_URL}/api/communities/`;
    const response = await axios.get(url);
    return response.data;
  }
  async getCommunity(id) {
    const url = `${API_URL}/api/communities/${id}`;
    const response = await axios.get(url);
    return response.data;
  }
}
