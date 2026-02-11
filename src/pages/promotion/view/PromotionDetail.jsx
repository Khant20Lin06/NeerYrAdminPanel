// src/pages/promotion/view/PromotionDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Divider, Button, Stack, Chip } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";

const PromotionDetail = () => {
  const [promo, setPromo] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchDetail = async () => {
    const res = await axios.get(EndPoint.PROMOTION_DETAIL(id), {
      headers: { Authorization: `Bearer ${access}` },
    });
    setPromo(res.data);
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!promo) return <Typography align="center" mt={5}>Loading...</Typography>;

  const now = new Date();
  const start = promo.start_at ? new Date(promo.start_at) : null;
  const end = promo.end_at ? new Date(promo.end_at) : null;

  const inWindow =
    (!start || start <= now) &&
    (!end || end >= now);

  const label = promo.is_active
    ? (inWindow ? "active" : "scheduled/expired")
    : "inactive";

  const chipColor = promo.is_active
    ? (inWindow ? "success" : "warning")
    : "default";

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, width: 520 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Promotion Detail</Typography>
          <Chip label={label} color={chipColor} />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <TextField label="Name" value={promo.name || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Code" value={promo.code || "-"} fullWidth InputProps={{ readOnly: true }} />

          <TextField label="Start At" value={promo.start_at || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="End At" value={promo.end_at || "-"} fullWidth InputProps={{ readOnly: true }} />

          <TextField label="Min Months" value={promo.min_months ?? 1} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Bonus Months" value={promo.bonus_months ?? 0} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Points Multiplier" value={promo.points_multiplier ?? 1} fullWidth InputProps={{ readOnly: true }} />

          <TextField label="Created At" value={promo.created_at || "-"} fullWidth InputProps={{ readOnly: true }} />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/promotions/update/${promo.id}`)}>Edit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PromotionDetail;
