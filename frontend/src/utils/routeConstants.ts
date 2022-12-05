import Home from "src/containers/Home";
import Exercise from "src/containers/Exercise";
import Login from "src/containers/Login";
import Signup from "src/containers/Signup";
import ForgetPassword from "src/containers/ForgetPassword";
import Component404 from "src/containers/404";
// import Settings from "src/containers/Settings";

// import { ReactComponent as IntegrationIcon } from "../assets/img/integration.svg";
// import { ReactComponent as IntegrationFilledIcon } from "../assets/img/integration-filled.svg";
import {
  DashboardOutlined,
  DashboardFilled,
  ApiOutlined,
  ApiFilled,
  ContactsOutlined,
  ContactsFilled,
} from "@ant-design/icons";
import Consumers from "src/containers/Consumers";
import Users from "src/containers/Users";

//order of the rotues matter as they are rendered within the main 'Switch'
//component as they are ordered in the array

export const routeConstants = [
  {
    showInSidebar: true,
    title: "Dashboard", //reqd for main-menu-item and sub-menu-item
    icons: {
      simple: DashboardOutlined,
      filled: DashboardFilled,
    },
    route: {
      //route config for react-router-dom
      path: "/", //reqd
      exact: true,
    },
    layoutType: "dashboard",
    //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Home, //component to render in the designated layout's children
    menuItem: false, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    showInSidebar: false,
    title: "Dashboard", //reqd for main-menu-item and sub-menu-item
    icons: {
      simple: DashboardOutlined,
      filled: DashboardFilled,
    },
    route: {
      //route config for react-router-dom
      path: "/consumer/:consumerId", //reqd
      exact: true,
    },
    layoutType: "dashboard",
    //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Home, //component to render in the designated layout's children
    menuItem: false, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    showInSidebar: false,
    title: "Dashboard", //reqd for main-menu-item and sub-menu-item
    icons: {
      simple: DashboardOutlined,
      filled: DashboardFilled,
    },
    route: {
      //route config for react-router-dom
      path: "/consumer/:consumerId/course/:courseId", //reqd
      exact: true,
    },
    layoutType: "dashboard",
    //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Home, //component to render in the designated layout's children
    menuItem: false, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    showInSidebar: false,
    title: "Exercise", //reqd for main-menu-item and sub-menu-item
    icons: {
      simple: DashboardOutlined,
      filled: DashboardFilled,
    },
    route: {
      //route config for react-router-dom
      path: "/consumer/:consumerId/course/:courseId/exercise/:exerciseId", //reqd
      exact: true,
    },
    layoutType: "dashboard",
    //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Exercise, //component to render in the designated layout's children
    menuItem: false, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    showInSidebar: false,
    title: "Exercise", //reqd for main-menu-item and sub-menu-item
    icons: {
      simple: DashboardOutlined,
      filled: DashboardFilled,
    },
    route: {
      //route config for react-router-dom
      path: "/consumer/:consumerId/course/:courseId/exercise/:exerciseId/sub/:subExerciseId", //reqd
      exact: true,
    },
    layoutType: "dashboard",
    //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Exercise, //component to render in the designated layout's children
    menuItem: false, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  // {
  //   showInSidebar: true,
  //   title: "Settings",
  //   icons: {
  //     simple: IntegrationIcon,
  //     filled: IntegrationFilledIcon,
  //   },
  //   route: {
  //     path: "/settings",
  //     exact: true,
  //   },
  //   layoutType: "dashboard",
  //   authType: "only-authenticated",
  //   component: Settings,
  //   menuItem: false,
  // },

  {
    isAdminOnly: true,
    showInSidebar: true,
    title: "Consumers",
    icons: {
      simple: ApiOutlined,
      filled: ApiFilled,
    },
    route: {
      path: "/consumers",
      exact: true,
    },
    layoutType: "dashboard",
    authType: "only-authenticated",
    component: Consumers,
    menuItem: false,
  },

  {
    isAdminOnly: true,
    showInSidebar: true,
    title: "Users",
    icons: {
      simple: ContactsOutlined,
      filled: ContactsFilled,
    },
    route: {
      path: "/users",
      exact: true,
    },
    layoutType: "dashboard",
    authType: "only-authenticated",
    component: Users,
    menuItem: false,
  },

  {
    showInSidebar: false,
    title: "Login",
    route: {
      path: "/login",
      exact: true,
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: Login,
    menuItem: false,
  },
  {
    showInSidebar: false,
    title: "Register",
    route: {
      path: "/register",
      exact: true,
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: Signup,
    menuItem: false,
  },
  {
    showInSidebar: false,
    title: "Forget Password",
    route: {
      path: "/forget-password",
      exact: true,
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: ForgetPassword,
    menuItem: false,
  },

  {
    showInSidebar: false,
    route: {
      path: "/",
    },
    component: Component404,
  },
];
