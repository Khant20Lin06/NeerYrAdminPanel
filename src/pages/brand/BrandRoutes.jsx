import DashboardLayout from "layout/Dashboard";
import BrandList from "./view/BrandList";
import BrandCreate from "./entry/BrandCreate";
import BrandDetail from "./view/BrandDetail";
import BrandUpdate from "./entry/BrandUpdate";

const BrandRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/brands/list", element: <BrandList /> },
    { path: "/brand/create", element: <BrandCreate /> },
    { path: "/brand/detail/:id", element: <BrandDetail /> },
    { path: "/brand/update/:id", element: <BrandUpdate /> },
  ],
};

export default BrandRoutes;
