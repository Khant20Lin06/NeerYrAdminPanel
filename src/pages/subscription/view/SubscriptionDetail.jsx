// src/pages/subscription/view/SubscriptionDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Divider, Button, Stack, Chip
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const chipColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "verified") return "success";
  if (v === "rejected") return "error";
  return "default";
};

const SubscriptionDetail = () => {
  const [sub, setSub] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.SUBSCRIPTION_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setSub(res.data);
    } catch (e) {
      toast.error("Failed to load subscription");
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!sub) {
    return (
      <Typography align="center" mt={5}>
        Loading...
      </Typography>
    );
  }

  const status = (sub.status || "submitted").toLowerCase();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Subscription Detail</Typography>
            <Chip label={status} color={chipColor(status)} />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <TextField label="Business" value={sub.business || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Purchased Months" value={sub.purchased_months ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Bonus Months" value={sub.bonus_months ?? 0} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Total Months Added" value={sub.total_months_added ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Amount (MMKs)" value={sub.amount_mmks ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Promotion" value={sub.promotion_code || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Points Earned" value={sub.points_earned ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Created At" value={sub.created_at || "-"} fullWidth InputProps={{ readOnly: true }} />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="contained" onClick={() => navigate(`/admin/subscriptions/status/${sub.id}`)}>
              Admin: Set Status
            </Button>
          </Stack>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default SubscriptionDetail;
