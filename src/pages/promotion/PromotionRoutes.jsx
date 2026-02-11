import DashboardLayout from "layout/Dashboard";
import PromotionList from "./view/PromotionList";
import PromotionCreate from "./entry/PromotionCreate";
import PromotionDetail from "./view/PromotionDetail";
import PromotionUpdate from "./entry/PromotionUpdate";

const PromotionRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/promotions/list", element: <PromotionList /> },
    { path: "/promotion/create", element: <PromotionCreate /> },
    { path: "/promotion/detail/:id", element: <PromotionDetail /> },
    { path: "/promotion/update/:id", element: <PromotionUpdate /> },
  ],
};

export default PromotionRoutes;
