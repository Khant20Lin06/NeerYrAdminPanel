// src/pages/admin/review/entry/AdminReviewUpdate.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Rating,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const clampRating = (v) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(5, Math.max(1, n));
};

const AdminReviewUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [formData, setFormData] = useState({
    rating: 5,
    review: "",
  });

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.ADMIN_REVIEW_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });

      setFormData({
        rating: clampRating(res.data?.rating ?? 5),
        review: res.data?.review || "",
      });
    } catch (e) {
      toast.error("Failed to load review");
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

    const payload = {
      rating: clampRating(formData.rating),
      review: formData.review || "",
    };

    try {
      await axios.patch(EndPoint.ADMIN_REVIEW_UPDATE(id), payload, {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, {
        render: "Updated ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
      navigate(-1);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.rating?.[0] ||
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
            Update Review
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Stack spacing={0.5}>
              <Typography fontWeight={500}>Rating</Typography>
              <Rating
                value={clampRating(formData.rating)}
                precision={1}
                onChange={(_, v) =>
                  setFormData((p) => ({ ...p, rating: clampRating(v) }))
                }
              />
              <Typography variant="caption" color="text.secondary">
                Rating must be between 1 and 5
              </Typography>
            </Stack>

            <TextField
              label="Review"
              value={formData.review}
              onChange={(e) =>
                setFormData((p) => ({ ...p, review: e.target.value }))
              }
              multiline
              rows={4}
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

export default AdminReviewUpdate;
