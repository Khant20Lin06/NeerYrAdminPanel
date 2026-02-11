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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../../../api/endpoints";

const AdminWalletsList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // selection
  const [selected, setSelected] = useState({}); // {id: true}
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allChecked = rows.length > 0 && selectedIds.length === rows.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < rows.length;

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchList();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.ADMIN_WALLETS_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: q.trim() ? { q: q.trim() } : undefined,
      });

      const data = res.data;
      const list = Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];
      setRows(Array.isArray(list) ? list : []);
      setSelected({}); // reset selection
    } catch (e) {
      toast.error("Failed to load wallets");
      console.error(e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (id) => {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  };

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
      return;
    }
    const next = {};
    rows.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  const bulkDelete = async ({ all = false } = {}) => {
    if (!all && selectedIds.length === 0) {
      toast.warn("Select at least one wallet");
      return;
    }

    const ok = window.confirm(all ? "Delete ALL wallets? (Danger)" : `Delete ${selectedIds.length} wallet(s)?`);
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.post(
        EndPoint.ADMIN_WALLETS_BULK_DELETE,
        all ? { all: true } : { ids: selectedIds },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchList();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Bulk delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(e?.response?.data || e);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 1100, p: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Points Wallets (Admin)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage owner points wallets.
              </Typography>
            </Box>

            <Chip label={`${rows.length} wallet(s)`} variant="outlined" />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} mb={2}>
            <TextField
              label="Search (owner username / email / phone)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={fetchList} disabled={loading} sx={{ minWidth: 140 }}>
              {loading ? "Loading..." : "Search"}
            </Button>

            <Button variant="outlined" onClick={() => bulkDelete({ all: false })} disabled={selectedIds.length === 0}>
              Delete Selected
            </Button>

            <Button variant="outlined" color="error" onClick={() => bulkDelete({ all: true })}>
              Delete All
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={toggleAll} />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800 }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>

                  <TableCell sx={{ fontWeight: 800 }}>Wallet ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Owner ID</TableCell>

                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Points
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Updated</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography align="center" color="text.secondary" py={4}>
                        No wallets
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {r.owner_username || "-"}
                      </TableCell>

                      <TableCell>
                        {r.owner_email || "-"}
                      </TableCell>

                      <TableCell>
                        {r.owner_phone || "-"}
                      </TableCell>

                      <TableCell sx={{ fontFamily: "monospace" }}>{r.id}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{r.owner_id}</TableCell>

                      <TableCell align="right">
                        <Chip label={r.points_balance ?? 0} />
                      </TableCell>

                      <TableCell>{r.updated_at || "-"}</TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => navigate(`/admin/points/wallets/${r.id}`)}>
                            Detail
                          </Button>
                          <Button size="small" variant="contained" onClick={() => navigate(`/admin/points/wallets/${r.id}/update`)}>
                            Update
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminWalletsList;
