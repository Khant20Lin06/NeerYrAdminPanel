import DashboardLayout from "layout/Dashboard";
import SubscriptionList from "./view/SubscriptionList";
import SubscriptionDetail from "./view/SubscriptionDetail";
import SubscriptionBuy from "./entry/SubscriptionBuy";
import AdminSubscriptionSetStatus from "../admin/subscription/entry/AdminSubscriptionSetStatus";

const SubscriptionRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/subscriptions/list", element: <SubscriptionList /> },
    { path: "/subscriptions/detail/:id", element: <SubscriptionDetail /> },
    { path: "/subscriptions/buy", element: <SubscriptionBuy /> },
    { path: "/admin/subscriptions/status/:id", element: <AdminSubscriptionSetStatus /> },
  ],
};

export default SubscriptionRoutes;
