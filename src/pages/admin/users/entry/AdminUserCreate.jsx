// src/pages/admin/users/entry/AdminUserCreate.jsx
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
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";

const AdminUserCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    role: "customer",
  });

  useEffect(() => {
    if (!access) navigate("/login");
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Creating...");

    try {
      await axios.post(
        EndPoint.USERS_CREATE,
        {
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          password: formData.password,
          role: formData.role,
        },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: "Created ✅",
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
        data?.password?.[0] ||
        "Create failed";

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
            Create User (Admin)
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Username"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData((p) => ({ ...p, username: e.target.value }))
              }
            />

            <TextField
              label="Phone"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
            />

            <TextField
              label="Email (optional)"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
            />

            <TextField
              label="Password"
              required
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((p) => ({ ...p, password: e.target.value }))
              }
              helperText="min 6 chars"
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

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="large">
                Create
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminUserCreate;
