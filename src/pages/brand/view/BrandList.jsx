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
  TableContainer,
  IconButton,
  Modal,
  Card,
  Chip,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const pickList = (data) =>
  Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];

const BrandList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [q, setQ] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // selection
  const [selected, setSelected] = useState({}); // { id: true }
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allChecked = branches.length > 0 && selectedIds.length === branches.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < branches.length;

  // confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState("selected"); // "selected" | "all"
  const [singleDeleteId, setSingleDeleteId] = useState(null);

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchBranches();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.BRANCHES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: q.trim() ? { q: q.trim() } : undefined,
      });

      const list = pickList(res.data);
      setBranches(Array.isArray(list) ? list : []);
      setSelected({});
    } catch (e) {
      toast.error("Failed to load branches");
      console.error(e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
      return;
    }
    const next = {};
    branches.forEach((b) => (next[b.id] = true));
    setSelected(next);
  };

  const openDeleteSelected = () => {
    if (selectedIds.length === 0) return toast.warn("Select at least one branch");
    setDeleteMode("selected");
    setSingleDeleteId(null);
    setOpenConfirm(true);
  };

  const openDeleteAll = () => {
    setDeleteMode("all");
    setSingleDeleteId(null);
    setOpenConfirm(true);
  };

  const openSingleDelete = (id) => {
    setDeleteMode("single");
    setSingleDeleteId(id);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    const tId = toast.loading("Deleting...");
    try {
      // ✅ Single delete uses DELETE endpoint
      if (deleteMode === "single") {
        await axios.delete(EndPoint.BRANCH_DELETE(singleDeleteId), {
          headers: { Authorization: `Bearer ${access}` },
        });
      }

      // ✅ Bulk delete uses BRANCH_BULK_DELETE
      if (deleteMode === "selected") {
        await axios.post(
          EndPoint.BRANCH_BULK_DELETE,
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      if (deleteMode === "all") {
        await axios.post(
          EndPoint.BRANCH_BULK_DELETE,
          { all: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpenConfirm(false);
      fetchBranches();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(e?.response?.data || e);
    }
  };

  const handleActiveToggle = async (id, is_active) => {
    const tId = toast.loading("Updating...");
    try {
      await axios.patch(
        EndPoint.BRANCH_UPDATE(id),
        { is_active: !is_active },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !is_active } : b)));
      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1000 });
    } catch (e) {
      toast.update(tId, { render: "Update failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  const confirmTitle =
    deleteMode === "all"
      ? "Delete ALL branches?"
      : deleteMode === "single"
      ? "Delete this branch?"
      : `Delete ${selectedIds.length} selected branch(es)?`;

  const confirmDesc =
    deleteMode === "all"
      ? "This action is dangerous and cannot be undone."
      : "This action cannot be undone.";

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 1050, p: 3, borderRadius: 3 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Branch List
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage branches (create / update / toggle active / bulk delete).
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label={`${branches.length} branch(es)`} variant="outlined" />
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => navigate("/brand/create")}
              >
                Create Branch
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Toolbar */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} mb={2}>
            <TextField
              label="Search (name / phone / address)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              startIcon={<ReloadOutlined />}
              onClick={fetchBranches}
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {loading ? "Loading..." : "Search"}
            </Button>

            <Button
              variant="outlined"
              onClick={openDeleteSelected}
              disabled={selectedIds.length === 0}
            >
              Delete Selected
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={openDeleteAll}
            >
              Delete All
            </Button>
          </Stack>

          {/* Table */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={toggleAll} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Branch Name</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Active</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography align="center" color="text.secondary" py={4}>
                          No branches
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((b, index) => (
                      <TableRow key={b.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox checked={!!selected[b.id]} onChange={() => toggleOne(b.id)} />
                        </TableCell>

                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography fontWeight={800}>{b.branch_name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            {b.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{b.phone || "-"}</TableCell>
                        <TableCell sx={{ maxWidth: 380 }}>
                          <Typography noWrap title={b.address || ""}>
                            {b.address || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!b.is_active} onChange={() => handleActiveToggle(b.id, b.is_active)} />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Detail">
                              <IconButton size="small" onClick={() => navigate(`/brand/detail/${b.id}`)}>
                                <InfoCircleOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Update">
                              <IconButton size="small" onClick={() => navigate(`/brand/update/${b.id}`)}>
                                <EditTwoTone />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => openSingleDelete(b.id)}>
                                <DeleteTwoTone twoToneColor="red" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Paper>
      </Box>

      {/* Confirm Modal */}
      <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" fontWeight={900} mb={1}>
            {confirmTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {confirmDesc}
          </Typography>

          {deleteMode === "selected" && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Selected IDs: {selectedIds.slice(0, 3).join(", ")}
              {selectedIds.length > 3 ? ` ... (+${selectedIds.length - 3})` : ""}
            </Typography>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setOpenConfirm(false)}>
              Cancel
            </Button>
            <Button color="error" variant="contained" onClick={confirmDelete}>
              Delete
            </Button>
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
  width: 420,
  p: 3,
  borderRadius: 2,
};

export default BrandList;
