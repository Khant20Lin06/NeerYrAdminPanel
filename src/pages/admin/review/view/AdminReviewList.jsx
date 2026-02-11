// src/pages/admin/review/view/AdminReviewList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Typography, IconButton, Button, TextField, Checkbox, Modal, Card
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  p: 3,
};

const AdminReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchReviews();
    // eslint-disable-next-line
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${EndPoint.ADMIN_REVIEWS_LIST}?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReviews(Array.isArray(list) ? list : []);
      setSelected([]);
    } catch (e) {
      toast.error("Failed to load reviews");
    }
  };

  const allChecked = useMemo(() => reviews.length > 0 && selected.length === reviews.length, [reviews, selected]);

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (allChecked) setSelected([]);
    else setSelected(reviews.map((r) => r.id));
  };

  const confirmDeleteOne = (id) => {
    setDeleteId(id);
    setOpen(true);
  };

  const deleteOne = async () => {
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.ADMIN_REVIEW_DELETE(deleteId), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpen(false);
      fetchReviews();
    } catch (e) {
      toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  const bulkDelete = async (all = false) => {
    const tId = toast.loading(all ? "Deleting all..." : "Deleting selected...");
    try {
      await axios.post(
        EndPoint.ADMIN_REVIEWS_BULK_DELETE,
        all ? { all: true } : { ids: selected },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchReviews();
    } catch (e) {
      toast.update(tId, { render: "Bulk delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2} gap={2}>
        <Typography variant="h5" fontWeight={600}>Admin Reviews</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button variant="outlined" onClick={fetchReviews}>Search</Button>
          <Button
            color="error"
            variant="contained"
            disabled={selected.length === 0}
            onClick={() => bulkDelete(false)}
          >
            Delete Selected
          </Button>
          <Button color="error" variant="outlined" onClick={() => bulkDelete(true)}>
            Delete All
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox checked={allChecked} onChange={toggleAll} />
              </TableCell>
              <TableCell>#</TableCell>
              <TableCell>Business</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Review</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reviews.map((r, idx) => (
              <TableRow key={r.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} />
                </TableCell>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.business || "-"}</TableCell>
                <TableCell>{r.username || r.user_id || "-"}</TableCell>
                <TableCell>{r.rating ?? "-"}</TableCell>
                <TableCell>{(r.review || "").slice(0, 80) || "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/admin/reviews/${r.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/admin/reviews/${r.id}/update`)}>
                      <EditTwoTone />
                    </IconButton>
                    <IconButton size="small" onClick={() => confirmDeleteOne(r.id)}>
                      <DeleteTwoTone twoToneColor="red" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography align="center" sx={{ py: 3 }}>No reviews</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={2}>Delete this review?</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button color="error" variant="contained" onClick={deleteOne}>Delete</Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          </Stack>
        </Card>
      </Modal>

      <ToastContainer position="top-right" />
    </>
  );
};

export default AdminReviewList;
