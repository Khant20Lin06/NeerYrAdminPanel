import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const AdminCommentList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  // MUST provide businessId because public endpoint requires it
  const [businessId, setBusinessId] = useState("");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((r) => {
      const comment = (r.comment || "").toLowerCase();
      const username = (r.username || "").toLowerCase();
      return comment.includes(keyword) || username.includes(keyword);
    });
  }, [rows, q]);

  const canBulkDelete = selectedIds.length > 0;

  useEffect(() => {
    if (!access) navigate("/login");
    // eslint-disable-next-line
  }, [navigate]);

  useEffect(() => {
    // reset selection when list changes
    setSelectedIds([]);
    setSelectAll(false);
  }, [rows, q]);

  const fetchComments = async () => {
    const bid = businessId.trim();
    if (!bid) {
      toast.warn("Business ID ထည့်ပေးပါ (required)");
      return;
    }

    setLoading(true);
    try {
      // Using public endpoint since we only have 4 endpoints
      const res = await axios.get(EndPoint.COMMENTS_PUBLIC_LIST, {
        params: { business: bid },
      });

      const data = res.data;
      const list = Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.response?.data?.business ||
        "Failed to load comments";
      toast.error(typeof msg === "string" ? msg : "Failed to load comments");
      console.error(err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const toggleAllVisible = (checked) => {
    setSelectAll(checked);
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    const ids = filteredRows.map((r) => r.id);
    setSelectedIds(ids);
  };

  const handleBulkDeleteSelected = async () => {
    if (!canBulkDelete) return;

    const tId = toast.loading("Deleting selected...");
    try {
      await axios.post(
        EndPoint.ADMIN_COMMENTS_BULK_DELETE,
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: `Deleted ✅ (${selectedIds.length})`,
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });

      // refresh list
      await fetchComments();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Bulk delete failed";
      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err?.response?.data || err);
    }
  };

  const handleBulkDeleteAll = async () => {
    const tId = toast.loading("Deleting ALL comments...");
    try {
      await axios.post(
        EndPoint.ADMIN_COMMENTS_BULK_DELETE,
        { all: true },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: "All comments deleted ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });

      await fetchComments();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Bulk delete failed";
      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(err?.response?.data || err);
    }
  };

  const handleDeleteOne = async (id) => {
    const tId = toast.loading("Deleting...");
    try {
      // If admin deletes a single one: we CAN use normal delete endpoint
      await axios.delete(EndPoint.COMMENT_DELETE(id), {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, {
        render: "Deleted ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });

      await fetchComments();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Delete failed";
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={3} sx={{ p: 3, width: "min(1100px, 100%)", borderRadius: 3 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Admin Comments
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                List by Business ID + bulk delete (selected/all)
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Refresh">
                <span>
                  <IconButton onClick={fetchComments} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Button
                variant="outlined"
                color="error"
                disabled={!canBulkDelete}
                onClick={handleBulkDeleteSelected}
              >
                Delete Selected
              </Button>

              <Button variant="contained" color="error" onClick={handleBulkDeleteAll}>
                Delete All
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Filters */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Business ID (required)"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              fullWidth
              placeholder="e.g. 5a79fd00-...."
            />

            <TextField
              label="Search (comment/username)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
              placeholder="type keyword..."
            />

            <Button
              variant="contained"
              onClick={fetchComments}
              disabled={loading}
              sx={{ minWidth: 160 }}
            >
              {loading ? "Loading..." : "Load"}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Selection summary */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              label={`Total: ${rows.length}`}
              variant="outlined"
            />
            <Chip
              label={`Visible: ${filteredRows.length}`}
              variant="outlined"
            />
            <Chip
              label={`Selected: ${selectedIds.length}`}
              color={selectedIds.length ? "primary" : "default"}
              variant={selectedIds.length ? "filled" : "outlined"}
            />
            <FormControlLabel
              sx={{ ml: "auto" }}
              control={
                <Checkbox
                  checked={selectAll && filteredRows.length > 0}
                  onChange={(e) => toggleAllVisible(e.target.checked)}
                />
              }
              label="Select all (visible)"
            />
          </Stack>

          {/* Table */}
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell width={180}>User</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell width={190}>Created</TableCell>
                  <TableCell width={80} align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.map((r) => {
                  const checked = selectedIds.includes(r.id);
                  return (
                    <TableRow key={r.id} hover selected={checked}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={checked} onChange={() => toggleOne(r.id)} />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600}>{r.username || "-"}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {r.user_id || ""}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {r.comment || ""}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>
                          {r.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDeleteOne(r.id)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography align="center" sx={{ py: 3, opacity: 0.7 }}>
                        No comments
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminCommentList;
