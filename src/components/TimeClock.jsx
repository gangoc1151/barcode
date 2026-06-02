import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Chip, CircularProgress, Divider, Paper,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { apiGetTodayPunches, apiCheckIn, apiCheckOut } from "../functions/api";

function fmt(isoStr) {
  return new Date(isoStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function calcTotalMinutes(punches) {
  let total = 0;
  let inTime = null;
  for (const p of punches) {
    if (p.type === "in") {
      inTime = new Date(p.timestamp);
    } else if (p.type === "out" && inTime) {
      total += (new Date(p.timestamp) - inTime) / 60000;
      inTime = null;
    }
  }
  // If still clocked in, count time until now
  if (inTime) total += (Date.now() - inTime) / 60000;
  return total;
}

function fmtDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.floor((minutes * 60) % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimeClock() {
  const [now, setNow] = useState(new Date());
  const [punches, setPunches] = useState([]);
  const [status, setStatus] = useState("out"); // "in" or "out"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await apiGetTodayPunches();
      setPunches(data.punches);
      setStatus(data.status);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handlePunch(type) {
    setBusy(true);
    setError("");
    try {
      if (type === "in") await apiCheckIn();
      else await apiCheckOut();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const totalMins = calcTotalMinutes(punches);
  const checkedIn = status === "in";

  return (
    <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden", mt: 3 }}>
      {/* Header */}
      <Box sx={{ background: "linear-gradient(90deg, #1b5e20, #388e3c)", px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AccessTimeIcon sx={{ color: "#fff", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="white">Time Clock</Typography>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Live clock */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h3" fontFamily="monospace" fontWeight={700} color="#1b5e20" letterSpacing={2}>
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Typography>
        </Box>

        {/* Status badge */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Chip
            label={checkedIn ? "● Clocked In" : "○ Clocked Out"}
            color={checkedIn ? "success" : "default"}
            variant={checkedIn ? "filled" : "outlined"}
            sx={{ fontSize: 15, px: 2, py: 0.5, fontWeight: 600 }}
          />
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Button
            variant="contained"
            size="large"
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
            disabled={checkedIn || busy}
            onClick={() => handlePunch("in")}
            sx={{
              borderRadius: 2, px: 4, minWidth: 140,
              background: "#2e7d32", "&:hover": { background: "#1b5e20" },
              "&:disabled": { background: "#c8e6c9", color: "#aaa" },
            }}
          >
            Check In
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <LogoutIcon />}
            disabled={!checkedIn || busy}
            onClick={() => handlePunch("out")}
            sx={{
              borderRadius: 2, px: 4, minWidth: 140,
              background: "#c62828", "&:hover": { background: "#b71c1c" },
              "&:disabled": { background: "#ffcdd2", color: "#aaa" },
            }}
          >
            Check Out
          </Button>
        </Stack>

        {error && (
          <Typography color="error" textAlign="center" mb={2} variant="body2">{error}</Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Today's total */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">TODAY'S TOTAL</Typography>
          <Typography variant="h6" fontFamily="monospace" fontWeight={700} color="#2e7d32">
            {fmtDuration(checkedIn ? totalMins : totalMins)}
          </Typography>
        </Stack>

        {/* Punch log */}
        {punches.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#f5f5f5" }}>
                <TableCell>#</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {punches.map((p, i) => {
                // Calculate duration between this out and previous in
                let dur = "";
                if (p.type === "out" && i > 0) {
                  const prev = punches[i - 1];
                  if (prev.type === "in") {
                    const mins = (new Date(p.timestamp) - new Date(prev.timestamp)) / 60000;
                    dur = fmtDuration(mins);
                  }
                }
                return (
                  <TableRow key={p.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.type === "in" ? "In" : "Out"}
                        size="small"
                        color={p.type === "in" ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{fmt(p.timestamp)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace", color: "#555" }}>{dur}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No punches recorded today.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
