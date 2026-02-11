import DashboardLayout from "layout/Dashboard";
import AdminWalletsList from "./wallet/view/AdminWalletsList";
import AdminWalletDetail from "./wallet/view/AdminWalletDetail";
import AdminWalletUpdate from "./wallet/entry/AdminWalletUpdate";
import AdminWalletDeleteButton from "./wallet/action/AdminWalletDeleteButton";

const AdminWalletsRoutes = {
  path: "/",
  element: <DashboardLayout />,
  children: [
    { path: "/admin/wallet", element: <AdminWalletsList /> },
    { path: "/admin/wallet/:id", element: <AdminWalletDetail /> },
    { path: "/admin/wallet/:id/update", element: <AdminWalletUpdate /> },
    { path: "/admin/wallet/:id", element: <AdminWalletDeleteButton /> },
  ],
};

export default AdminWalletsRoutes;
