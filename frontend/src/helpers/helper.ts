import { createBrowserHistory } from "history";

const history = createBrowserHistory();

export default history;

export const getRandomString = (length) => {
  var s = "";
  do {
    s += Math.random().toString(36).substr(2);
  } while (s.length < length);
  s = s.substr(0, length);

  return s;
};
