import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import userMiddleware from "../middlewares";


const router = Router();

router.use(userMiddleware);

router.post("/", (req, res) => {

    const roomId = uuidv4();
    res.json({ roomId });
});

export default router;
