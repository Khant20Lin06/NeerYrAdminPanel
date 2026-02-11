import PropTypes from 'prop-types';
// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import ProfileOutlined from '@ant-design/icons/ProfileOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { EndPoint } from '../../../../../api/endpoints';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab() {
  
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      const tId = toast.loading("Logging out...");
  
      try {
        const access = localStorage.getItem("access_token");
        const refresh = localStorage.getItem("refresh_token");
  
        // access မရှိရင် frontend logout ပဲလုပ်
        if (!access || !refresh) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
  
          toast.update(tId, {
            render: "Logged out",
            type: "success",
            isLoading: false,
            autoClose: 1500,
          });
  
          navigate("/login");
          return;
        }
  
        // ✅ backend expects: { "refresh": "<token>" }
        await axios.post(
          EndPoint.LOGOUT,
          { refresh },
          {
            headers: {
              Authorization: `Bearer ${access}`, // ✅ correct
            },
          }
        );
  
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
  
        toast.update(tId, {
          render: "Logout success 👋",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
  
        navigate("/login");
      } catch (error) {
        // access expired ဖြစ်ရင် 401 လာနိုင် => still clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
  
        const msg =
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          "Logout failed (token expired ဖြစ်နိုင်ပါတယ်)";
  
        toast.update(tId, {
          render: msg,
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
  
        navigate("/login");
        console.error("Logout error:", error);
      }
    };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton>
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>
        <ListItemText primary="Social Profile" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <WalletOutlined />
        </ListItemIcon>
        <ListItemText primary="Billing" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" onClick={handleLogout} />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
