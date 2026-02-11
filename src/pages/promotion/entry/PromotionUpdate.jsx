// src/pages/promotion/entry/PromotionUpdate.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  Switch, FormControlLabel, Divider
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const toISO = (v) => (v ? new Date(v).toISOString() : null);

// ISO => datetime-local string (YYYY-MM-DDTHH:mm)
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const PromotionUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    is_active: true,
    start_at: "",
    end_at: "",
    min_months: 1,
    bonus_months: 0,
    points_multiplier: "1.00",
  });

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.PROMOTION_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      const p = res.data;

      setFormData({
        name: p.name || "",
        code: p.code || "",
        is_active: p.is_active ?? true,
        start_at: toLocalInput(p.start_at),
        end_at: toLocalInput(p.end_at),
        min_months: p.min_months ?? 1,
        bonus_months: p.bonus_months ?? 0,
        points_multiplier: String(p.points_multiplier ?? "1.00"),
      });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to load promotion";
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["min_months", "bonus_months"].includes(name)) {
      setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleActive = (e) => setFormData((p) => ({ ...p, is_active: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating...");

    const payload = {
      name: formData.name,
      code: formData.code,
      is_active: !!formData.is_active,
      start_at: formData.start_at ? toISO(formData.start_at) : null,
      end_at: formData.end_at ? toISO(formData.end_at) : null,
      min_months: Number(formData.min_months || 1),
      bonus_months: Number(formData.bonus_months || 0),
      points_multiplier: String(formData.points_multiplier || "1.00"),
    };

    try {
      await axios.patch(EndPoint.PROMOTION_UPDATE(id), payload, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/promotions/list");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Update failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Update Promotion</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name" name="name" required value={formData.name} onChange={handleChange} />
            <TextField label="Code" name="code" required value={formData.code} onChange={handleChange} />

            <FormControlLabel
              control={<Switch checked={!!formData.is_active} onChange={handleActive} />}
              label="Active"
            />

            <Divider />

            <TextField
              label="Start At"
              name="start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End At"
              name="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <Divider />

            <TextField
              label="Min Months"
              name="min_months"
              type="number"
              value={formData.min_months}
              onChange={handleChange}
            />

            <TextField
              label="Bonus Months"
              name="bonus_months"
              type="number"
              value={formData.bonus_months}
              onChange={handleChange}
            />

            <TextField
              label="Points Multiplier"
              name="points_multiplier"
              value={formData.points_multiplier}
              onChange={handleChange}
              helperText="Example: 1.00 / 2.00"
            />

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

export default PromotionUpdate;
