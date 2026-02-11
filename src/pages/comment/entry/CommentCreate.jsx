// src/pages/comment/entry/CommentCreate.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const CommentCreate = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");

  const [loadingBiz, setLoadingBiz] = useState(false);
  const [bizList, setBizList] = useState([]);

  const [formData, setFormData] = useState({
    business: "",
    comment: "",
  });

  const selectedBiz = useMemo(
    () => bizList.find((b) => b.id === formData.business) || null,
    [bizList, formData.business]
  );

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    fetchMyBusinesses();
    // eslint-disable-next-line
  }, []);

  const fetchMyBusinesses = async () => {
    setLoadingBiz(true);
    try {
      const res = await axios.get(EndPoint.BUSINESSES_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data?.results || data?.data || data?.items || [];

      setBizList(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load businesses");
    } finally {
      setLoadingBiz(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.business) {
      toast.warn("Business ရွေးပေးပါ");
      return;
    }
    if (!formData.comment.trim()) {
      toast.warn("Comment ရေးပေးပါ");
      return;
    }

    const tId = toast.loading("Posting...");

    try {
      await axios.post(
        EndPoint.COMMENTS_CREATE,
        {
          business: formData.business,
          comment: formData.comment.trim(),
        },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      toast.update(tId, {
        render: "Posted ✅",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
      navigate(-1);
    } catch (err) {
      const data = err?.response?.data || {};
      const msg =
        data?.detail ||
        data?.error ||
        data?.business?.[0] ||
        data?.comment?.[0] ||
        "Create failed";

      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, width: 560, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            Create Comment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose your business and write a comment.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Business</InputLabel>
              <Select
                value={formData.business}
                label="Business"
                onChange={(e) =>
                  setFormData((p) => ({ ...p, business: e.target.value }))
                }
                disabled={loadingBiz}
              >
                {loadingBiz ? (
                  <MenuItem value="">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={18} />
                      <Typography variant="body2">Loading...</Typography>
                    </Stack>
                  </MenuItem>
                ) : bizList.length === 0 ? (
                  <MenuItem value="" disabled>
                    No businesses
                  </MenuItem>
                ) : (
                  bizList.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Optional: show selected business info */}
            {selectedBiz && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.paper" }}
              >
                <Typography fontWeight={700}>{selectedBiz.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {selectedBiz.id}
                </Typography>
              </Paper>
            )}

            <TextField
              label="Comment"
              required
              multiline
              rows={4}
              value={formData.comment}
              onChange={(e) =>
                setFormData((p) => ({ ...p, comment: e.target.value }))
              }
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="large">
                Post
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default CommentCreate;
