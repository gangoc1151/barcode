import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";

function Home() {
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6 0%, #fce4ec 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Stack spacing={3} alignItems="center">
        <CreditCardIcon sx={{ fontSize: 56, color: "#3949ab" }} />
        <Typography variant="h4" fontWeight={700} color="#3949ab">Card Manager</Typography>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/admin" variant="contained" size="large" startIcon={<AdminPanelSettingsIcon />}
            sx={{ background: "#3949ab", "&:hover": { background: "#283593" }, borderRadius: 2, px: 4 }}>
            Admin
          </Button>
          <Button component={Link} to="/staff" variant="contained" size="large" startIcon={<PeopleIcon />}
            sx={{ background: "#43a047", "&:hover": { background: "#388e3c" }, borderRadius: 2, px: 4 }}>
            Staff
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

