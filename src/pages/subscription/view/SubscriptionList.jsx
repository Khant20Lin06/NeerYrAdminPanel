// src/pages/subscription/view/SubscriptionList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Modal, Card, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, Checkbox
} from "@mui/material";
import { DeleteTwoTone, InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const statusColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "verified") return "success.main";
  if (v === "rejected") return "error.main";
  return "text.secondary"; // submitted
};

const SubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [businessId, setBusinessId] = useState("");

  // bulk selection
  const [selected, setSelected] = useState([]);

  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchList();
    // eslint-disable-next-line
  }, []);

  const fetchList = async () => {
    try {
      const res = await axios.get(EndPoint.SUBSCRIPTIONS_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: {
          q: q || undefined,
          status: status || undefined,
          business: businessId || undefined,
        },
      });

      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setRows(Array.isArray(list) ? list : []);
      setSelected([]);
    } catch (e) {
      toast.error("Failed to load subscriptions");
    }
  };

  const allChecked = useMemo(() => rows.length > 0 && selected.length === rows.length, [rows, selected]);
  const indeterminate = useMemo(() => selected.length > 0 && selected.length < rows.length, [rows, selected]);

  const toggleSelectAll = (checked) => {
    if (checked) setSelected(rows.map((r) => r.id));
    else setSelected([]);
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    // NOTE: Owner doesn't have delete endpoint for subscription in your routes.
    // Only ADMIN delete exists: ADMIN_SUBSCRIPTION_DELETE
    // If you want owner delete, backend route must be added.
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.ADMIN_SUBSCRIPTION_DELETE(deleteId), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpen(false);
      fetchList();
    } catch (e) {
      toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  const bulkDeleteSelected = async () => {
    if (selected.length === 0) return toast.warn("Select at least one");
    const tId = toast.loading("Deleting selected...");
    try {
      await axios.post(
        EndPoint.ADMIN_SUBSCRIPTIONS_BULK_DELETE,
        { ids: selected },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (e) {
      toast.update(tId, { render: "Bulk delete failed", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const bulkDeleteAll = async () => {
    const tId = toast.loading("Deleting all...");
    try {
      await axios.post(
        EndPoint.ADMIN_SUBSCRIPTIONS_BULK_DELETE,
        { all: true },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      toast.update(tId, { render: "Deleted All ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (e) {
      toast.update(tId, { render: "Bulk delete all failed", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
        <Typography variant="h5" fontWeight={600}>Subscriptions</Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={fetchList}>
            Refresh
          </Button>
          <Button variant="contained" onClick={() => navigate("/subscriptions/buy")}>
            Buy Subscription
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
          <TextField
            label="Business ID (optional)"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="submitted">submitted</MenuItem>
              <MenuItem value="verified">verified</MenuItem>
              <MenuItem value="rejected">rejected</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={fetchList}>Apply</Button>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
          <Button variant="outlined" color="error" onClick={bulkDeleteSelected}>
            Bulk Delete Selected
          </Button>
          <Button variant="contained" color="error" onClick={bulkDeleteAll}>
            Bulk Delete All
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>#</TableCell>
              <TableCell>Business</TableCell>
              <TableCell>Months</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Total Added</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Promo</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, index) => (
              <TableRow key={r.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(r.id)}
                    onChange={() => toggleSelectOne(r.id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{r.business || "-"}</TableCell>
                <TableCell>{r.purchased_months ?? "-"}</TableCell>
                <TableCell>{r.bonus_months ?? 0}</TableCell>
                <TableCell>{r.total_months_added ?? "-"}</TableCell>
                <TableCell>{r.amount_mmks ?? "-"}</TableCell>
                <TableCell>
                  <Typography fontWeight={600} sx={{ color: statusColor(r.status) }}>
                    {(r.status || "submitted").toLowerCase()}
                  </Typography>
                </TableCell>
                <TableCell>{r.promotion_code || "-"}</TableCell>
                <TableCell>{r.points_earned ?? "-"}</TableCell>
                <TableCell>{r.created_at || "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/subscriptions/detail/${r.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteId(r.id);
                        setOpen(true);
                      }}
                    >
                      <DeleteTwoTone twoToneColor="red" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={12}>
                  <Typography align="center" py={3} color="text.secondary">
                    No subscriptions
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={2}>Delete this subscription?</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          </Stack>
        </Card>
      </Modal>

      <ToastContainer position="top-right" />
    </>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 380,
  p: 3,
};

export default SubscriptionList;
