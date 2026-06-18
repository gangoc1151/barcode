import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Staff1Login() {
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "staff") { navigate("/staff", { replace: true }); return; }
    login("staff1").then(() => navigate("/staff", { replace: true })).catch(() => {});
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8f5e9 0%, #fce4ec 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CreditCardIcon sx={{ color: "#1b5e20", fontSize: 48 }} />
      <CircularProgress sx={{ color: "#1b5e20" }} />
      <Typography color="#1b5e20" fontWeight={600}>Signing in as Staff 1…</Typography>
    </Box>
  );
}
