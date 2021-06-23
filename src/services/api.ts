import axios from "axios";

export const api = axios.create({
  baseURL: "https://hidden-headland-41774.herokuapp.com",
});
