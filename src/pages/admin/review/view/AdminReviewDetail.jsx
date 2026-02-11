// src/pages/admin/review/view/AdminReviewDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Divider, Button, Stack } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const AdminReviewDetail = () => {
  const [review, setReview] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.ADMIN_REVIEW_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setReview(res.data);
    } catch (e) {
      toast.error("Failed to load review");
    }
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!review) return <Typography align="center" mt={5}>Loading...</Typography>;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Review Detail</Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            <TextField label="Business" value={review.business || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="User" value={review.username || review.user_id || "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Rating" value={review.rating ?? "-"} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Review" value={review.review || "-"} fullWidth multiline rows={4} InputProps={{ readOnly: true }} />
            <TextField label="Created At" value={review.created_at || "-"} fullWidth InputProps={{ readOnly: true }} />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="contained" onClick={() => navigate(`/admin/reviews/${review.id}/update`)}>Edit</Button>
          </Stack>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminReviewDetail;
