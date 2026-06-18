import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Staff2Login() {
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "staff") { navigate("/staff", { replace: true }); return; }
    login("staff2").then(() => navigate("/staff", { replace: true })).catch(() => {});
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff8e1 0%, #e0f2f1 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CreditCardIcon sx={{ color: "#e65100", fontSize: 48 }} />
      <CircularProgress sx={{ color: "#e65100" }} />
      <Typography color="#e65100" fontWeight={600}>Signing in as Staff 2…</Typography>
    </Box>
  );
}
