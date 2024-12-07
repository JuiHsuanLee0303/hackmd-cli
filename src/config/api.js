import Conf from "conf";

const config = new Conf({
  projectName: "hackmd-cli",
});

export const API_BASE_URL = "https://api.hackmd.io/v1";

export function getToken() {
  return config.get("token");
}

export function setToken(token) {
  config.set("token", token);
}

export function clearToken() {
  config.delete("token");
}

export default {
  getToken,
  setToken,
  clearToken,
  API_BASE_URL,
};
