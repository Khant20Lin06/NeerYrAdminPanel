import DashboardLayout from "layout/Dashboard";
import AdminPaymentAccountsList from "./view/AdminPaymentAccountsList";
import AdminPaymentAccountDetail from "./view/AdminPaymentAccountDetail";
import AdminPaymentAccountCreate from "./entry/AdminPaymentAccountCreate";
import AdminPaymentAccountUpdate from "./entry/AdminPaymentAccountUpdate";

const AdminPaymentAccountsRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/admin/payment-accounts", element: <AdminPaymentAccountsList /> },
    { path: "/admin/payment-accounts/:id", element: <AdminPaymentAccountDetail /> },
    { path: "/admin/payment-accounts/create", element: <AdminPaymentAccountCreate /> },
    { path: "/admin/payment-accounts/update/:id", element: <AdminPaymentAccountUpdate /> },
  ],
};

export default AdminPaymentAccountsRoutes;
