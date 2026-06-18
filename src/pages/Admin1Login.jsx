import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Admin1Login() {
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") { navigate("/admin", { replace: true }); return; }
    login("admin1").then(() => navigate("/admin", { replace: true })).catch(() => {});
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fce4ec 0%, #e8eaf6 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CreditCardIcon sx={{ color: "#6a1b9a", fontSize: 48 }} />
      <CircularProgress sx={{ color: "#6a1b9a" }} />
      <Typography color="#6a1b9a" fontWeight={600}>Signing in as Admin 1…</Typography>
    </Box>
  );
}
