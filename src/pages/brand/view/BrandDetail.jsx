import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";

const BrandDetail = () => {
  const [branch, setBranch] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const fetchBranch = async () => {
    const res = await axios.get(EndPoint.BRANCH_DETAIL(id), {
      headers: { Authorization: `Bearer ${access}` },
    });
    setBranch(res.data);
  };

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchBranch();
    // eslint-disable-next-line
  }, [id]);

  if (!branch) {
    return (
      <Typography align="center" mt={5}>
        Loading...
      </Typography>
    );
  }

  // ✅ Business display helper (backend returns object or id)
  const businessName =
    branch?.business?.name ||
    branch?.business_name ||
    (typeof branch?.business === "string" ? branch.business : "") ||
    "-";

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, width: 520 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Branch Detail</Typography>
          <Chip
            label={branch.is_active ? "active" : "inactive"}
            color={branch.is_active ? "success" : "default"}
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Info (BrandCreate design style) */}
        <Stack spacing={2}>
          <TextField
            label="Business"
            value={businessName}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Branch Name"
            value={branch.branch_name || ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Address"
            value={branch.address || "-"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Phone"
            value={branch.phone || "-"}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Description"
            value={branch.description || "-"}
            fullWidth
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="contained" onClick={() => navigate(`/brand/update/${branch.id}`)}>
            Edit
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BrandDetail;
