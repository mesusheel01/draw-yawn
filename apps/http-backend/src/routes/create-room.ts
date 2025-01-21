import { Router } from "express";
import userMiddleware from "../middlewares";
import { prismaClient } from "@repo/database-config/db";


const router:Router = Router();


router.use(userMiddleware);

router.get("/",async (req, res) => {
    //@ts-ignore
    const {roomName, userId} = req

    try {
        const room = await prismaClient.room.create({
            data:{
                slug: roomName,
                adminId: userId
            }
        })
        res.status(200).json({
            roomId: room.id
        })
    } catch (error) {
        res.status(411).json({
            message:"Room already exists!"
        })
    }
});

export default router;
