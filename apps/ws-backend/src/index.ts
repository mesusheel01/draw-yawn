import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8080 });


wss.on("connection", (ws, request) => {
    const url = request.url;
    if(!url) return;
    const queryParams = new URLSearchParams(url);
    const token = queryParams.get("token");
    if(!token) return;
    const decoded = jwt.verify(token, JWT_SECRET);
    if(!decoded || !decoded.userId) {
        ws.close();
        return;
    }
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
    });
});
