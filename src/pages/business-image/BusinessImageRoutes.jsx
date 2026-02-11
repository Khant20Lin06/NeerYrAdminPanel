import DashboardLayout from "layout/Dashboard";
import BusinessImageList from "./view/BusinessImageList";
import BusinessImageCreate from "./entry/BusinessImageCreate";
import BusinessImageDetail from "./view/BusinessImageDetail";
import BusinessImageUpdate from "./entry/BusinessImageUpdate";

const BusinessImageRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/business-images/list", element: <BusinessImageList /> },
    { path: "/business-image/create", element: <BusinessImageCreate /> },
    { path: "/business-image/detail/:id", element: <BusinessImageDetail /> },
    { path: "/business-image/update/:id", element: <BusinessImageUpdate /> },
  ],
};

export default BusinessImageRoutes;
