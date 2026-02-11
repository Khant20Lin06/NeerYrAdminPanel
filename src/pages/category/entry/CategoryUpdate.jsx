// src/pages/category/entry/CategoryUpdate.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Button, TextField, Typography, Stack,
  Switch, FormControlLabel, Divider, Avatar
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import { imgUrl, PLACEHOLDER } from "../_helpers";

const CategoryUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const access = localStorage.getItem("access_token");

  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 0,
    is_active: true,
    image: null,
  });

  useEffect(() => {
    if (!access) {
      navigate("/login");
      return;
    }
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(EndPoint.CATEGORY_DETAIL(id), {
        headers: { Authorization: `Bearer ${access}` },
      });
      const c = res.data;

      setFormData({
        name: c.name || "",
        slug: c.slug || "",
        order: c.order ?? 0,
        is_active: c.is_active ?? true,
        image: null,
      });

      setImageUrl(imgUrl(c.image, c.image_url));
      setPreview(null);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to load category";
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "order") {
      setFormData((p) => ({ ...p, order: value === "" ? 0 : Number(value) }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleActive = (e) => setFormData((p) => ({ ...p, is_active: e.target.checked }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Updating...");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("order", String(formData.order ?? 0));
    data.append("is_active", String(!!formData.is_active));
    if (formData.image) data.append("image", formData.image);

    try {
      await axios.patch(EndPoint.CATEGORY_UPDATE(id), data, {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.update(tId, { render: "Updated ✅", type: "success", isLoading: false, autoClose: 1200 });
      navigate("/categories/list");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Update failed";
      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      console.error(err?.response?.data || err);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, width: 520 }}>
          <Typography variant="h6" gutterBottom>Update Category</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name" name="name" required value={formData.name} onChange={handleChange} />
            <TextField label="Slug" name="slug" required value={formData.slug} onChange={handleChange} />
            <TextField label="Order" name="order" type="number" value={formData.order} onChange={handleChange} />

            <FormControlLabel
              control={<Switch checked={!!formData.is_active} onChange={handleActive} />}
              label="Active"
            />

            <Divider />

            <Stack spacing={1}>
              <Typography fontWeight={500}>Category Image</Typography>
              <Avatar
                src={preview || imageUrl || PLACEHOLDER}
                variant="rounded"
                sx={{ width: 140, height: 140, boxShadow: 2 }}
              />
              <input hidden accept="image/*" type="file" id="upload-image" onChange={handleImage} />
              <label htmlFor="upload-image">
                <Button variant="outlined" component="span">
                  Change Image
                </Button>
              </label>
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

export default CategoryUpdate;
