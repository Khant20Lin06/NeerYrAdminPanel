// src/pages/business-image/view/BusinessImageList.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import { imgUrl } from "../_helpers";

const pickList = (data) =>
  Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];

const BusinessImageList = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [items, setItems] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // selection
  const [selected, setSelected] = useState({}); // {id:true}
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allChecked = items.length > 0 && selectedIds.length === items.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  // confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState("selected"); // selected | all | single
  const [singleDeleteId, setSingleDeleteId] = useState(null);

  useEffect(() => {
    if (!access) navigate("/login");
    else loadAll();
    // eslint-disable-next-line
  }, [navigate]);

  const loadAll = async () => {
    await fetchBusinesses();
    await fetchList({ business: "", q: "" });
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setBusinesses(pickList(res.data));
    } catch (e) {
      toast.error("Failed to load businesses");
      console.error(e?.response?.data || e);
    }
  };

  // ✅ list loader (supports business filter + search)
  const fetchList = async ({ business, q: query } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (business) params.business = business;
      if (query) params.q = query;

      const res = await axios.get(EndPoint.BUSINESS_IMAGES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
        params: Object.keys(params).length ? params : undefined,
      });

      const list = pickList(res.data);
      setItems(Array.isArray(list) ? list : []);
      setSelected({});
    } catch (e) {
      toast.error("Failed to load images");
      console.error(e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessFilter = (e) => {
    const val = e.target.value;
    setBusinessId(val);
    fetchList({ business: val, q: q.trim() });
  };

  const handleSearch = () => {
    fetchList({ business: businessId, q: q.trim() });
  };

  const toggleOne = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const toggleAll = () => {
    if (allChecked) {
      setSelected({});
      return;
    }
    const next = {};
    items.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  const openDeleteSelected = () => {
    if (selectedIds.length === 0) return toast.warn("Select at least one image");
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
      // ✅ single delete
      if (deleteMode === "single") {
        await axios.delete(EndPoint.BUSINESS_IMAGE_DELETE(singleDeleteId), {
          headers: { Authorization: `Bearer ${access}` },
        });
      }

      // ✅ bulk selected
      if (deleteMode === "selected") {
        await axios.post(
          EndPoint.BUSINESS_IMAGES_BULK_DELETE,
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      // ✅ bulk all
      if (deleteMode === "all") {
        await axios.post(
          EndPoint.BUSINESS_IMAGES_BULK_DELETE,
          { all: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );
      }

      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpenConfirm(false);
      fetchList({ business: businessId, q: q.trim() });
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(e?.response?.data || e);
    }
  };

  const confirmTitle =
    deleteMode === "all"
      ? "Delete ALL images?"
      : deleteMode === "single"
      ? "Delete this image?"
      : `Delete ${selectedIds.length} selected image(s)?`;

  const confirmDesc =
    deleteMode === "all"
      ? "This action is dangerous and cannot be undone."
      : "This action cannot be undone.";

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ width: 1100, p: 3, borderRadius: 3 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Business Images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter by business, search by caption, and manage images.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label={`${items.length} image(s)`} variant="outlined" />
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => navigate("/business-image/create")}
              >
                Add Image
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Filters */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} mb={2}>
            <FormControl fullWidth>
              <InputLabel>Filter by Business</InputLabel>
              <Select value={businessId} label="Filter by Business" onChange={handleBusinessFilter}>
                <MenuItem value="">All</MenuItem>
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Search caption"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              startIcon={<ReloadOutlined />}
              onClick={handleSearch}
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
                    <TableCell sx={{ fontWeight: 800 }}>Image</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Caption</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Order
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Business</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography align="center" color="text.secondary" py={4}>
                          No images
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((it, idx) => (
                      <TableRow key={it.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox checked={!!selected[it.id]} onChange={() => toggleOne(it.id)} />
                        </TableCell>

                        <TableCell>{idx + 1}</TableCell>

                        <TableCell>
                          <Avatar
                            src={imgUrl(it.image)}
                            variant="rounded"
                            sx={{ width: 54, height: 54 }}
                          />
                        </TableCell>

                        <TableCell sx={{ minWidth: 260 }}>
                          <Typography fontWeight={800}>{it.caption || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            {it.id}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">{it.order ?? "-"}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace" }}>{it.business || "-"}</TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Detail">
                              <IconButton size="small" onClick={() => navigate(`/business-image/detail/${it.id}`)}>
                                <InfoCircleOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Update">
                              <IconButton size="small" onClick={() => navigate(`/business-image/update/${it.id}`)}>
                                <EditTwoTone />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => openSingleDelete(it.id)}>
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

export default BusinessImageList;
