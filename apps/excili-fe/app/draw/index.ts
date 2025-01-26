import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
    type:'rect';
    x:number;
    y:number;
    height:number;
    width:number;
} | {
    type:'circle'
    centerX:number;
    centerY:number;
    radius:number;
}


export async function initCanvas(canvas : HTMLCanvasElement , roomId:string , socket:WebSocket){

    const ctx  = canvas.getContext('2d')
    let existingShape: Shape[] = await getExistingShape(roomId)
    if(!ctx) {
        return;
    }
    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data);

        if(message.type == 'chat'){
            const parsedShape = JSON.parse(message.message)
            console.log(parsedShape)
            existingShape.push(parsedShape.shape)
            clearCanvas(existingShape, canvas,ctx)
        }
    }

    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    let isClicked = false
    let startX = 0
    let startY = 0
    canvas.addEventListener("mousedown", (e)=>{
        isClicked =true
        startX = e.clientX
        startY = e.clientY
    })
    canvas.addEventListener("mouseup", (e)=>{
        isClicked =false
        const width = e.clientX - startX
        const height = e.clientY - startY
        const shape:Shape = ({
            type:'rect',
            x:startX,
            y:startY,
            height,
            width
        })
        existingShape.push(shape);

        if (socket.readyState === WebSocket.OPEN) {
            console.log("Sending shape data to backend:", {
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            });
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }));
        } else {
            console.error("WebSocket is not open. Message not sent.");
        }

    })
    canvas.addEventListener("mousemove", (e)=>{
        if(isClicked){
            const x = e.clientX - startX
            const y = e.clientY - startY
            clearCanvas(existingShape,canvas,ctx)
            ctx.strokeStyle = 'rgba(255,255,255)'
            ctx.strokeRect(startX,startY, x,y)

        }
    })
}

function clearCanvas(existingShape: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShape.forEach(shape => {
        if (shape && shape.type === 'rect') {
            ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape && shape.type === 'circle') {
            ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });
}

async function getExistingShape(roomId: string) {
    const response = await axios.get(`${HTTP_BACKEND_URL}api/v1/room/chats/${roomId}`, {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NmYyN2EzNi01Mzg1LTQ5ODgtOWU4NC0zYWI5YTg3ZjdlMWYiLCJpYXQiOjE3Mzc5MDE2NjYsImV4cCI6MTczNzkwODg2Nn0._JoEz1O0hYOXtoJuovs0iMuOOYceNr11p3CuRE1IXW0"
        }
    });

    const messages = response.data.messages || [];
    const shapes = messages
        .map((x: { message: string }) => {
            try {
                const messageData = JSON.parse(x.message);
                return messageData.shape || null;
            } catch (e) {
                console.error("Invalid shape data:", x.message);
                return null;
            }
        })
        .filter((shape: Shape | null) => shape !== null); // Filter out invalid shapes
    return shapes;
}
