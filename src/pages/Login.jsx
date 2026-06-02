import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography, Alert,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useAuth } from "../functions/useAuth";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("staff");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();

  // Already logged in — redirect
  if (role) return <Navigate to={role === "admin" ? "/admin" : "/staff"} replace />;

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login(selectedRole, password);
      navigate(selectedRole === "admin" ? "/admin" : "/staff");
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e8eaf6 0%, #fce4ec 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card elevation={6} sx={{ borderRadius: 4, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <Box sx={{ background: "linear-gradient(90deg, #3949ab, #1e88e5)", px: 4, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <CreditCardIcon sx={{ color: "#fff", fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="white">Card Manager</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>Sign in to continue</Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>Select your role</Typography>
              <ToggleButtonGroup
                value={selectedRole}
                exclusive
                onChange={(_, v) => v && setSelectedRole(v)}
                fullWidth
              >
                <ToggleButton value="admin" sx={{ gap: 1 }}>
                  <AdminPanelSettingsIcon fontSize="small" /> Admin
                </ToggleButton>
                <ToggleButton value="staff" sx={{ gap: 1 }}>
                  <BadgeIcon fontSize="small" /> Staff
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

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
              sx={{ borderRadius: 2 }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
