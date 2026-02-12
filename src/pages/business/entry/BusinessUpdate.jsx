import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint, API_BASE_URL } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const PLACEHOLDER = "/placeholder.png";

// ===== helpers =====
const pad2 = (n) => String(n).padStart(2, "0");

const safeImg = (img) => {
  if (!img) return "";
  if (typeof img !== "string") return "";
  if (img.startsWith("http")) return img;
  return `${API_BASE_URL}${img}`;
};

const localToDjangoDT = (date, time) => {
  if (!date || !time) return "";
  return `${date}T${time}`;
};

const djangoDTToLocal = (dt) => {
  if (!dt) return { date: "", time: "" };
  const s = String(dt);
  const [dPart, tPartRaw] = s.split("T");
  const tPart = (tPartRaw || "").replace("Z", "").split(".")[0];
  const time = tPart?.length >= 8 ? tPart.slice(0, 8) : "";
  return { date: dPart || "", time };
};

const tzNote = () => {
  const h = -new Date().getTimezoneOffset() / 60;
  return `Note: You are ${Math.abs(h)} hours ${h >= 0 ? "ahead of" : "behind"} server time.`;
};

const BusinessUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [categories, setCategories] = useState([]);

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [paidDate, setPaidDate] = useState("");
  const [paidTime, setPaidTime] = useState("");

  const note = useMemo(() => tzNote(), []);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    status: "draft",
    logo: null,
    cover_image: null,
    paid_until: "",
  });

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    await fetchCategories();
    await fetchBusiness();
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(EndPoint.CATEGORIES_PUBLIC_LIST, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.results || data?.data || data?.items || []);
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchBusiness = async () => {
    try {
      const res = await axios.get(EndPoint.BUSINESS_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });

      const b = res.data;

      setFormData({
        category: b.category || "",
        name: b.name || "",
        description: b.description || "",
        status: b.status || "draft",
        logo: null,
        cover_image: null,
        paid_until: b.paid_until || "",
      });

      const parts = djangoDTToLocal(b.paid_until);
      setPaidDate(parts.date);
      setPaidTime(parts.time);

      setLogoUrl(safeImg(b.logo));
      setCoverUrl(safeImg(b.cover_image));
      setLogoPreview(null);
      setCoverPreview(null);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to load business";
      toast.error(msg);
      console.error(err?.response?.data || err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, cover_image: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  // ✅ paid_until UI
  const syncPaid = (d, t) => {
    const dt = localToDjangoDT(d, t);
    setFormData((p) => ({ ...p, paid_until: dt }));
  };

  const onPaidDate = (e) => {
    const d = e.target.value;
    setPaidDate(d);
    syncPaid(d, paidTime || "00:00:00");
  };

  const onPaidTime = (e) => {
    const t = e.target.value;
    setPaidTime(t);
    syncPaid(paidDate, t);
  };

  const setToday = () => {
    const now = new Date();
    const d = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const t = paidTime || "00:00:00";
    setPaidDate(d);
    setPaidTime(t);
    syncPaid(d, t);
  };

  const setNow = () => {
    const now = new Date();
    const d = paidDate || `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const t = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    setPaidDate(d);
    setPaidTime(t);
    syncPaid(d, t);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating...");

    try {
      const headers = { Authorization: `Bearer ${access}` };

      const hasFile = !!formData.logo || !!formData.cover_image;

      if (!hasFile) {
        // ✅ JSON PATCH (no file)
        const payload = {
          category: formData.category,
          name: formData.name,
          description: formData.description || "",
          status: formData.status || "draft",
          // ❌ don't send paid_until (backend read-only)
        };

        await axios.patch(EndPoint.BUSINESS_UPDATE(id), payload, { headers });
      } else {
        // ✅ multipart PATCH (has file)
        const data = new FormData();
        data.append("category", formData.category);
        data.append("name", formData.name);
        data.append("description", formData.description || "");
        data.append("status", formData.status || "draft");

        if (formData.logo) data.append("logo", formData.logo);
        if (formData.cover_image) data.append("cover_image", formData.cover_image);

        // ❌ don't send paid_until
        await axios.patch(EndPoint.BUSINESS_UPDATE(id), data, { headers });
      }

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/businesses/list");
    } catch (err) {
      console.error(err?.response?.data || err);

      // show serializer errors nicely
      const data = err?.response?.data;
      const msg =
        (data && typeof data === "object" && JSON.stringify(data)) ||
        data?.detail ||
        data?.error ||
        "Update failed";

      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 4500 });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 560 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Update Business
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={formData.category} label="Category" onChange={handleChange}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Business Name" name="name" required value={formData.name} onChange={handleChange} />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="active">active</MenuItem>
                <MenuItem value="suspended">suspended</MenuItem>
              </Select>
            </FormControl>

            {/* ✅ Paid until panel */}
            <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: "#fff", color: "#111" }}>
              <Typography fontWeight={800} mb={1}>Paid until:</Typography>

              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={700} sx={{ minWidth: 48 }}>Date:</Typography>
                  <TextField
                    type="date"
                    value={paidDate}
                    onChange={onPaidDate}
                    size="small"
                    sx={{ bgcolor: "#fff", borderRadius: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button variant="text" onClick={setToday} sx={{ color: "#7dd3fc" }}>Today</Button>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={700} sx={{ minWidth: 48 }}>Time:</Typography>
                  <TextField
                    type="time"
                    value={paidTime}
                    onChange={onPaidTime}
                    size="small"
                    inputProps={{ step: 1 }}
                    sx={{ bgcolor: "#fff", borderRadius: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button variant="text" onClick={setNow} sx={{ color: "#7dd3fc" }}>Now</Button>
                </Stack>

                <Typography variant="caption" sx={{ opacity: 0.75 }}>{note}</Typography>
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" spacing={2} alignItems="center">
              <Stack spacing={1} alignItems="center">
                <Typography fontWeight={600}>Logo</Typography>
                <Avatar
                  src={logoPreview || logoUrl || PLACEHOLDER}
                  variant="rounded"
                  sx={{ width: 110, height: 110, boxShadow: 2 }}
                />
                <input hidden accept="image/*" type="file" id="upload-logo" onChange={handleLogo} />
                <label htmlFor="upload-logo">
                  <Button variant="outlined" component="span">Change</Button>
                </label>
              </Stack>

              <Stack spacing={1} flex={1}>
                <Typography fontWeight={600}>Cover Image</Typography>
                <Box
                  component="img"
                  src={coverPreview || coverUrl || PLACEHOLDER}
                  alt="cover"
                  sx={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 2, boxShadow: 2 }}
                />
                <input hidden accept="image/*" type="file" id="upload-cover" onChange={handleCover} />
                <label htmlFor="upload-cover">
                  <Button variant="outlined" component="span">Change</Button>
                </label>
              </Stack>
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" size="large">Update</Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default BusinessUpdate;
