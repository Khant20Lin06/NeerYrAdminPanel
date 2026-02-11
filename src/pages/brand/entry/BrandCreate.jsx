import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography,
  Stack, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const BrandCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    business: "",
    branch_name: "",
    address: "",
    phone: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchBusinesses();
    // eslint-disable-next-line
  }, []);

  const fetchBusinesses = async () => {
    // 🔥 choose correct endpoint for business list (example: /api/api/businesses)
    const res = await axios.get(EndPoint.BUSINESSES_LIST, {
      headers: { Authorization: `Bearer ${access}` }
    });
    const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    setBusinesses(list);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleActive = (e) =>
    setFormData((p) => ({ ...p, is_active: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Creating...");

    try {
      await axios.post(EndPoint.BRANCHES_CREATE, formData, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, { render: "Created ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/brands/list");
    } catch (err) {
      const msg = err?.response?.data?.error || "Create failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Create Branch</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Business</InputLabel>
              <Select name="business" value={formData.business} label="Business" onChange={handleChange}>
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Branch Name" name="branch_name" required value={formData.branch_name} onChange={handleChange} />
            <TextField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />

            <FormControlLabel control={<Switch checked={formData.is_active} onChange={handleActive} />} label="Active" />

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" size="large">Create</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default BrandCreate;
