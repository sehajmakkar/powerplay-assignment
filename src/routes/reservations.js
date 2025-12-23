const express = require("express");
const router = express.Router();
const {
  reserveSeats,
  cancelReservation,
  getEventSummary,
} = require("../controllers/reservationController");
const validateReservation = require("../middleware/validateReservation");

// GET /reservations - Event summary
router.get("/", getEventSummary);

// POST /reservations - Reserve seats
router.post("/", validateReservation, reserveSeats);

// DELETE /reservations/:reservationId - Cancel reservation
router.delete("/:reservationId", cancelReservation);

module.exports = router;
