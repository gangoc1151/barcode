import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Admin2Login() {
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") { navigate("/admin", { replace: true }); return; }
    login("admin2").then(() => navigate("/admin", { replace: true })).catch(() => {});
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0f2f1 0%, #fce4ec 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CreditCardIcon sx={{ color: "#00695c", fontSize: 48 }} />
      <CircularProgress sx={{ color: "#00695c" }} />
      <Typography color="#00695c" fontWeight={600}>Signing in as Admin 2…</Typography>
    </Box>
  );
}
