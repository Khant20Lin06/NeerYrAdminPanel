// src/pages/admin/paymentAccount/view/AdminPaymentAccountDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, TextField, Button, Stack, Chip } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const AdminPaymentAccountDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [row, setRow] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.PAYMENT_ACCOUNT_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setRow(res.data);
    } catch (e) {
      toast.error("Failed to load payment account");
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!row) {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Typography>Loading...</Typography>
        </Box>
        <ToastContainer position="top-right" />
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={2} sx={{ p: 4, width: 560, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={900}>
              Payment Account Detail
            </Typography>
            <Chip
              label={row.is_active ? "Active" : "Inactive"}
              color={row.is_active ? "success" : "default"}
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField label="Bank Name" value={row.bank_name || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Account Name" value={row.account_name || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField
              label="Account Number"
              value={row.account_number || "-"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField label="Order" value={row.order ?? 0} fullWidth InputProps={{ readOnly: true }} />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button variant="contained" onClick={() => navigate(`/admin/payment-accounts/update/${row.id}`)}>
              Edit
            </Button>
          </Stack>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminPaymentAccountDetail;
