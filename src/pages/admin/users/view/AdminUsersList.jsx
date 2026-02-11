// src/pages/admin/users/view/AdminUsersList.jsx
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
import { EndPoint } from "../../../../api/endpoints";

const AdminUsersList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // selection {id: true}
  const [selected, setSelected] = useState({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allChecked = rows.length > 0 && selectedIds.length === rows.length;
  const indeterminate =
    selectedIds.length > 0 && selectedIds.length < rows.length;

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchList();
    // eslint-disable-next-line
  }, [navigate]);

  const normalizeList = (data) => {
    const list = Array.isArray(data)
      ? data
      : data?.results || data?.data || data?.items || [];
    return Array.isArray(list) ? list : [];
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.USERS_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: q.trim() ? { q: q.trim() } : undefined,
      });

      const list = normalizeList(res.data);
      setRows(list);
      setSelected({});
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Failed to load users";
      toast.error(msg);
      console.error(e?.response?.data || e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const toggleAll = () => {
    if (allChecked) return setSelected({});
    const next = {};
    rows.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  const bulkDelete = async ({ all = false } = {}) => {
    if (!all && selectedIds.length === 0) {
      toast.warn("Select at least one user");
      return;
    }

    const ok = window.confirm(
      all
        ? "Delete ALL users? (Danger)"
        : `Delete ${selectedIds.length} user(s)?`
    );
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.post(
        EndPoint.USERS_BULK_DELETE,
        all ? { all: true } : { ids: selectedIds },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: "Deleted ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
      fetchList();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Bulk delete failed";
      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(e?.response?.data || e);
    }
  };

  const deleteOne = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;

    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.USER_DELETE(id), {
        headers: { Authorization: `Bearer ${access}` },
      });

      toast.update(tId, {
        render: "Deleted ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
      fetchList();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Delete failed";
      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(e?.response?.data || e);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 1100, p: 3, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Admin Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage users (admin only).
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip label={`${rows.length} user(s)`} variant="outlined" />
              <Button
                variant="contained"
                onClick={() => navigate("/admin/users/create")}
              >
                Create
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "center" }}
            mb={2}
          >
            <TextField
              label="Search (phone / username / email)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={fetchList}
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {loading ? "Loading..." : "Search"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => bulkDelete({ all: false })}
              disabled={selectedIds.length === 0}
            >
              Delete Selected
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => bulkDelete({ all: true })}
            >
              Delete All
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={indeterminate}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>USERNAME</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>PHONE</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>EMAIL</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>ROLE</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>ACTIVE</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>STAFF</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>JOINED</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography align="center" color="text.secondary" py={4}>
                        No users
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!!selected[u.id]}
                          onChange={() => toggleOne(u.id)}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {u.username || "-"}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>
                        {u.phone || "-"}
                      </TableCell>
                      <TableCell>{u.email || "-"}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={u.role || "-"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={u.is_active ? "Yes" : "No"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={u.is_staff ? "Yes" : "No"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>{u.date_joined || "-"}</TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                          >
                            Detail
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              navigate(`/admin/users/${u.id}/update`)
                            }
                          >
                            Update
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => deleteOne(u.id)}
                          >
                            Delete
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

export default AdminUsersList;
