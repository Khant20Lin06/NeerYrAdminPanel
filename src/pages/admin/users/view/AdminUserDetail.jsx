// src/pages/admin/users/view/AdminUserDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, Stack, Button, Chip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";

const AdminUserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [row, setRow] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.USER_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setRow(res.data);
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

  if (!row) {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Paper elevation={3} sx={{ p: 4, width: 640, borderRadius: 3 }}>
            <Typography>Loading...</Typography>
          </Paper>
        </Box>
        <ToastContainer position="top-right" />
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, width: 720, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={900}>
              User Detail
            </Typography>
            <Chip label={row.role || "-"} variant="outlined" />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Typography><b>ID:</b> {row.id}</Typography>
            <Typography><b>Username:</b> {row.username || "-"}</Typography>
            <Typography><b>Phone:</b> {row.phone || "-"}</Typography>
            <Typography><b>Email:</b> {row.email || "-"}</Typography>
            <Typography><b>Role:</b> {row.role || "-"}</Typography>
            <Typography><b>Active:</b> {row.is_active ? "Yes" : "No"}</Typography>
            <Typography><b>Staff:</b> {row.is_staff ? "Yes" : "No"}</Typography>
            <Typography><b>Joined:</b> {row.date_joined || "-"}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button variant="contained" onClick={() => navigate(`/admin/users/${row.id}/update`)}>
              Update
            </Button>
          </Stack>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminUserDetail;
