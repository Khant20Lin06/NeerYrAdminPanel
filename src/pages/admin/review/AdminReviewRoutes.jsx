import DashboardLayout from "layout/Dashboard";
import AdminReviewList from "./view/AdminReviewList";
import AdminReviewDetail from "./view/AdminReviewDetail";
import AdminReviewUpdate from "./entry/AdminReviewUpdate";

const AdminReviewRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/admin/reviews", element: <AdminReviewList /> },
    { path: "/admin/reviews/:id", element: <AdminReviewDetail /> },
    { path: "/admin/reviews/:id/update", element: <AdminReviewUpdate /> },
  ],
};

export default AdminReviewRoutes;
