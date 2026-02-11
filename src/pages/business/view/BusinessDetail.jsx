// src/pages/business/view/BusinessDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Button,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint, API_BASE_URL } from "../../../api/endpoints";

const PLACEHOLDER = "/placeholder.png";

const safeImg = (img) => {
  if (!img) return PLACEHOLDER;
  if (typeof img !== "string") return PLACEHOLDER;
  if (img.startsWith("http")) return img;
  return `${API_BASE_URL}${img}`;
};

const fmt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

const BusinessDetail = () => {
  const [business, setBusiness] = useState(null);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    await fetchCategories();
    await fetchBusiness();
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(EndPoint.CATEGORIES_PUBLIC_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data?.results || data?.data || data?.items || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (e) {
      // category name မပြနိုင်ရင်လည်း detail ပြလို့ရအောင် silent
      setCategories([]);
    }
  };

  const fetchBusiness = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESS_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      setBusiness(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to load business";
      toast?.error?.(msg);
      console.error(err?.response?.data || err);
    }
  };

  const categoryName = useMemo(() => {
    if (!business?.category) return "-";
    const c = categories.find((x) => x.id === business.category);
    return c?.name || "-";
  }, [categories, business?.category]);

  if (!business) {
    return (
      <Typography align="center" mt={5}>
        Loading...
      </Typography>
    );
  }

  const status = (business.status || "draft").toLowerCase();
  const chipColor =
    status === "active" ? "success" : status === "suspended" ? "warning" : "default";

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, width: 520 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Business Detail</Typography>
          <Chip label={status} color={chipColor} />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Images */}
        <Stack spacing={2} mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={safeImg(business.logo)}
              variant="rounded"
              sx={{ width: 84, height: 84, boxShadow: 2 }}
            />
            <Typography fontWeight={600}>Logo</Typography>
          </Stack>

          <Box
            component="img"
            src={safeImg(business.cover_image)}
            alt="cover"
            sx={{
              width: "100%",
              height: 160,
              objectFit: "cover",
              borderRadius: 2,
              boxShadow: 2,
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <Typography variant="caption">Cover Image</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Info */}
        <Stack spacing={2}>
          <TextField
            label="Category"
            value={categoryName}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Name"
            value={business.name || ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Description"
            value={business.description || "-"}
            fullWidth
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Paid Until"
            value={fmt(business.paid_until)}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Remaining Days"
            value={business.remaining_days ?? "-"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Subscription Active"
            value={business.is_subscription_active ? "Yes" : "No"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Created At"
            value={fmt(business.created_at)}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="contained" onClick={() => navigate(`/business/update/${business.id}`)}>
            Edit
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BusinessDetail;
