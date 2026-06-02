import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Stack, TextField,
  Typography, Alert,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Admin2Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") navigate("/admin", { replace: true });
  }, [role, navigate]);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login("admin2", password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0f2f1 0%, #fce4ec 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card elevation={6} sx={{ borderRadius: 4, width: "100%", maxWidth: 400, overflow: "hidden" }}>
        <Box sx={{ background: "linear-gradient(90deg, #00695c, #00838f)", px: 4, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <CreditCardIcon sx={{ color: "#fff", fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="white">Admin 2</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>Card Manager — Admin Portal</Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ background: "#e0f2f1", borderRadius: 2, px: 2, py: 1.5 }}>
              <AdminPanelSettingsIcon sx={{ color: "#00695c" }} />
              <Typography fontWeight={600} color="#00695c">Admin 2 Account</Typography>
            </Stack>

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
              disabled={!password || loading}
              sx={{ borderRadius: 2, background: "#00695c", "&:hover": { background: "#004d40" } }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
