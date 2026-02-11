import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, IconButton, Modal, Card, Typography, Switch
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const BrandList = () => {
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchBranches();
    // eslint-disable-next-line
  }, []);

  const fetchBranches = async () => {
    const res = await axios.get(EndPoint.BRANCHES_LIST, {
      headers: { Authorization: `Bearer ${access}` },
    });

    const data = res.data;
    const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
    setBranches(Array.isArray(list) ? list : []);
  };

  const handleDelete = async () => {
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.BRANCH_DELETE(deleteId), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      setOpen(false);
      fetchBranches();
    } catch (e) {
      toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  const handleActiveToggle = async (id, is_active) => {
    try {
      await axios.patch(
        EndPoint.BRANCH_UPDATE(id),
        { is_active: !is_active },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !is_active } : b)));
      toast.success("Updated");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={600}>Branch List</Typography>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate("/brand/create")}>
          Create Branch
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {branches.map((b, index) => (
              <TableRow key={b.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell><Typography fontWeight={600}>{b.branch_name || "-"}</Typography></TableCell>
                <TableCell>{b.phone || "-"}</TableCell>
                <TableCell>{b.address || "-"}</TableCell>
                <TableCell>
                  <Switch checked={!!b.is_active} onChange={() => handleActiveToggle(b.id, b.is_active)} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" onClick={() => navigate(`/brand/detail/${b.id}`)}>
                      <InfoCircleOutlined />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/brand/update/${b.id}`)}>
                      <EditTwoTone />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteId(b.id);
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
          <Typography variant="h6" mb={2}>Delete this branch?</Typography>
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

export default BrandList;
