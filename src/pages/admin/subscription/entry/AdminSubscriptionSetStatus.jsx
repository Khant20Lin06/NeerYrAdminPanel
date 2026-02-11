// src/pages/admin/subscription/entry/AdminSubscriptionSetStatus.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, Typography, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, TextField
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const AdminSubscriptionSetStatus = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("submitted");

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.SUBSCRIPTION_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setDetail(res.data);
      setStatus((res.data?.status || "submitted").toLowerCase());
    } catch (e) {
      toast.error("Failed to load subscription");
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating status...");

    try {
      await axios.patch(
        EndPoint.ADMIN_SUBSCRIPTION_SET_STATUS(id),
        { status },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate(-1);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Update failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  if (!detail) {
    return (
      <Typography align="center" mt={5}>
        Loading...
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Admin: Set Subscription Status</Typography>
          <Divider sx={{ mb: 3 }} />

          {/* quick read-only info */}
          <Stack spacing={2} mb={2}>
            <TextField label="Business" value={detail.business || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Purchased Months" value={detail.purchased_months ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Promo" value={detail.promotion_code || "-"} fullWidth InputProps={{ readOnly: true }} />
          </Stack>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="submitted">submitted</MenuItem>
                <MenuItem value="verified">verified</MenuItem>
                <MenuItem value="rejected">rejected</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" size="large">Update</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminSubscriptionSetStatus;
