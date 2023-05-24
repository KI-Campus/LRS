import { ReactElement, useEffect } from "react";
import Routes from "./routes";
import { useAppDispatch } from "./redux/hooks";
import { checkLoginStatus } from "./redux/auth";
import "./App.scss";

const Home = (): ReactElement => {
  let dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  return <Routes />;
};

export default Home;
