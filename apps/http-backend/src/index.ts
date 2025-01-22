import express from "express";
import userRouter from "./routes/userRoute";
import createRoomRouter from "./routes/create-room";

const app = express();

app.use(express.json());
app.use("/api/v1/user", userRouter );
app.use("/api/v1/room", createRoomRouter);

app.listen(3004, () => {
    console.log("Server is running on port 3000");
});
