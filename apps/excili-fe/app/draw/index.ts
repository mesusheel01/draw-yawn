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
    x: number;
    y: number;
    endX: number;
    endY: number;
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
                const parsedData = JSON.parse(message.message);
                if (parsedData.action === "delete") {
                    // Remove deleted shapes from local array
                    existingShape = existingShape.filter(shape =>
                        !parsedData.shapes.some((deletedShape: Shape) =>
                            JSON.stringify(deletedShape) === JSON.stringify(shape)
                        )
                    );
                    clearCanvas(existingShape, canvas, ctx);
                } else if (parsedData.shape) {
                    existingShape.push(parsedData.shape);
                    clearCanvas(existingShape, canvas, ctx);
                }
            }
        } catch (error) {
            console.error("Error parsing message from socket:", error);
        }
    };

    // Initial canvas rendering
    clearCanvas(existingShape, canvas, ctx);

    let isClicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        isClicked = true;
        startX = e.offsetX;
        startY = e.offsetY;

        // Add eraser functionality
        // @ts-ignore
        const selectionTool = window.selectionTool;
        if (selectionTool === "eraser") {
            const clickX = e.offsetX;
            const clickY = e.offsetY;

            // Find shapes to erase (within 10px radius of click)
            const shapesToDelete = existingShape.filter((shape) => {
                if (shape.type === "rect") {
                    return clickX >= shape.x &&
                           clickX <= shape.x + shape.width &&
                           clickY >= shape.y &&
                           clickY <= shape.y + shape.height;
                } else if (shape.type === "circle") {
                    const distance = Math.sqrt(
                        Math.pow(clickX - shape.centerX, 2) +
                        Math.pow(clickY - shape.centerY, 2)
                    );
                    return distance <= shape.radius;
                } else if (shape.type === "arrow") {
                    // Simple hit detection for arrow (checks if click is near start or end)
                    const distanceToStart = Math.sqrt(
                        Math.pow(clickX - shape.x, 2) +
                        Math.pow(clickY - shape.y, 2)
                    );
                    const distanceToEnd = Math.sqrt(
                        Math.pow(clickX - (shape.x + shape.endX), 2) +
                        Math.pow(clickY - (shape.y + shape.endY), 2)
                    );
                    return distanceToStart <= 10 || distanceToEnd <= 10;
                }
                return false;
            });

            if (shapesToDelete.length > 0) {
                // Remove shapes from local array
                existingShape = existingShape.filter(shape =>
                    !shapesToDelete.includes(shape)
                );

                // Send delete message through socket
                socket.send(
                    JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({
                            action: "delete",
                            shapes: shapesToDelete
                        }),
                        roomId
                    })
                );

                // Update canvas
                clearCanvas(existingShape, canvas, ctx);
            }
        }
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
        }else if(selectionTool === "arrow"){
            const endX = e.offsetX - startX
            const endY = e.offsetY - startY
            shape = {
                type: "arrow",
                x: startX,
                y: startY,
                endX: endX,
                endY: endY,
            }
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
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NmYyN2EzNi01Mzg1LTQ5ODgtOWU4NC0zYWI5YTg3ZjdlMWYiLCJpYXQiOjE3MzkzODYyNzZ9.pSZjy4lWMPlVkJLF67VrFlafMCBuIJXQS_-5XOJWMWg"
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
