// src/pages/promotion/view/PromotionList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Modal, Card, Typography,
  Checkbox, TextField, Switch, Chip
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const statusChip = (p) => {
  const active = !!p.is_active;
  const now = new Date();

  const start = p.start_at ? new Date(p.start_at) : null;
  const end = p.end_at ? new Date(p.end_at) : null;

  const inWindow =
    (!start || start <= now) &&
    (!end || end >= now);

  if (active && inWindow) return <Chip size="small" label="active" color="success" />;
  if (active && !inWindow) return <Chip size="small" label="scheduled/expired" color="warning" />;
  return <Chip size="small" label="inactive" color="default" />;
};

const PromotionList = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  // delete modal
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // bulk
  const [selected, setSelected] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkAllOpen, setBulkAllOpen] = useState(false);

  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchList();
    // eslint-disable-next-line
  }, []);

  const fetchList = async (query = q) => {
    try {
      const url = query
        ? `${EndPoint.PROMOTIONS_ADMIN_LIST}?q=${encodeURIComponent(query)}`
        : EndPoint.PROMOTIONS_ADMIN_LIST;

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${access}` } });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setItems(Array.isArray(list) ? list : []);
      setSelected([]);
    } catch (e) {
      toast.error("Failed to load promotions");
    }
  };

  const allChecked = useMemo(() => items.length > 0 && selected.length === items.length, [items, selected]);

  const toggleSelectAll = (checked) => {
    if (checked) setSelected(items.map((x) => x.id));
    else setSelected([]);
  };

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = async () => {
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.PROMOTION_DELETE(deleteId), {
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
    const tId = toast.loading("Deleting selected...");
    try {
      await axios.post(
        EndPoint.PROMOTIONS_BULK_DELETE,
        { ids: selected },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setBulkOpen(false);
      fetchList();
    } catch (e) {
      const msg = e?.response?.data?.error || "Bulk delete failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const bulkDeleteAll = async () => {
    const tId = toast.loading("Deleting all...");
    try {
      await axios.post(
        EndPoint.PROMOTIONS_BULK_DELETE,
        { all: true },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      toast.update(tId, { render: "All deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setBulkAllOpen(false);
      fetchList();
    } catch (e) {
      const msg = e?.response?.data?.error || "Delete all failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const updateActive = async (id, is_active) => {
    try {
      await axios.patch(
        EndPoint.PROMOTION_UPDATE(id),
        { is_active: !is_active },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !is_active } : p)));
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
        <Typography variant="h5" fontWeight={600}>Promotion List</Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            disabled={selected.length === 0}
            onClick={() => setBulkOpen(true)}
          >
            Delete Selected ({selected.length})
          </Button>

          <Button color="error" variant="outlined" onClick={() => setBulkAllOpen(true)}>
            Delete All
          </Button>

          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate("/promotion/create")}>
            Create Promotion
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Search (name / code)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchList(e.currentTarget.value)}
          />
          <Button variant="contained" onClick={() => fetchList(q)}>Search</Button>
          <Button variant="outlined" onClick={() => { setQ(""); fetchList(""); }}>Reset</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox checked={allChecked} onChange={(e) => toggleSelectAll(e.target.checked)} />
              </TableCell>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Min Months</TableCell>
              <TableCell>Bonus Months</TableCell>
              <TableCell>Multiplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Active Toggle</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((p, index) => (
              <TableRow key={p.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell><Typography fontWeight={600}>{p.name || "-"}</Typography></TableCell>
                <TableCell>{p.code || "-"}</TableCell>
                <TableCell>{p.min_months ?? 1}</TableCell>
                <TableCell>{p.bonus_months ?? 0}</TableCell>
                <TableCell>{p.points_multiplier ?? 1}</TableCell>
                <TableCell>{statusChip(p)}</TableCell>
                <TableCell>
                  <Switch checked={!!p.is_active} onChange={() => updateActive(p.id, p.is_active)} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/promotion/detail/${p.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/promotion/update/${p.id}`)}>
                      <EditTwoTone />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteId(p.id);
                        setOpen(true);
                      }}
                    >
                      <DeleteTwoTone twoToneColor="red" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
                  <Typography align="center" sx={{ py: 3 }}>No data</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Single delete */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={2}>Delete this promotion?</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          </Stack>
        </Card>
      </Modal>

      {/* Bulk selected */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            Delete selected promotions ({selected.length})?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button color="error" variant="contained" onClick={bulkDeleteSelected}>Delete</Button>
            <Button variant="outlined" onClick={() => setBulkOpen(false)}>Cancel</Button>
          </Stack>
        </Card>
      </Modal>

      {/* Bulk all */}
      <Modal open={bulkAllOpen} onClose={() => setBulkAllOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={1}>Delete ALL promotions?</Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            This cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button color="error" variant="contained" onClick={bulkDeleteAll}>Delete All</Button>
            <Button variant="outlined" onClick={() => setBulkAllOpen(false)}>Cancel</Button>
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

export default PromotionList;
