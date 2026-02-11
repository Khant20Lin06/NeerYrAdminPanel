// src/pages/category/view/CategoryList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Modal, Card, Typography,
  Checkbox, TextField, Avatar, Switch
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import { imgUrl, PLACEHOLDER } from "../_helpers";

const CategoryList = () => {
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
      const url = query ? `${EndPoint.CATEGORIES_ADMIN_LIST}?q=${encodeURIComponent(query)}` : EndPoint.CATEGORIES_ADMIN_LIST;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${access}` } });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setItems(Array.isArray(list) ? list : []);
      setSelected([]);
    } catch (e) {
      toast.error("Failed to load categories");
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
      await axios.delete(EndPoint.CATEGORY_DELETE(deleteId), {
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
        EndPoint.CATEGORIES_BULK_DELETE,
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
        EndPoint.CATEGORIES_BULK_DELETE,
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
        EndPoint.CATEGORY_UPDATE(id),
        { is_active: !is_active },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !is_active } : c)));
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
        <Typography variant="h5" fontWeight={600}>Category List</Typography>

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

          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate("/category/create")}>
            Create Category
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Search (name / slug)"
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
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((c, index) => (
              <TableRow key={c.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Avatar
                    src={imgUrl(c.image, c.image_url)}
                    variant="rounded"
                    sx={{ width: 44, height: 44 }}
                  />
                </TableCell>
                <TableCell><Typography fontWeight={600}>{c.name}</Typography></TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell>{c.order ?? 0}</TableCell>
                <TableCell>
                  <Switch checked={!!c.is_active} onChange={() => updateActive(c.id, c.is_active)} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/category/detail/${c.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/category/update/${c.id}`)}>
                      <EditTwoTone />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteId(c.id);
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
                <TableCell colSpan={8}>
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
          <Typography variant="h6" mb={2}>Delete this category?</Typography>
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
            Delete selected categories ({selected.length})?
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
          <Typography variant="h6" mb={1}>Delete ALL categories?</Typography>
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

export default CategoryList;
