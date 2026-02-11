// src/pages/comment/view/CommentsPublicList.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Chip,
  Avatar,
  Skeleton,
  InputAdornment,
} from "@mui/material";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const safeList = (data) => {
  const list = Array.isArray(data)
    ? data
    : data?.results || data?.data || data?.items || [];
  return Array.isArray(list) ? list : [];
};

const fmtDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const initials = (name) => {
  const s = (name || "").trim();
  if (!s) return "?";
  const parts = s.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase() || s[0].toUpperCase();
};

const CommentsPublicList = () => {
  const [businessId, setBusinessId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const countLabel = useMemo(() => `${rows.length} comment(s)`, [rows.length]);

  const fetchList = async () => {
    const bid = businessId.trim();
    if (!bid) {
      toast.warn("Business ID ထည့်ပေးပါ");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(EndPoint.COMMENTS_PUBLIC_LIST, {
        params: { business: bid },
      });

      setRows(safeList(res.data));
    } catch (e) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") fetchList();
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper
          elevation={2}
          sx={{
            width: 900,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.2,
              bgcolor: "background.paper",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Public Comments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter a Business ID and load comments.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={countLabel} variant="outlined" />
                {loading && <Chip label="Loading..." color="primary" variant="outlined" />}
              </Stack>
            </Stack>

            {/* Search Bar */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <TextField
                label="Business ID"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                onKeyDown={onEnter}
                fullWidth
                placeholder="e.g. 9b3b1c2e-...."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="caption" color="text.secondary">
                        ID
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={fetchList}
                disabled={loading}
                sx={{ minWidth: 160, height: 56 }}
              >
                {loading ? "Loading..." : "Load"}
              </Button>
            </Stack>
          </Box>

          {/* Body */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Stack spacing={1.5}>
                {[1, 2, 3].map((i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" />
                        <Skeleton width="25%" />
                      </Box>
                    </Stack>
                    <Skeleton sx={{ mt: 1.5 }} height={22} />
                    <Skeleton height={22} />
                  </Paper>
                ))}
              </Stack>
            ) : rows.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed rgba(0,0,0,0.18)",
                }}
              >
                <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                  No comments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Business ID ထည့်ပြီး Load ကိုနှိပ်ပါ။
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {rows.map((c) => (
                  <Paper
                    key={c.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      transition: "0.15s",
                      "&:hover": {
                        boxShadow: 2,
                        borderColor: "rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ width: 42, height: 42 }}>
                        {initials(c.username)}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ sm: "center" }}
                        >
                          <Typography fontWeight={900} noWrap>
                            {c.username || "Unknown"}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {fmtDateTime(c.created_at)}
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.2 }} />

                        <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                          {c.comment}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default CommentsPublicList;
