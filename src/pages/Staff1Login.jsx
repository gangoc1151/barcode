import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Stack, TextField,
  Typography, Alert,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Staff1Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "staff") navigate("/staff", { replace: true });
  }, [role, navigate]);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login("staff1", password);
      navigate("/staff", { replace: true });
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8f5e9 0%, #fce4ec 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card elevation={6} sx={{ borderRadius: 4, width: "100%", maxWidth: 400, overflow: "hidden" }}>
        <Box sx={{ background: "linear-gradient(90deg, #1b5e20, #388e3c)", px: 4, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <CreditCardIcon sx={{ color: "#fff", fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="white">Staff 1</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>Card Manager — Staff Portal</Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ background: "#e8f5e9", borderRadius: 2, px: 2, py: 1.5 }}>
              <BadgeIcon sx={{ color: "#1b5e20" }} />
              <Typography fontWeight={600} color="#1b5e20">Staff 1 Account</Typography>
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
              sx={{ borderRadius: 2, background: "#2e7d32", "&:hover": { background: "#1b5e20" } }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
