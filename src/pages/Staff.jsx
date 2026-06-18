import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, Paper, Stack, Typography, IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TimeClock from "../components/TimeClock";
import { apiGetCurrentCard, apiMarkSeen } from "../functions/api";

export default function Staff() {
  const [card, setCard] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCurrent(); }, []);

  async function fetchCurrent() {
    try {
      const data = await apiGetCurrentCard();
      setCard(data);
    } catch {
      setCard(null);
    }
  }

  async function handleMarkSeen() {
    if (!card) return;
    setLoading(true);
    try {
      await apiMarkSeen(card.id);
      setOpen(false);
      setCard(undefined);
      await fetchCurrent();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6 0%, #fce4ec 100%)", py: 4 }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CreditCardIcon sx={{ color: "#3949ab" }} />
            <Typography variant="h6" fontWeight={700} color="#3949ab">Staff View</Typography>
          </Stack>
          <IconButton onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Loading */}
        {card === undefined && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No cards left */}
        {card === null && (
          <Paper elevation={3} sx={{ borderRadius: 4, p: 6, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#43a047", mb: 2 }} />
            <Typography variant="h6" fontWeight={600}>All done!</Typography>
            <Typography color="text.secondary">No more cards available in the queue.</Typography>
          </Paper>
        )}

        {/* Card ready — show button */}
        {card && (
          <Paper elevation={4} sx={{ borderRadius: 4, p: 5, textAlign: "center" }}>
            <CreditCardIcon sx={{ fontSize: 56, color: "#3949ab", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} mb={1}>Card Ready</Typography>
            <Typography color="text.secondary" mb={3}>
              A card is available in the queue. Click below to view its details.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<VisibilityIcon />}
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 2, px: 4 }}
            >
              View Card
            </Button>
          </Paper>
        )}

        {/* Time Clock */}
        <TimeClock />
      </Container>

      {/* Card Details Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {card && (
          <>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ background: "linear-gradient(135deg, #1a237e, #1565c0)", p: 3, color: "#fff" }}>
                {/* Card Number */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 2, fontSize: 11 }}>CARD NUMBER</Typography>
                  <Typography variant="h4" fontFamily="monospace" fontWeight={700} letterSpacing={4} mt={0.5}>
                    {card.digits.replace(/(.{4})/g, "$1 ").trim()}
                  </Typography>
                </Box>

                {/* Expiry */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>EXPIRY DATE</Typography>
                  <Typography variant="h4" fontFamily="monospace" fontWeight={700} letterSpacing={4} mt={0.5}>
                    {card.month} / {card.year}
                  </Typography>
                </Box>

                {/* CVV */}
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 2, fontSize: 11, fontWeight: 700 }}>CVV</Typography>
                  <Typography variant="h4" fontFamily="monospace" fontWeight={700} letterSpacing={4} mt={0.5}>
                    {card.cvv}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
              <Button
                variant="contained"
                onClick={handleMarkSeen}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                sx={{ borderRadius: 2, background: "#43a047", "&:hover": { background: "#388e3c" }, flex: 1 }}
              >
                {loading ? "Processing…" : "Mark as Seen & Next"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
