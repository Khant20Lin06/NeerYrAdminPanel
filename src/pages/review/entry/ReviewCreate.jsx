// src/pages/review/entry/ReviewCreate.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack, FormControl, InputLabel, Select, MenuItem, Rating
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const ReviewCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    business: "",
    rating: 5,
    review: "",
  });

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    fetchBusinesses();
    // eslint-disable-next-line
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.data || []);
      setBusinesses(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load businesses");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Submitting...");

    try {
      await axios.post(EndPoint.REVIEW_CREATE, {
        business: formData.business,
        rating: Number(formData.rating),
        review: formData.review || "",
      }, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, { render: "Submitted ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate(-1);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "object" ? "Validation error" : "") ||
        "Submit failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>
            Write Review
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Business</InputLabel>
              <Select name="business" value={formData.business} label="Business" onChange={handleChange}>
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={0.5}>
              <Typography fontWeight={500}>Rating</Typography>
              <Rating
                value={Number(formData.rating)}
                onChange={(_, v) => setFormData((p) => ({ ...p, rating: v || 1 }))}
              />
            </Stack>

            <TextField
              label="Review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              multiline
              rows={4}
            />

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

export default ReviewCreate;
