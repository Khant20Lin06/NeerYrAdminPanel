import DashboardLayout from "layout/Dashboard";
import CommentsPublicList from "./view/CommentsPublicList";
import CommentCreate from "./entry/CommentCreate";

const CommentRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/comments/public", element: <CommentsPublicList /> },
    { path: "/comments/create", element: <CommentCreate /> },
  ],
};

export default CommentRoutes;
