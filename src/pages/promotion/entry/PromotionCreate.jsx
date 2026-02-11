// src/pages/promotion/entry/PromotionCreate.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  Switch, FormControlLabel, Divider
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

// helper: convert input datetime-local => ISO string (UTC) or null
const toISO = (v) => (v ? new Date(v).toISOString() : null);

// helper: display datetime ISO => datetime-local value
// (not used in create, but keep same style)
const emptyPromo = {
  name: "",
  code: "",
  is_active: true,
  start_at: "",
  end_at: "",
  min_months: 1,
  bonus_months: 0,
  points_multiplier: "1.00",
};

const PromotionCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState(emptyPromo);

  useEffect(() => {
    if (!access) navigate("/login");
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // numeric fields
    if (["min_months", "bonus_months"].includes(name)) {
      setFormData((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleActive = (e) => setFormData((p) => ({ ...p, is_active: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Creating...");

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
      await axios.post(EndPoint.PROMOTION_CREATE, payload, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, { render: "Created ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/promotions/list");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Create failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Create Promotion</Typography>

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
              <Button type="submit" variant="contained" size="large">Create</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default PromotionCreate;
