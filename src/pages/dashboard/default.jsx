import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// material-ui
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";

// icons
import UserOutlined from "@ant-design/icons/UserOutlined";
import ShopOutlined from "@ant-design/icons/ShopOutlined";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import CreditCardOutlined from "@ant-design/icons/CreditCardOutlined";
import GiftOutlined from "@ant-design/icons/GiftOutlined";
import StarOutlined from "@ant-design/icons/StarOutlined";
import SyncOutlined from "@ant-design/icons/SyncOutlined";

// project imports
import MainCard from "components/MainCard";
import AnalyticEcommerce from "components/cards/statistics/AnalyticEcommerce";
import MonthlyBarChart from "sections/dashboard/default/MonthlyBarChart";
import ReportAreaChart from "sections/dashboard/default/ReportAreaChart";
import UniqueVisitorCard from "sections/dashboard/default/UniqueVisitorCard";
import SaleReportCard from "sections/dashboard/default/SaleReportCard";
import OrdersTable from "sections/dashboard/default/OrdersTable";

// endpoints
import { EndPoint } from "../../api/endpoints";

// optional toast
import { toast } from "react-toastify";

const pickList = (data) =>
  Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];

const fmt = (n) => new Intl.NumberFormat().format(n || 0);

export default function DashboardDefault() {
  const navigate = useNavigate();
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSubscriptions: 0,
    totalWallets: 0,
    totalPaymentAccounts: 0,
    totalReviews: 0,
    totalPromotions: 0
  });

  useEffect(() => {
    if (!access || !refresh) {
      navigate("/login", { replace: true });
      return;
    }
    fetchDashboard(access);
    // eslint-disable-next-line
  }, [navigate]);

  const fetchDashboard = async (token) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        usersRes,
        businessesRes,
        subsRes,
        walletsRes,
        payAccRes,
        reviewsRes,
        promosRes
      ] = await Promise.all([
        axios.get(EndPoint.USERS_LIST, { headers }),
        axios.get(EndPoint.BUSINESSES_LIST, { headers }),
        axios.get(EndPoint.SUBSCRIPTIONS_LIST, { headers }),
        axios.get(EndPoint.ADMIN_WALLETS_LIST, { headers }),
        axios.get(EndPoint.PAYMENT_ACCOUNTS_ADMIN_LIST, { headers }),
        axios.get(EndPoint.ADMIN_REVIEWS_LIST, { headers }),
        axios.get(EndPoint.PROMOTIONS_ADMIN_LIST, { headers })
      ]);

      const users = pickList(usersRes.data);
      const businesses = pickList(businessesRes.data);
      const subs = pickList(subsRes.data);
      const wallets = pickList(walletsRes.data);
      const payAcc = pickList(payAccRes.data);
      const reviews = pickList(reviewsRes.data);
      const promos = pickList(promosRes.data);

      setStats({
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        totalSubscriptions: subs.length,
        totalWallets: wallets.length,
        totalPaymentAccounts: payAcc.length,
        totalReviews: reviews.length,
        totalPromotions: promos.length
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err?.response?.data || err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login", { replace: true });
        return;
      }

      toast?.error?.("Dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(
    () => [
      {
        title: "Total Users",
        count: fmt(stats.totalUsers),
        icon: <UserOutlined />,
        hint: "All registered users"
      },
      {
        title: "Total Businesses",
        count: fmt(stats.totalBusinesses),
        icon: <ShopOutlined />,
        hint: "Shops / Businesses"
      },
      {
        title: "Total Subscriptions",
        count: fmt(stats.totalSubscriptions),
        icon: <GiftOutlined />,
        hint: "Active & history"
      },
      {
        title: "Total Wallets",
        count: fmt(stats.totalWallets),
        icon: <WalletOutlined />,
        hint: "Points wallets"
      }
    ],
    [stats]
  );

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {/* Header */}
      <Grid item xs={12}>
        <MainCard>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
            <Box>
              <Typography variant="h4">Dashboard</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  label={loading ? "Loading..." : "Live from API"}
                  color={loading ? "warning" : "success"}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {lastUpdated ? `Updated: ${lastUpdated.toLocaleString()}` : "Not updated yet"}
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              startIcon={<SyncOutlined spin={loading} />}
              disabled={loading}
              onClick={() => fetchDashboard(access)}
            >
              Refresh
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      {/* KPI Cards */}
      {kpis.map((kpi) => (
        <Grid key={kpi.title} item xs={12} sm={6} lg={3}>
          {loading ? (
            <MainCard>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="70%" height={22} />
            </MainCard>
          ) : (
            <MainCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="text.secondary">
                  {kpi.title}
                </Typography>
                <Box sx={{ fontSize: 20, opacity: 0.85 }}>{kpi.icon}</Box>
              </Stack>

              <Typography variant="h3" sx={{ mt: 1 }}>
                {kpi.count}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {kpi.hint}
              </Typography>
            </MainCard>
          )}
        </Grid>
      ))}

      {/* Row 2 */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard content={false}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Traffic Overview</Typography>
              <Typography variant="caption" color="text.secondary">
                (static chart for now)
              </Typography>
            </Stack>
          </Box>
          <UniqueVisitorCard />
        </MainCard>
      </Grid>

      <Grid item xs={12} md={5} lg={4}>
        <MainCard content={false}>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h5">Quick Stats</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Small operational totals
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <CreditCardOutlined />
                  <Typography>Payment Accounts</Typography>
                </Stack>
                <Typography fontWeight={700}>{fmt(stats.totalPaymentAccounts)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <StarOutlined />
                  <Typography>Reviews</Typography>
                </Stack>
                <Typography fontWeight={700}>{fmt(stats.totalReviews)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <GiftOutlined />
                  <Typography>Promotions</Typography>
                </Stack>
                <Typography fontWeight={700}>{fmt(stats.totalPromotions)}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* template chart (static) */}
          <MonthlyBarChart />
        </MainCard>
      </Grid>

      {/* Row 3 */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard content={false}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="h5">Recent Activities</Typography>
            <Typography variant="caption" color="text.secondary">
              (template table — later connect to real list endpoint)
            </Typography>
          </Box>
          <OrdersTable />
        </MainCard>
      </Grid>

      <Grid item xs={12} md={5} lg={4}>
        <MainCard content={false}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="h5">Analytics</Typography>
            <Typography variant="caption" color="text.secondary">
              (template chart)
            </Typography>
          </Box>
          <ReportAreaChart />
        </MainCard>
      </Grid>

      {/* Row 4 */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard content={false}>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="h5">Sales</Typography>
            <Typography variant="caption" color="text.secondary">
              (template — later wire to sales API)
            </Typography>
          </Box>
          <SaleReportCard />
        </MainCard>
      </Grid>
    </Grid>
  );
}