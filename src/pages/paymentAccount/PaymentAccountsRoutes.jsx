import DashboardLayout from "layout/Dashboard";
import PaymentAccountsPublicList from "./view/PaymentAccountsPublicList";

const PaymentAccountsRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "payment-accounts", element: <PaymentAccountsPublicList /> },
  ],
};

export default PaymentAccountsRoutes;
