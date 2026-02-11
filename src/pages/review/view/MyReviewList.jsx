// src/pages/review/view/MyReviewList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, Typography, IconButton, Button
} from "@mui/material";
import { DeleteTwoTone, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const MyReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  useEffect(() => {
    if (!access) navigate("/login");
    else fetchMyReviews();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchMyReviews = async () => {
    try {
      const res = await axios.get(EndPoint.REVIEWS_ME_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load reviews");
    }
  };

  const handleDelete = async (id) => {
    const tId = toast.loading("Deleting...");
    try {
      await axios.delete(EndPoint.REVIEW_DELETE(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      toast.update(tId, { render: "Deleted ✅", type: "success", isLoading: false, autoClose: 1200 });
      fetchMyReviews();
    } catch (e) {
      toast.update(tId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2500 });
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={600}>My Reviews</Typography>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate("/reviews/create")}>
          Write Review
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Business</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Review</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reviews.map((r, idx) => (
              <TableRow key={r.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.business || "-"}</TableCell>
                <TableCell>{r.rating ?? "-"}</TableCell>
                <TableCell>{(r.review || "").slice(0, 80) || "-"}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDelete(r.id)}>
                    <DeleteTwoTone twoToneColor="red" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography align="center" sx={{ py: 3 }}>No reviews yet</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ToastContainer position="top-right" />
    </>
  );
};

export default MyReviewList;
