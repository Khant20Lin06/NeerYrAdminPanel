// src/pages/category/view/CategoryDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Divider, Button, Stack, Chip, Avatar } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { imgUrl } from "../_helpers";

const CategoryDetail = () => {
  const [cat, setCat] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchDetail = async () => {
    const res = await axios.get(EndPoint.CATEGORY_DETAIL(id), {
      headers: { Authorization: `Bearer ${access}` },
    });
    setCat(res.data);
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!cat) return <Typography align="center" mt={5}>Loading...</Typography>;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, width: 520 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Category Detail</Typography>
          <Chip label={cat.is_active ? "active" : "inactive"} color={cat.is_active ? "success" : "default"} />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2} alignItems="center" mb={2}>
          <Avatar
            src={imgUrl(cat.image, cat.image_url)}
            variant="rounded"
            sx={{ width: 220, height: 220, boxShadow: 2 }}
          />
          <Typography variant="caption">Category Image</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <TextField label="Name" value={cat.name || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Slug" value={cat.slug || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Order" value={cat.order ?? 0} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Created" value={cat.created_at || "-"} fullWidth InputProps={{ readOnly: true }} />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/categories/update/${cat.id}`)}>Edit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CategoryDetail;
