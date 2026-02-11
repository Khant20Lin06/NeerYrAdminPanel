import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const BrandUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
    if (!access) {
      navigate("/login");
      return;
    }
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    await fetchBusinesses();
    await fetchBranchDetail();
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setBusinesses(list);
    } catch (err) {
      toast.error("Failed to load businesses");
    }
  };

  const fetchBranchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.BRANCH_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });

      const b = res.data;

      setFormData({
        business: b.business || b.business_id || "",
        branch_name: b.branch_name || "",
        address: b.address || "",
        phone: b.phone || "",
        description: b.description || "",
        is_active: b.is_active ?? true,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to load branch";
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleActive = (e) =>
    setFormData((p) => ({ ...p, is_active: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating...");

    try {
      // ✅ send JSON like BrandCreate
      await axios.patch(EndPoint.BRANCH_UPDATE(id), formData, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, {
        render: "Updated ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });

      navigate("/brands/list");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Update failed";
      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>
            Update Branch
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Business</InputLabel>
              <Select
                name="business"
                value={formData.business}
                label="Business"
                onChange={handleChange}
              >
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Branch Name"
              name="branch_name"
              required
              value={formData.branch_name}
              onChange={handleChange}
            />

            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Switch checked={formData.is_active} onChange={handleActive} />
              }
              label="Active"
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

export default BrandUpdate;
