// src/pages/subscription/entry/SubscriptionBuy.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  FormControl, InputLabel, Select, MenuItem, Divider
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const SubscriptionBuy = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [businesses, setBusinesses] = useState([]);
  const [accounts, setAccounts] = useState([]); // if you have payment accounts endpoint later
  const [screenshot, setScreenshot] = useState(null);

  const [formData, setFormData] = useState({
    business: "",
    purchased_months: 1,
    payment_account: "",
    promo_code: "",
  });

  useEffect(() => {
    if (!access) navigate("/login");
    else loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    await fetchBusinesses();
    // await fetchPaymentAccounts(); // if you have endpoint
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setBusinesses(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load businesses");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Submitting...");

    if (!screenshot) {
      toast.update(tId, { render: "Payment screenshot is required", type: "error", isLoading: false, autoClose: 2500 });
      return;
    }

    const data = new FormData();
    data.append("business", formData.business);
    data.append("purchased_months", String(formData.purchased_months));
    data.append("payment_account", formData.payment_account);
    data.append("payment_screenshot", screenshot);
    if ((formData.promo_code || "").trim()) data.append("promo_code", formData.promo_code.trim());

    try {
      await axios.post(EndPoint.SUBSCRIPTIONS_BUY, data, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.update(tId, { render: "Submitted ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/subscriptions/list");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.promo_code?.[0] ||
        "Submit failed";

      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Buy Subscription</Typography>
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Business</InputLabel>
              <Select name="business" value={formData.business} label="Business" onChange={handleChange}>
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Purchased Months</InputLabel>
              <Select name="purchased_months" value={formData.purchased_months} label="Purchased Months" onChange={handleChange}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={12}>12</MenuItem>
              </Select>
            </FormControl>

            {/* If you already have payment accounts list endpoint, replace this with dropdown */}
            <TextField
              label="Payment Account ID"
              name="payment_account"
              required
              value={formData.payment_account}
              onChange={handleChange}
              placeholder="uuid..."
            />

            <TextField
              label="Promo Code (optional)"
              name="promo_code"
              value={formData.promo_code}
              onChange={handleChange}
            />

            <Stack spacing={1}>
              <Typography fontWeight={500}>Payment Screenshot (required)</Typography>
              <input accept="image/*" type="file" onChange={handleScreenshot} />
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" size="large">Submit</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default SubscriptionBuy;
