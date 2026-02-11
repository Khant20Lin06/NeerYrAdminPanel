import DashboardLayout from "layout/Dashboard";
import CategoryList from "./view/CategoryList";
import CategoryCreate from "./entry/CategoryCreate";
import CategoryDetail from "./view/CategoryDetail";
import CategoryUpdate from "./entry/CategoryUpdate";

const CategoryRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/categories/list", element: <CategoryList /> },
    { path: "/category/create", element: <CategoryCreate /> },
    { path: "/category/detail/:id", element: <CategoryDetail /> },
    { path: "/category/update/:id", element: <CategoryUpdate /> },
  ],
};

export default CategoryRoutes;
