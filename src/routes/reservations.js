const express = require("express");
const router = express.Router();
const {
  reserveSeats,
  cancelReservation,
  getEventSummary,
} = require("../controllers/reservationController");

// GET /reservations
router.get("/", getEventSummary);

// POST /reservations
router.post("/", reserveSeats);

// DELETE /reservations/:reservationId
router.delete("/:reservationId", cancelReservation);

module.exports = router;
