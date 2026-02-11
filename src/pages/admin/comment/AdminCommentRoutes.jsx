import DashboardLayout from "layout/Dashboard";
import AdminCommentsList from "./view/AdminCommentsList";

const AdminCommentRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/admin/comments", element: <AdminCommentsList /> },
  ],
};

export default AdminCommentRoutes;
