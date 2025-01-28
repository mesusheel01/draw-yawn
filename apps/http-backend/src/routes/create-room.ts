import { Router } from "express";
import { prismaClient } from "@repo/database-config/db";
import { RoomSchema } from "@repo/common/types";
import { userMiddleware } from "../middlewares";


const router:Router = Router();


router.use(userMiddleware);

router.post("/", async (req, res) => {
    const parsedData = RoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data?.roomName,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

// saving messages in a room
router.get("/chats/:roomId", async(req, res)=>{
    try {
        const roomId = Number(req.params.roomId)
    const messages = await prismaClient.chat.findMany({
        where:{
            roomId:roomId
        },
        orderBy:{
            id:"desc"
        },
        take:1000
    })
    res.json({
        messages
    })
    } catch (error) {
        console.log(error)
        res.json({
            messages:[]
        })
    }
})

//slug to roomid
router.get('/:slug', async (req, res)=>{
    const slug = req.params.slug
    try {
        const room = await prismaClient.room.findFirst({
            where:{
                slug
            }
        })
        res.json({
            roomId: room?.id
        })
    } catch (error) {
        res.json({
            msg:"No id found!"
        })
    }
})

export default router;
