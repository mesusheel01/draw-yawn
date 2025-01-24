import { HTTP_BACKEND_URL } from "@/config";
import axios from "axios";

type shape = {
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


export default async function initCanvas(canvas : HTMLCanvasElement , roomId:string , socket:WebSocket){

    const ctx  =canvas.getContext('2d')
    let existingShape: shape[] = await getExistingShape(roomId)
    if(!ctx) {
        return;
    }
    socket.onmessage = (event)=>{
        const message = JSON.parse(event.data);

        if(message.type === 'chat'){
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
        const shape:shape = ({
            type:'rect',
            x:startX,
            y:startY,
            height,
            width
        })
        existingShape.push(shape)
        socket.send(JSON.stringify({
            type:'chat',
            message:JSON.stringify({
                shape
            }),
            roomId
        }))
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

function clearCanvas(existingShape: shape[],canvas:HTMLCanvasElement, ctx: CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    existingShape.map(shape =>{
        if(shape.type === 'rect'){
            ctx.strokeStyle = 'rgba(255,255,255)'
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }
    })
}


async function getExistingShape(roomId:string){
    const response = await axios.get(`${HTTP_BACKEND_URL}api/v1/room/chats/${roomId}`,{
        headers:{
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MjM2ZjY1Yy1kNDk4LTRlZGQtYTVhYi0yZTE0YTk0NGQwZDMiLCJpYXQiOjE3Mzc3NDY1MjQsImV4cCI6MTczNzc1MDEyNH0.4jhQD2s_m6ImNL4Da5Cl1jTkDI94Jb3ToOEyQNF_rUI"
        }
    })

    const message = response.data.messages
    console.log(message)
    const shapes = message.map((x: {message:string})=>{
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })
    return shapes

}
