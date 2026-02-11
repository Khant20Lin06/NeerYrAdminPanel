// src/pages/business/view/BusinessList.jsx
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  Card,
  Avatar,
  Chip,
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
import { EndPoint, API_BASE_URL } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const PLACEHOLDER = "/placeholder.png";

const pickList = (data) =>
  Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];

const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER;
  if (typeof img !== "string") return PLACEHOLDER;
  if (img.startsWith("http")) return img;
  return `${API_BASE_URL}${img}`;
};

const statusChip = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "active") return <Chip label="active" color="success" size="small" />;
  if (s === "suspended") return <Chip label="suspended" color="warning" size="small" />;
  return <Chip label={status || "draft"} size="small" variant="outlined" />;
};

const BusinessList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);

  // filters
  const [q, setQ] = useState("");

  // loading
  const [loading, setLoading] = useState(false);

  // selection
  const [selected, setSelected] = useState({}); // {id:true}
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allChecked = businesses.length > 0 && selectedIds.length === businesses.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < businesses.length;

  // confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState("selected"); // "selected" | "all" | "single"
  const [singleDeleteId, setSingleDeleteId] = useState(null);

  useEffect(() => {
    if (!access) navigate("/login");
    else loadAll();
    // eslint-disable-next-line
  }, [navigate]);

  const categoryNameById = (categoryId) => {
    const c = categories.find((x) => x.id === categoryId);
    return c?.name || "-";
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(EndPoint.CATEGORIES_PUBLIC_LIST);
      setCategories(pickList(res.data));
    } catch (err) {
      toast.error("Failed to load Categories");
      console.error(err?.response?.data || err);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: q.trim() ? { q: q.trim() } : undefined,
      });

      const list = pickList(res.data);
      setBusinesses(Array.isArray(list) ? list : []);
      setSelected({});
    } catch (err) {
      toast.error("Failed to load businesses");
      console.error(err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    await fetchCategories();
    await fetchBusinesses();
  };

  const toggleOne = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
      return;
    }
    const next = {};
    businesses.forEach((b) => (next[b.id] = true));
    setSelected(next);
  };

  const openDeleteSelected = () => {
    if (selectedIds.length === 0) return toast.warn("Select at least one business");
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
      // ✅ Single delete
      if (deleteMode === "single") {
        await axios.delete(EndPoint.BUSINESS_DELETE(singleDeleteId), {
          headers: { Authorization: `Bearer ${access}` },
        });
      }

      // ✅ Bulk delete (selected)
      if (deleteMode === "selected") {
        await axios.post(
          EndPoint.BUSINESSES_BULK_DELETE,
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      // ✅ Bulk delete (all)
      if (deleteMode === "all") {
        await axios.post(
          EndPoint.BUSINESSES_BULK_DELETE,
          { all: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpenConfirm(false);
      fetchBusinesses();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(e?.response?.data || e);
    }
  };

  const confirmTitle =
    deleteMode === "all"
      ? "Delete ALL businesses?"
      : deleteMode === "single"
      ? "Delete this business?"
      : `Delete ${selectedIds.length} selected business(es)?`;

  const confirmDesc =
    deleteMode === "all"
      ? "This action is dangerous and cannot be undone."
      : "This action cannot be undone.";

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 1200, p: 3, borderRadius: 3 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Business List
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage businesses (detail / update / bulk delete).
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label={`${businesses.length} business(es)`} variant="outlined" />
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => navigate("/business/create")}
              >
                Create Business
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Toolbar */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} mb={2}>
            <TextField
              label="Search (name / description)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              startIcon={<ReloadOutlined />}
              onClick={fetchBusinesses}
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

            <Button variant="outlined" color="error" onClick={openDeleteAll}>
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
                    <TableCell sx={{ fontWeight: 800 }}>Logo</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Paid Until</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Remaining Days
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {businesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <Typography align="center" color="text.secondary" py={4}>
                          No businesses
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    businesses.map((b, index) => (
                      <TableRow key={b.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox checked={!!selected[b.id]} onChange={() => toggleOne(b.id)} />
                        </TableCell>

                        <TableCell>{index + 1}</TableCell>

                        <TableCell>
                          <Avatar
                            variant="rounded"
                            src={getImageUrl(b.logo)}
                            sx={{ width: 44, height: 44 }}
                          />
                        </TableCell>

                        <TableCell sx={{ minWidth: 220 }}>
                          <Typography fontWeight={800}>{b.name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            {b.id}
                          </Typography>
                        </TableCell>

                        <TableCell>{categoryNameById(b.category)}</TableCell>
                        <TableCell>{statusChip(b.status)}</TableCell>
                        <TableCell>{b.paid_until || "-"}</TableCell>
                        <TableCell align="right">{b.remaining_days ?? "-"}</TableCell>
                        <TableCell>{b.created_at || "-"}</TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Detail">
                              <IconButton size="small" onClick={() => navigate(`/business/detail/${b.id}`)}>
                                <InfoCircleOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Update">
                              <IconButton size="small" onClick={() => navigate(`/business/update/${b.id}`)}>
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
  width: 460,
  p: 3,
  borderRadius: 2,
};

export default BusinessList;
