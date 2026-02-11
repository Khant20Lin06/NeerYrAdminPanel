// src/pages/business/view/BusinessList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Stack, IconButton, Modal, Card, Typography, Avatar, Chip
} from "@mui/material";
import { DeleteTwoTone, EditTwoTone, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint, API_BASE_URL } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const PLACEHOLDER = "/placeholder.png";

// ✅ convert "/media/.." => full url
const getImageUrl = (img) => {
    if (!img) return PLACEHOLDER;
    if (typeof img !== "string") return PLACEHOLDER;
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}${img}`;
};

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
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
        await fetchCategories();
        await fetchBusinesses();
    };

    const categoryNameById = (categoryId) => {
        const c = categories.find((x) => x.id === categoryId);
        return c?.name || "-";
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(EndPoint.CATEGORIES_PUBLIC_LIST, {
                headers: { Authorization: `Bearer ${access}` },
            });
            const data = res.data;
            const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
            setCategories(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error("Failed to load Categories");
            console.error(err?.response?.data || err);
        }
    };

    const fetchBusinesses = async () => {
        try {
            const res = await axios.get(EndPoint.BUSINESSES_LIST, {
                headers: { Authorization: `Bearer ${access}` },
            });

            const data = res.data;
            const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
            setBusinesses(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error("Failed to load businesses");
            console.error(err?.response?.data || err);
        }
    };

    const handleDelete = async () => {
        const tId = toast.loading("Deleting...");
        try {
            await axios.delete(EndPoint.BUSINESS_DELETE(deleteId), {
                headers: { Authorization: `Bearer ${access}` },
            });
            toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
            setOpen(false);
            fetchBusinesses();
        } catch (e) {
            toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
        }
    };

    const statusChip = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "active") return <Chip label="active" color="success" size="small" />;
        if (s === "suspended") return <Chip label="suspended" color="warning" size="small" />;
        return <Chip label={status || "draft"} size="small" />;
    };

    return (
        <>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight={600}>Business List</Typography>
                <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    onClick={() => navigate("/business/create")}
                >
                    Create Business
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Logo</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Paid Until</TableCell>
                            <TableCell>Remaining Days</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {businesses.map((b, index) => (
                            <TableRow key={b.id} hover>
                                <TableCell>{index + 1}</TableCell>

                                <TableCell>
                                    <Avatar
                                        variant="rounded"
                                        src={getImageUrl(b.logo)}
                                        sx={{ width: 44, height: 44 }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Typography fontWeight={600}>{b.name || "-"}</Typography>
                                </TableCell>

                                <TableCell>{categoryNameById(b.category)}</TableCell>
                                <TableCell>{statusChip(b.status)}</TableCell>
                                <TableCell>{b.paid_until || "-"}</TableCell>
                                <TableCell>{b.remaining_days ?? "-"}</TableCell>
                                <TableCell>{b.created_at || "-"}</TableCell>

                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton size="small" onClick={() => navigate(`/business/detail/${b.id}`)}>
                                            <InfoCircleOutlined />
                                        </IconButton>

                                        <IconButton size="small" onClick={() => navigate(`/business/update/${b.id}`)}>
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
                    <Typography variant="h6" mb={2}>Delete this business?</Typography>
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

export default BusinessList;
