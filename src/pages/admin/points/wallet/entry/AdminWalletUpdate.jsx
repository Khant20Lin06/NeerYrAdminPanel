import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, Stack, TextField, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../../api/endpoints";

const AdminWalletUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [pointsBalance, setPointsBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.ADMIN_WALLET_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setPointsBalance(String(res.data?.points_balance ?? 0));
    } catch (e) {
      toast.error("Failed to load wallet");
      console.error(e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = Number(pointsBalance);
    if (!Number.isFinite(v) || v < 0) {
      toast.warn("points_balance must be 0 or more");
      return;
    }

    const tId = toast.loading("Updating...");
    try {
      await axios.patch(
        EndPoint.ADMIN_WALLET_UPDATE(id),
        { points_balance: v },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate(-1);
    } catch (err) {
      const msg =
        err?.response?.data?.points_balance?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Update failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 620, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900}>Update Wallet</Typography>
          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Points Balance"
                value={pointsBalance}
                onChange={(e) => setPointsBalance(e.target.value)}
                type="number"
                inputProps={{ min: 0 }}
                disabled={loading}
                required
              />

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" variant="contained" size="large">Update</Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminWalletUpdate;
