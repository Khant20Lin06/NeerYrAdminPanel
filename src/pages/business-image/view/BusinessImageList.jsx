// src/pages/business-image/view/BusinessImageList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Modal, Card, Typography,
  FormControl, InputLabel, Select, MenuItem, Avatar
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import { imgUrl, PLACEHOLDER } from "../_helpers";

const BusinessImageList = () => {
  const [items, setItems] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else loadAll();
    // eslint-disable-next-line
  }, []);

  const loadAll = async () => {
    await fetchBusinesses();
    await fetchList("");
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setBusinesses(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load businesses");
    }
  };

  const fetchList = async (bizId) => {
    try {
      const url = bizId ? `${EndPoint.BUSINESS_IMAGES_LIST}?business=${bizId}` : EndPoint.BUSINESS_IMAGES_LIST;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${access}` } });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setItems(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load images");
    }
  };

  const handleBusinessFilter = (e) => {
    const val = e.target.value;
    setBusinessId(val);
    fetchList(val);
  };

  const handleDelete = async () => {
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.BUSINESS_IMAGE_DELETE(deleteId), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpen(false);
      fetchList(businessId);
    } catch (e) {
      toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
        <Typography variant="h5" fontWeight={600}>Business Images</Typography>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate("/business-image/create")}>
          Add Image
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Business</InputLabel>
          <Select value={businessId} label="Filter by Business" onChange={handleBusinessFilter}>
            <MenuItem value="">All</MenuItem>
            {businesses.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Caption</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Business</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={it.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <Avatar
                    src={imgUrl(it.image)}
                    variant="rounded"
                    sx={{ width: 54, height: 54 }}
                  />
                </TableCell>
                <TableCell>{it.caption || "-"}</TableCell>
                <TableCell>{it.order ?? "-"}</TableCell>
                <TableCell>{it.business || "-"}</TableCell>

                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/business-image/detail/${it.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/business-image/update/${it.id}`)}>
                      <EditTwoTone />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteId(it.id);
                        setOpen(true);
                      }}
                    >
                      <DeleteTwoTone twoToneColor="red" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Card sx={modalStyle}>
          <Typography variant="h6" mb={2}>Delete this image?</Typography>
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

export default BusinessImageList;
