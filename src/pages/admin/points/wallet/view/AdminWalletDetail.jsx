import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, Stack, Button, TextField } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../../api/endpoints";

const AdminWalletDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [row, setRow] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.ADMIN_WALLET_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setRow(res.data);
    } catch (e) {
      toast.error("Failed to load wallet");
      console.error(e?.response?.data || e);
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!row) return <Typography align="center" mt={5}>Loading...</Typography>;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 620, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900}>Wallet Detail</Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField label="Wallet ID" value={row.id || "-"} InputProps={{ readOnly: true }} />
            <TextField label="Owner ID" value={row.owner_id || "-"} InputProps={{ readOnly: true }} />
            <TextField label="Points Balance" value={row.points_balance ?? 0} InputProps={{ readOnly: true }} />
            <TextField label="Updated At" value={row.updated_at || "-"} InputProps={{ readOnly: true }} />
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="contained" onClick={() => navigate(`/admin/points/wallets/${row.id}/update`)}>
              Update
            </Button>
          </Stack>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminWalletDetail;
