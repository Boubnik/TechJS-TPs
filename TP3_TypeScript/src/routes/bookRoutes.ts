import express from "express";
import { addBook, getBooks } from "../controllers/bookController";

const router = express.Router();

router.post("/", addBook);
router.get("/", getBooks);

export default router;
