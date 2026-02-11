import DashboardLayout from "layout/Dashboard";
import BusinessList from "./view/BusinessList";
import BusinessCreate from "./entry/BusinessCreate";
import BusinessDetail from "./view/BusinessDetail";
import BusinessUpdate from "./entry/BusinessUpdate";

const BusinessRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/businesses/list", element: <BusinessList /> },
    { path: "/business/create", element: <BusinessCreate /> },
    { path: "/business/detail/:id", element: <BusinessDetail /> },
    { path: "/business/update/:id", element: <BusinessUpdate /> },
  ],
};

export default BusinessRoutes;
