// src/pages/paymentAccount/view/PaymentAccountsPublicList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, Divider, Stack, Chip } from "@mui/material";
import { EndPoint } from "../../../api/endpoints";
import { ToastContainer, toast } from "react-toastify";

const safeList = (data) => {
  const list = Array.isArray(data) ? data : data?.results || data?.data || data?.items || [];
  return Array.isArray(list) ? list : [];
};

// useEffect(() => {
//     const access = localStorage.getItem("access_token");
//     const refresh = localStorage.getItem("refresh_token");
//     if (!access || !refresh) {
//       navigate("/login", { replace: true });
//       return;
//     }
//     fetchList(access);
//     // eslint-disable-next-line
//   }, [navigate]);

const PaymentAccountsPublicList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(EndPoint.PAYMENT_ACCOUNTS_PUBLIC_LIST);
      setRows(safeList(res.data));
    } catch (e) {
      toast.error("Failed to load payment accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5, px: 2 }}>
        <Paper elevation={2} sx={{ p: 3, width: 820, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900}>
            Payment Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Available bank accounts for subscription payments.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Typography align="center" color="text.secondary" py={4}>
              Loading...
            </Typography>
          ) : rows.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>
              No payment accounts
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {rows.map((r) => (
                <Paper key={r.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography fontWeight={900}>{r.bank_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.account_name} • {r.account_number}
                      </Typography>
                    </Box>
                    <Chip label={`Order: ${r.order ?? 0}`} variant="outlined" />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      <ToastContainer position="top-right" />
    </>
  );
};

export default PaymentAccountsPublicList;
