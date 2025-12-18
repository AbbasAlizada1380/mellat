import express from "express";
import {
  createAthlete,
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
} from "../Controllers/AthletesController.js";

const athleteRouter = express.Router();

athleteRouter.post("/", createAthlete);
athleteRouter.get("/", getAllAthletes);
athleteRouter.get("/:id", getAthleteById);
athleteRouter.put("/:id", updateAthlete);
athleteRouter.delete("/:id", deleteAthlete);

export default athleteRouter;
