import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
    type: 'rect';
    x: number;
    y: number;
    height: number;
    width: number;
} | {
    type: 'circle';
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type:"arrow";
    startX: number;
    startY: number;
}

export async function initCanvas(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas context could not be initialized.");
        return;
    }

    let existingShape: Shape[] = await getExistingShape(roomId);

    // Handle incoming WebSocket messages
    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);

            if (message.type === 'chat' && message.message) {
                const parsedShape = JSON.parse(message.message);
                if (parsedShape.shape) {
                    existingShape.push(parsedShape.shape);
                    clearCanvas(existingShape, canvas, ctx);
                }
            }
        } catch (error) {
            console.error("Error parsing shape from socket message:", error);
        }
    };

    // Initial canvas rendering
    clearCanvas(existingShape, canvas, ctx);

    let isClicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        isClicked = true;
        startX = e.offsetX; // Use offsetX for accurate canvas coordinates
        startY = e.offsetY;
    });

    canvas.addEventListener("mouseup", (e) => {
        if (!isClicked) return;
        isClicked = false;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;
        // @ts-ignore
        const selectionTool = window.selectionTool
        let shape: Shape | null = null;
        if (selectionTool === "rect") {
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                height,
                width
            };
        } else if (selectionTool === "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2; // Use diagonal for radius
            shape = {
                type: "circle",
                radius,
                centerX: startX + width / 2,
                centerY: startY + height / 2
            };
        }

        if (shape) {
            existingShape.push(shape);
            socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape }),
                    roomId
                })
            );
            clearCanvas(existingShape, canvas, ctx);
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isClicked) return;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        clearCanvas(existingShape, canvas, ctx);
// @ts-ignore
        const selectionTool = window.selectionTool
        ctx.strokeStyle = "rgba(255, 255, 255)";
        if (selectionTool === "rect") {
            ctx.strokeRect(startX, startY, width, height);
        } else if (selectionTool === "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2;
            const centerX = startX + width / 2;
            const centerY = startY + height / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
    });
}

function clearCanvas(
    existingShape: Shape[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShape.forEach((shape) => {
        ctx.strokeStyle = "rgba(255,255,255)";
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle" && shape.radius > 0) {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
    });
}

async function getExistingShape(roomId: string): Promise<Shape[]> {
    try {
        const response = await axios.get(
            `${HTTP_BACKEND_URL}api/v1/room/chats/${roomId}`,
            {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NmYyN2EzNi01Mzg1LTQ5ODgtOWU4NC0zYWI5YTg3ZjdlMWYiLCJpYXQiOjE3Mzc5MTg1NTd9.u_B0b3LPpku_lTGnysXczIwmccaEXqICA-llTI7IJoo"
                }
            }
        );

        const messages = response.data.messages || [];
        return messages
            .map((msg: { message: string }) => {
                try {
                    const data = JSON.parse(msg.message);
                    return data.shape || null;
                } catch {
                    console.error("Invalid shape data:", msg.message);
                    return null;
                }
            })
            .filter((shape: Shape | null) => shape !== null);
    } catch (error) {
        console.error("Error fetching existing shapes:", error);
        return [];
    }
}
