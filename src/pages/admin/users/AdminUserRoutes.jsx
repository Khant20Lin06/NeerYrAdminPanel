import DashboardLayout from "layout/Dashboard";
import AdminUsersList from "./view/AdminUsersList";
import AdminUserCreate from "./entry/AdminUserCreate";
import AdminUserDetail from "./view/AdminUserDetail";
import AdminUserUpdate from "./entry/AdminUserUpdate";

const AdminUserRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/admin/users", element: <AdminUsersList /> },
    { path: "/admin/users/create", element: <AdminUserCreate/> },
    { path: "/admin/users/:id", element: <AdminUserDetail /> },
    { path: "/admin/users/:id/update", element: <AdminUserUpdate /> },
  ],
};

export default AdminUserRoutes;
