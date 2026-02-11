import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import { EndPoint } from "../../../../../api/endpoints";

const AdminWalletDeleteButton = ({ walletId, access, onDeleted }) => {
  const handleDelete = async () => {
    const ok = window.confirm("Delete this wallet?");
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.ADMIN_WALLET_DELETE(walletId), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      onDeleted?.();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(e?.response?.data || e);
    }
  };

  return (
    <Button color="error" variant="outlined" onClick={handleDelete}>
      Delete
    </Button>
  );
};

export default AdminWalletDeleteButton;
