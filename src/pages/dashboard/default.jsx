import { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import MainCard from 'components/MainCard';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { EndPoint } from "../../api/endpoints"; // ✅ path ကို သင့် project အတိုင်း ချိန်ပါ

export default function DashboardDefault() {
  const navigate = useNavigate();

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSubscriptions: 0,
    totalWallets: 0
  });

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!access || !refresh) {
      navigate("/login", { replace: true });
      return;
    }

    fetchDashboardStats(access);
    // eslint-disable-next-line
  }, []);

  const pickList = (data) => {
    // backend က array ပြန်ရင် array သုံး
    if (Array.isArray(data)) return data;
    // pagination ပုံစံဖြစ်နိုင်လို့ fallback
    return data?.results || data?.data || data?.items || [];
  };

  const fetchDashboardStats = async (access) => {
    setLoadingStats(true);

    try {
      const headers = { Authorization: `Bearer ${access}` };

      // ✅ ၄ ခုကို တပြိုင်နက်တည်းခေါ် (Promise.all)
      const [usersRes, businessRes, subsRes, walletsRes] = await Promise.all([
        axios.get(EndPoint.USERS_LIST, { headers }),                 // API_V1
        axios.get(EndPoint.BUSINESSES_LIST, { headers }),            // API_V2
        axios.get(EndPoint.SUBSCRIPTIONS_LIST, { headers }),         // API_V2
        axios.get(EndPoint.ADMIN_WALLETS_LIST, { headers })          // API_V2 (admin)
      ]);

      const users = pickList(usersRes.data);
      const businesses = pickList(businessRes.data);
      const subs = pickList(subsRes.data);
      const wallets = pickList(walletsRes.data);

      setStats({
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        totalSubscriptions: subs.length,
        totalWallets: wallets.length
      });
    } catch (err) {
      // ❗ 403/401 ဖြစ်ရင် token မမှန်တာ / admin မဟုတ်တာ / backend permission issue ဖြစ်နိုင်
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // token expire / permission
        navigate("/login", { replace: true });
      } else {
        console.error("Dashboard stats error:", err?.response?.data || err);
      }
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Dashboard</Typography>
          <Chip label={loadingStats ? "Loading..." : "Live"} variant="outlined" />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Users"
          count={loadingStats ? "..." : String(stats.totalUsers)}
          percentage={0}
          extra="API_V1"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Businesses"
          count={loadingStats ? "..." : String(stats.totalBusinesses)}
          percentage={0}
          extra="API_V2"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Subscriptions"
          count={loadingStats ? "..." : String(stats.totalSubscriptions)}
          percentage={0}
          extra="API_V2"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Wallets"
          count={loadingStats ? "..." : String(stats.totalWallets)}
          percentage={0}
          extra="Admin"
        />
      </Grid>

      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Overview
              </Typography>
              <Typography variant="h3">
                {loadingStats ? "..." : `${stats.totalBusinesses} Businesses`}
              </Typography>
            </Stack>
          </Box>
          <MonthlyBarChart />
        </MainCard>
      </Grid>

      {/* row 3 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard />
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Divider />
          <ReportAreaChart />
        </MainCard>
      </Grid>
    </Grid>
  );
}
