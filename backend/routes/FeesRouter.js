import express from "express";
import {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeesInRange,
  getActiveFeesToday,
} from "../Controllers/FeesController.js";

const feesRouter = express.Router();

feesRouter.post("/", createFee);
feesRouter.get("/active", getActiveFeesToday);
feesRouter.get("/", getAllFees);
feesRouter.get("/range*", getFeesInRange);
feesRouter.get("/:id", getFeeById);
feesRouter.put("/:id", updateFee);
feesRouter.delete("/:id", deleteFee);

export default feesRouter;
