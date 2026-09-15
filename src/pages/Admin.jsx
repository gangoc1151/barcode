import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Checkbox, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import PublishIcon from "@mui/icons-material/Publish";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LockIcon from "@mui/icons-material/Lock";
import { parseCard, maskCard } from "../functions/parseCard";
import { apiGetCards, apiPublishCards, apiDeleteCard, apiDeleteAllCards, apiToggleCardSeen } from "../functions/api";

let nextId = 1;
const newRow = (raw = "", seen = false, serverId = null) => ({ id: nextId++, raw, seen, serverId });

export default function Admin() {
  const [rows, setRows] = useState([newRow()]);
  const [selected, setSelected] = useState(new Set());
  const [viewCard, setViewCard] = useState(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [msg, setMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadCards = useCallback(async () => {
    try {
      const cards = await apiGetCards();
      if (cards.length > 0)
        setRows(cards.map((c) => newRow(`${c.digits}|${c.month}|${c.year}|${c.cvv}`, c.seen, c.id)));
    } catch {}
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  function showMsg(text) { setMsg(text); setTimeout(() => setMsg(""), 3500); }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const cards = await apiGetCards();
      setRows((prev) => prev.map((row) => {
        const match = cards.find((c) => c.id === row.serverId);
        return match ? { ...row, seen: match.seen } : row;
      }));
      showMsg("✅ Status refreshed.");
    } catch { showMsg("❌ Failed to refresh."); }
    finally { setRefreshing(false); }
  };

  // --- Selection ---
  const allIds = rows.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  // --- Delete selected ---
  const handleDeleteSelected = async () => {
    const toDelete = rows.filter((r) => selected.has(r.id));
    // Delete from server if published
    const serverDeletes = toDelete.filter((r) => r.serverId).map((r) => apiDeleteCard(r.serverId).catch(() => {}));
    await Promise.all(serverDeletes);
    setRows((prev) => {
      const remaining = prev.filter((r) => !selected.has(r.id));
      return remaining.length ? remaining : [newRow()];
    });
    setSelected(new Set());
    showMsg(`🗑 Deleted ${toDelete.length} card(s).`);
  };

  // --- Delete all ---
  const handleDeleteAll = async () => {
    setConfirmDeleteAll(false);
    try {
      await apiDeleteAllCards();
      setRows([newRow()]);
      setSelected(new Set());
      showMsg("🗑 All cards deleted.");
    } catch { showMsg("❌ Failed to delete all."); }
  };

  const addRow = () => setRows((r) => [...r, newRow()]);
  const deleteRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (row?.serverId) apiDeleteCard(row.serverId).catch(() => {});
    setRows((r) => r.length > 1 ? r.filter((row) => row.id !== id) : [newRow()]);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const handleImportPaste = () => {
    const lines = pasteText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length) setRows(lines.map((l) => newRow(l)));
    setPasteOpen(false); setPasteText("");
  };

  const handlePublish = async () => {
    const valid = rows.map((r) => parseCard(r.raw)).filter(Boolean);
    if (!valid.length) return;
    try {
      const result = await apiPublishCards(valid);
      setRows(result.cards.map((c) => newRow(`${c.digits}|${c.month}|${c.year}|${c.cvv}`, c.seen, c.id)));
      setSelected(new Set());
      showMsg(`✅ Published ${result.cards.length} cards to staff queue.`);
    } catch { showMsg("❌ Failed to publish."); }
  };

  const handleToggleSeen = async (row) => {
    if (!row.serverId) return; // can't toggle draft cards
    const newSeen = !row.seen;
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, seen: newSeen } : r));
    try {
      await apiToggleCardSeen(row.serverId, newSeen);
    } catch {
      // revert on failure
      setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, seen: row.seen } : r));
      showMsg("❌ Failed to update seen status.");
    }
  };

  const seenCount = rows.filter((r) => r.seen).length;
  const publishedCount = rows.filter((r) => r.serverId).length;
  const validRows = rows.filter((r) => parseCard(r.raw));

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e8eaf6 0%, #fce4ec 100%)", py: 4 }}>
      <Container maxWidth="xl">
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>

          {/* Header */}
          <Box sx={{ background: "linear-gradient(90deg, #3949ab, #1e88e5)", px: 4, py: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CreditCardIcon sx={{ color: "#fff", fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="white">Admin Panel</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>Format: Card|MM|YY|CVV</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<ContentPasteIcon />} onClick={() => setPasteOpen(true)}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>Paste List</Button>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>Add Row</Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={refreshing}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>Refresh</Button>
              {someSelected && (
                <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteSelected}
                  sx={{ background: "#e53935", "&:hover": { background: "#c62828" } }}>
                  Delete ({selected.size})
                </Button>
              )}
              <Button variant="outlined" startIcon={<DeleteSweepIcon />} onClick={() => setConfirmDeleteAll(true)}
                sx={{ color: "#ffcdd2", borderColor: "rgba(255,100,100,0.6)" }}>
                Delete All
              </Button>
              <Button variant="contained" startIcon={<PublishIcon />} onClick={handlePublish}
                disabled={!validRows.length}
                sx={{ background: "#43a047", "&:hover": { background: "#388e3c" } }}>
                Publish ({validRows.length})
              </Button>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>Home</Button>
            </Stack>
          </Box>

          {/* Stats */}
          <Box sx={{ px: 4, py: 1.5, background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="body2"><strong>Published:</strong> {publishedCount}</Typography>
              <Typography variant="body2" color="success.main"><strong>Seen:</strong> {seenCount}</Typography>
              <Typography variant="body2" color="error.main"><strong>Remaining:</strong> {publishedCount - seenCount}</Typography>
              {someSelected && <Typography variant="body2" color="primary"><strong>Selected:</strong> {selected.size}</Typography>}
              {msg && <Typography variant="body2">{msg}</Typography>}
            </Stack>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#fafafa" }}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
                  </TableCell>
                  <TableCell width={44}>#</TableCell>
                  <TableCell>Card Data</TableCell>
                  <TableCell width={100} align="center">Status</TableCell>
                  <TableCell width={110} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  const parsed = parseCard(row.raw);
                  const isSelected = selected.has(row.id);
                  return (
                    <TableRow key={row.id} hover selected={isSelected}
                      sx={{ background: isSelected ? "#e3f2fd" : row.seen ? "#f1f8e9" : "inherit" }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} onChange={() => toggleSelect(row.id)} />
                      </TableCell>
                      <TableCell><Typography color="text.secondary">{idx + 1}</Typography></TableCell>
                      <TableCell>
                        {parsed ? (
                          <Stack spacing={0.5}>
                            <Typography fontFamily="monospace" fontWeight={600}>
                              {maskCard(parsed.digits)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Expires {parsed.month}/{parsed.year}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color={row.raw.length > 0 ? "error.main" : "text.secondary"}>
                            {row.raw.length > 0 ? "Invalid format" : "No card data"}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.serverId
                          ? <Chip
                              label={row.seen ? "Seen" : "Unseen"}
                              size="small"
                              color={row.seen ? "success" : "default"}
                              variant={row.seen ? "filled" : "outlined"}
                              onClick={() => handleToggleSeen(row)}
                              sx={{ cursor: "pointer" }}
                            />
                          : <Chip label="Draft" size="small" color="warning" variant="outlined" />}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View"><span>
                            <IconButton color="primary" disabled={!parsed} onClick={() => setViewCard(parsed)}>
                              <VisibilityIcon />
                            </IconButton>
                          </span></Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" onClick={() => deleteRow(row.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* View Card Dialog */}
      <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {viewCard && (<>
          <DialogTitle>Card Details</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              <Box sx={{ background: "linear-gradient(135deg, #1a237e, #1565c0)", borderRadius: 3, p: 3, color: "#fff" }}>
                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>CARD NUMBER</Typography>
                <Typography variant="h5" fontFamily="monospace" letterSpacing={3} mt={0.5} mb={2}>
                  {viewCard.digits.replace(/(.{4})/g, "$1 ").trim()}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>EXPIRES</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarMonthIcon fontSize="small" /><Typography fontWeight={600} sx={{fontSize: '20px'}}>{viewCard.month}/{viewCard.year}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1 }}>CVV</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LockIcon fontSize="small" /><Typography fontWeight={600} sx={{fontSize: '20px'}}>{viewCard.cvv}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setViewCard(null)}>Close</Button>
          </DialogActions>
        </>)}
      </Dialog>

      {/* Confirm Delete All */}
      <Dialog open={confirmDeleteAll} onClose={() => setConfirmDeleteAll(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete All Cards?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove all cards from the queue. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteAll(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAll}>Delete All</Button>
        </DialogActions>
      </Dialog>

      {/* Paste List Dialog */}
      <Dialog open={pasteOpen} onClose={() => setPasteOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Paste Card List</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            One card per line — <code>Card|MM|YY|CVV</code>
          </Typography>
          <TextField multiline rows={10} fullWidth placeholder="4342601003804246|10|28|528"
            value={pasteText} onChange={(e) => setPasteText(e.target.value)}
            inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImportPaste} disabled={!pasteText.trim()}>Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
