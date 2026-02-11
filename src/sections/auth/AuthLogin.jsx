import PropTypes from "prop-types";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// material-ui
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project imports
import IconButton from "components/@extended/IconButton";
import AnimateButton from "components/@extended/AnimateButton";

// assets
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";

import axios from "axios";
import { EndPoint } from "../../api/endpoints";

// ✅ toastify
import { ToastContainer, toast } from "react-toastify";

export default function AuthLogin() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleClickShowPassword = () => setShowPassword((s) => !s);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault(); // ✅ Enter pressed => prevent page refresh

    if (!formData.phone || !formData.password) {
      toast.warn("Phone and Password ထည့်ပါ");
      return;
    }

    setLoading(true);
    const tId = toast.loading("Logging in...");

    try {
      const response = await axios.post(EndPoint.LOGIN, formData);
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      toast.update(tId, {
        render: "Login success ✅",
        type: "success",
        isLoading: false,
        autoClose: 1500
      });

      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (error?.message === "Network Error"
          ? "Network/CORS Error ဖြစ်နိုင်ပါတယ် (backend CORS allow လုပ်ပေးရမယ်)"
          : "Login failed");

      toast.update(tId, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 4000
      });

      console.error("Error while login: ", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <form noValidate>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="phone-login">Phone</InputLabel>
              <OutlinedInput
                id="phone-login"
                type="text"
                value={formData.phone}
                name="phone"
                onChange={handleChange}
                placeholder="Enter Phone"
                fullWidth
              />
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="password-login">Password</InputLabel>
              <OutlinedInput
                id="password-login"
                fullWidth
                type={showPassword ? "text" : "password"}
                value={formData.password}
                name="password"
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      color="secondary"
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="Enter password"
              />
            </Stack>
          </Grid>

          <Grid sx={{ mt: -1 }} size={12}>
            <Stack
              direction="row"
              sx={{ gap: 2, alignItems: "baseline", justifyContent: "space-between" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    name="checked"
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="h6">Keep me sign in</Typography>}
              />
              <Link variant="h6" component={RouterLink} to="#" color="text.primary">
                Forgot Password?
              </Link>
            </Stack>
          </Grid>

          <Grid size={12}>
            <AnimateButton>
              <Button
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      </form>

      {/* ✅ Toast Container */}
      <ToastContainer position="top-right" />
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
