// src/pages/admin/paymentAccount/entry/AdminPaymentAccountUpdate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, TextField, Button, Stack, Switch, FormControlLabel } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const AdminPaymentAccountUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    order: 0,
    is_active: true,
  });

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.PAYMENT_ACCOUNT_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setFormData({
        bank_name: res.data?.bank_name || "",
        account_name: res.data?.account_name || "",
        account_number: res.data?.account_number || "",
        order: res.data?.order ?? 0,
        is_active: !!res.data?.is_active,
      });
    } catch (e) {
      toast.error("Failed to load payment account");
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bank_name: formData.bank_name.trim(),
      account_name: formData.account_name.trim(),
      account_number: formData.account_number.trim(),
      order: Number(formData.order || 0),
      is_active: Boolean(formData.is_active),
    };

    const tId = toast.loading("Updating...");
    try {
      await axios.patch(EndPoint.PAYMENT_ACCOUNT_UPDATE(id), payload, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/admin/payment-accounts");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail ||
        data?.error ||
        data?.bank_name?.[0] ||
        data?.account_name?.[0] ||
        data?.account_number?.[0] ||
        "Update failed";

      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={2} sx={{ p: 4, width: 560, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900}>
            Update Payment Account
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Bank Name"
              required
              value={formData.bank_name}
              onChange={(e) => setFormData((p) => ({ ...p, bank_name: e.target.value }))}
            />

            <TextField
              label="Account Name"
              required
              value={formData.account_name}
              onChange={(e) => setFormData((p) => ({ ...p, account_name: e.target.value }))}
            />

            <TextField
              label="Account Number"
              required
              value={formData.account_number}
              onChange={(e) => setFormData((p) => ({ ...p, account_number: e.target.value }))}
            />

            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData((p) => ({ ...p, order: e.target.value }))}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!!formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                />
              }
              label={formData.is_active ? "Active" : "Inactive"}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="large">
                Update
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminPaymentAccountUpdate;
