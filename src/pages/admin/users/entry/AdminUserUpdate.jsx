// src/pages/admin/users/entry/AdminUserUpdate.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";

const AdminUserUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    role: "customer",
    is_active: true,
    is_staff: false,
  });

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.USER_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setFormData({
        username: res.data?.username || "",
        phone: res.data?.phone || "",
        email: res.data?.email || "",
        role: res.data?.role || "customer",
        is_active: !!res.data?.is_active,
        is_staff: !!res.data?.is_staff,
      });
    } catch (e) {
      toast.error("Failed to load user");
      console.error(e?.response?.data || e);
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating...");

    try {
      await axios.patch(
        EndPoint.USER_UPDATE(id),
        {
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          role: formData.role,
          is_active: !!formData.is_active,
          is_staff: !!formData.is_staff,
        },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: "Updated ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
      navigate(-1);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail ||
        data?.error ||
        data?.username?.[0] ||
        data?.phone?.[0] ||
        data?.email?.[0] ||
        "Update failed";

      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, width: 560, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900}>
            Update User
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData((p) => ({ ...p, username: e.target.value }))
              }
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
            />

            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
            />

            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData((p) => ({ ...p, role: e.target.value }))
              }
            >
              <MenuItem value="customer">customer</MenuItem>
              <MenuItem value="owner">owner</MenuItem>
            </TextField>

            <TextField
              select
              label="is_active"
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData((p) => ({ ...p, is_active: e.target.value === "true" }))
              }
            >
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </TextField>

            <TextField
              select
              label="is_staff"
              value={formData.is_staff ? "true" : "false"}
              onChange={(e) =>
                setFormData((p) => ({ ...p, is_staff: e.target.value === "true" }))
              }
            >
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </TextField>

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

export default AdminUserUpdate;
