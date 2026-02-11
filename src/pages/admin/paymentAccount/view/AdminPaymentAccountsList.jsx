// src/pages/admin/paymentAccount/view/AdminPaymentAccountsList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  TextField,
  Button,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const safeList = (data) => {
  const list = Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];
  return Array.isArray(list) ? list : [];
};

const AdminPaymentAccountsList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState([]);
  const [confirmAll, setConfirmAll] = useState(false);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const fetchList = async () => {
    if (!access) return navigate("/login");

    setLoading(true);
    try {
      const res = await axios.get(EndPoint.PAYMENT_ACCOUNTS_ADMIN_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: q.trim() ? { q: q.trim() } : undefined,
      });
      setRows(safeList(res.data));
      setSelected([]);
      setConfirmAll(false);
    } catch (e) {
      toast.error("Failed to load payment accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, []);

  const toggleOne = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  };

  const toggleAllOnPage = () => {
    const ids = rows.map((r) => r.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedSet.has(id));
    setSelected(allSelected ? [] : ids);
  };

  const bulkDeleteSelected = async () => {
    if (!access) return navigate("/login");
    if (selected.length === 0) return toast.warn("Select at least 1 row");

    const ok = window.confirm(`Delete selected (${selected.length}) payment account(s)?`);
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.post(
        EndPoint.PAYMENT_ACCOUNTS_BULK_DELETE,
        { ids: selected },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Bulk delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const bulkDeleteAll = async () => {
    if (!access) return navigate("/login");
    if (!confirmAll) return toast.warn("Turn on 'I understand' first");

    const ok = window.confirm("DELETE ALL payment accounts? This is dangerous.");
    if (!ok) return;

    const tId = toast.loading("Deleting ALL...");
    try {
      await axios.post(
        EndPoint.PAYMENT_ACCOUNTS_BULK_DELETE,
        { all: true },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, { render: "All deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Bulk delete all failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const deleteOne = async (id) => {
    if (!access) return navigate("/login");
    const ok = window.confirm("Delete this payment account?");
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.PAYMENT_ACCOUNT_DELETE(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedSet.has(r.id));

  return (
    <>
      <Box sx={{ px: 2, mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Payment Accounts (Admin)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage bank accounts shown to users.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`${rows.length} item(s)`} variant="outlined" />
              <Button variant="contained" onClick={() => navigate("/admin/payment-accounts/create")}>
                Create
              </Button>
              <Button variant="outlined" onClick={fetchList} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchList()}
              fullWidth
              placeholder="bank / account name / account number"
            />
            <Button variant="contained" onClick={fetchList} disabled={loading} sx={{ minWidth: 140, height: 56 }}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={bulkDeleteSelected} disabled={selected.length === 0}>
                Bulk Delete Selected ({selected.length})
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={<Switch checked={confirmAll} onChange={(e) => setConfirmAll(e.target.checked)} />}
                label="I understand (Delete All)"
              />
              <Button color="error" variant="contained" onClick={bulkDeleteAll} disabled={!confirmAll}>
                Delete All
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={allOnPageSelected} onChange={toggleAllOnPage} />
                </TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account No.</TableCell>
                <TableCell align="right">Order</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedSet.has(r.id)} onChange={() => toggleOne(r.id)} />
                  </TableCell>

                  <TableCell>{r.bank_name}</TableCell>
                  <TableCell>{r.account_name}</TableCell>
                  <TableCell>{r.account_number}</TableCell>
                  <TableCell align="right">{r.order ?? 0}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={r.is_active ? "Active" : "Inactive"}
                      color={r.is_active ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => navigate(`/admin/payment-accounts/${r.id}`)}>
                        Detail
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/admin/payment-accounts/update/${r.id}`)}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => deleteOne(r.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography align="center" color="text.secondary" py={4}>
                      No payment accounts
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminPaymentAccountsList;
