import DashboardLayout from "layout/Dashboard";
import MyReviewList from "./view/MyReviewList";
import ReviewCreate from "./entry/ReviewCreate";

const ReviewRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/reviews/me", element: <MyReviewList /> },
    { path: "/reviews/create", element: <ReviewCreate /> },
  ],
};

export default ReviewRoutes;
