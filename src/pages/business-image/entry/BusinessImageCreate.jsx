// src/pages/business-image/entry/BusinessImageCreate.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import { imgUrl, PLACEHOLDER } from "../_helpers";

const BusinessImageCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [businesses, setBusinesses] = useState([]);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    business: "",
    caption: "",
    order: 0,
    image: null,
  });

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchBusinesses();
    // eslint-disable-next-line
  }, []);

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
    if (name === "order") {
      setFormData((p) => ({ ...p, order: value === "" ? 0 : Number(value) }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Creating...");

    if (!formData.business) {
      toast.update(tId, { render: "Business is required", type: "error", isLoading: false, autoClose: 2000 });
      return;
    }
    if (!formData.image) {
      toast.update(tId, { render: "Image is required", type: "error", isLoading: false, autoClose: 2000 });
      return;
    }

    const data = new FormData();
    data.append("business", formData.business);
    data.append("caption", formData.caption || "");
    data.append("order", String(formData.order ?? 0));
    data.append("image", formData.image);

    try {
      await axios.post(EndPoint.BUSINESS_IMAGES_CREATE, data, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.update(tId, { render: "Created ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/business-images/list");
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
          <Typography variant="h6" gutterBottom>
            Create Business Image
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

            <TextField label="Caption" name="caption" value={formData.caption} onChange={handleChange} />
            <TextField label="Order" name="order" type="number" value={formData.order} onChange={handleChange} />

            <Divider />

            <Stack spacing={1}>
              <Typography fontWeight={500}>Image</Typography>
              <Avatar
                src={preview ? preview : PLACEHOLDER}
                variant="rounded"
                sx={{ width: 140, height: 140, boxShadow: 2 }}
              />
              <input hidden accept="image/*" type="file" id="upload-image" onChange={handleImage} />
              <label htmlFor="upload-image">
                <Button variant="outlined" component="span">
                  Upload Image
                </Button>
              </label>
            </Stack>

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

export default BusinessImageCreate;
