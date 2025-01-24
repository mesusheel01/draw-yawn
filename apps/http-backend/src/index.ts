import express from "express";
import userRouter from "./routes/userRoute";
import createRoomRouter from "./routes/create-room";
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors())
app.use("/api/v1/user", userRouter );
app.use("/api/v1/room", createRoomRouter);

app.listen(3004, () => {
    console.log("Server is running on port 3004");
});
