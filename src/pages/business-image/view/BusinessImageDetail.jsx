// src/pages/business-image/view/BusinessImageDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Divider, Button, Stack, Avatar
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { imgUrl, PLACEHOLDER } from "../_helpers";

const BusinessImageDetail = () => {
  const [item, setItem] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchDetail = async () => {
    const res = await axios.get(EndPoint.BUSINESS_IMAGE_DETAIL(id), {
      headers: { Authorization: `Bearer ${access}` },
    });
    setItem(res.data);
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  if (!item) {
    return <Typography align="center" mt={5}>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, width: 520 }}>
        <Typography variant="h6" gutterBottom>
          Business Image Detail
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2} mb={2} alignItems="center">
          <Avatar
            src={imgUrl(item.image)}
            variant="rounded"
            sx={{ width: 220, height: 220, boxShadow: 2 }}
          />
          <Typography variant="caption">Image Preview</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <TextField label="Business" value={item.business || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Caption" value={item.caption || "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Order" value={item.order ?? "-"} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Created At" value={item.created_at || "-"} fullWidth InputProps={{ readOnly: true }} />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/business-images/update/${item.id}`)}>
            Edit
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BusinessImageDetail;
