import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project imports
import ProfileTab from "./ProfileTab";
import SettingTab from "./SettingTab";
import Avatar from "components/@extended/Avatar";
import MainCard from "components/MainCard";
import Transitions from "components/@extended/Transitions";
import IconButton from "components/@extended/IconButton";

// assets
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import avatar1 from "assets/images/users/avatar-1.png";

import { useNavigate } from "react-router";
import axios from "axios";
import { EndPoint } from "../../../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`
  };
}

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

  // ✅ ME data
  const [me, setMe] = useState({
    username: "",
    phone: "",
    role: "",
    email: ""
  });

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) return;

    const fetchMe = async () => {
      try {
        const res = await axios.get(EndPoint.ME, {
          headers: { Authorization: `Bearer ${access}` }
        });
        // backend returns: { id, username, phone, email, role }
        setMe(res.data || {});
      } catch (err) {
        console.error(err?.response?.data || err);
        // token invalid => logout to login
        if (err?.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login", { replace: true });
        }
      }
    };

    fetchMe();
  }, [navigate]);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleChange = (event, newValue) => setValue(newValue);

  const handleLogout = async () => {
    const tId = toast.loading("Logging out...");

    try {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!access || !refresh) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toast.update(tId, { render: "Logged out", type: "success", isLoading: false, autoClose: 1500 });
        navigate("/login");
        return;
      }

      await axios.post(
        EndPoint.LOGOUT,
        { refresh },
        { headers: { Authorization: `Bearer ${access}` } }
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      toast.update(tId, { render: "Logout success 👋", type: "success", isLoading: false, autoClose: 1500 });
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Logout failed (token expired ဖြစ်နိုင်ပါတယ်)";

      toast.update(tId, { render: msg, type: "error", isLoading: false, autoClose: 3500 });
      navigate("/login");
      console.error("Logout error:", error);
    }
  };

  // ✅ display name fallback
  const displayName = me?.username || me?.phone || "User";
  const displayRole = me?.role ? me.role.toUpperCase() : "ADMIN";

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: "auto" }}>
        <Tooltip title="Profile" disableInteractive>
          <ButtonBase
            sx={(theme) => ({
              p: 0.25,
              borderRadius: 1,
              "&:focus-visible": { outline: `2px solid ${theme.vars.palette.secondary.dark}`, outlineOffset: 2 }
            })}
            aria-label="open profile"
            ref={anchorRef}
            aria-controls={open ? "profile-grow" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <Avatar alt="profile user" src={avatar1} size="sm" sx={{ "&:hover": { outline: "1px solid", outlineColor: "primary.main" } }} />
          </ButtonBase>
        </Tooltip>

        <Popper
          placement="bottom-end"
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{
            modifiers: [{ name: "offset", options: { offset: [0, 9] } }]
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
              <Paper sx={(theme) => ({ boxShadow: theme.vars.customShadows.z1, width: 290, minWidth: 240, maxWidth: { xs: 250, md: 290 } })}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <CardContent sx={{ px: 2.5, pt: 3 }}>
                      <Grid container sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Grid>
                          <Stack direction="row" sx={{ gap: 1.25, alignItems: "center" }}>
                            <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                            <Stack>
                              {/* ✅ John Doe => ME.username */}
                              <Typography variant="h6">{displayName}</Typography>

                              {/* ✅ optional role/phone */}
                              <Typography variant="body2" color="text.secondary">
                                {displayRole} {me?.phone ? `• ${me.phone}` : ""}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>

                        <Grid>
                          <Tooltip title="Logout">
                            <IconButton size="large" sx={{ color: "text.primary" }} onClick={handleLogout}>
                              <LogoutOutlined />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs variant="fullWidth" value={value} onChange={handleChange} aria-label="profile tabs">
                        <Tab
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            textTransform: "capitalize",
                            gap: 1.25,
                            "& .MuiTab-icon": { marginBottom: 0 }
                          }}
                          icon={<UserOutlined />}
                          label="Profile"
                          {...a11yProps(0)}
                        />
                        <Tab
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            textTransform: "capitalize",
                            gap: 1.25,
                            "& .MuiTab-icon": { marginBottom: 0 }
                          }}
                          icon={<SettingOutlined />}
                          label="Setting"
                          {...a11yProps(1)}
                        />
                      </Tabs>
                    </Box>

                    <TabPanel value={value} index={0} dir={theme.direction}>
                      <ProfileTab />
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                      <SettingTab />
                    </TabPanel>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number,
  other: PropTypes.any
};
