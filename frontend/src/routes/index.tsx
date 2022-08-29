//@ts-nocheck
import { Component, ReactElement } from "react";
import {
  BrowserRouter,
  Redirect,
  Route as RouterRoute,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import { Spin } from "antd";

//layouts
import AuthLayout from "../layouts/AuthLayout/index";
import DashboardLayout from "../layouts/DashboardLayout/index";
import EmptyLayout from "../layouts/EmptyLayout";
import { useAppSelector } from "../redux/hooks";
import { routeConstants } from "../utils/routeConstants";

const routeRenderer = (
  routes,
  prefix = "",
  basePath = "",
  parentConfig = {}
) => {
  return routes.map((route, i) => {
    if (route.subRoutes) {
      //if a root with child roots has it's own path and corresponding component
      //then it should be rendered as a seperate route
      if (route.route?.path && route.component)
        return (
          <>
            {routeRenderer(
              route.subRoutes,
              prefix + i + ".",
              basePath + route.route?.path || "",
              route
            )}
            <Route
              key={prefix + i}
              layoutType={route.layoutType || parentConfig.layoutType}
              authType={route.authType || parentConfig.authType}
              {...route.route}
              path={basePath + route.route.path}
            >
              <route.component />
            </Route>
          </>
        );

      return routeRenderer(
        route.subRoutes,
        prefix + i + ".",
        basePath + route.route?.path || "",
        route
      );
    }

    return (
      <Route
        key={prefix + i}
        layoutType={route.layoutType || parentConfig.layoutType}
        authType={route.authType || parentConfig.authType}
        {...route.route}
        path={basePath + route.route.path}
      >
        <route.component />
      </Route>
    );
  });
};

class Router extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>{routeRenderer(routeConstants)}</Switch>
      </BrowserRouter>
    );
  }
}

export default Router;

const LayoutWrapper = ({
  type,
  children,
}: {
  type: string;
  children: ReactElement;
}) => {
  switch (type) {
    case "empty":
      return <EmptyLayout>{children}</EmptyLayout>;
    case "auth":
      return <AuthLayout>{children}</AuthLayout>;
    case "dashboard":
      return <DashboardLayout>{children}</DashboardLayout>;
    case "none":
    default:
      return children;
  }
};

const AuthWrapper = ({
  type,
  children,
}: {
  type: string;
  children: ReactElement;
}) => {
  const { isLoggedIn } = useAppSelector((state) => state.authModal);

  const location = useLocation();
  const history = useHistory();

  if (history && !window.routerHistory) {
    window.routerHistory = history;
  }

  switch (type) {
    case "only-authenticated":
      if (isLoggedIn === undefined)
        return (
          <div className="complete-spinner">
            <Spin />
          </div>
        );
      else if (isLoggedIn === null)
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        );
      return children;
    case "only-unauthenticated":
      if (isLoggedIn === undefined)
        return (
          <div className="complete-spinner">
            <Spin />
          </div>
        );
      else if (isLoggedIn !== null)
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location },
            }}
          />
        );
      return children;
    case "none":
    default:
      return children;
  }
};

const Route = ({
  authType = "none",
  layoutType = "empty",
  children,
  ...props
}) => {
  return (
    <RouterRoute {...props}>
      <AuthWrapper type={authType}>
        <LayoutWrapper type={layoutType}>{children}</LayoutWrapper>
      </AuthWrapper>
    </RouterRoute>
  );
};
