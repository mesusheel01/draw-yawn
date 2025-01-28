import { getExistingShape } from "./apiCalls";

export type Shape = {
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
    endX:number;
    endY:number;
}

export class Game{

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string
    socket: WebSocket
    private isClicked ;
    private startX ;
    private startY ;

    constructor(canvas:HTMLCanvasElement, roomId: string, socket:WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.existingShapes = []
        this.roomId = roomId
        this.init();
        this.initHandelers()
        this.socket=socket
        this.isClicked = false;
        this.startX =0
        this.startY =0

    }
    async init(){
        this.existingShapes = await getExistingShape(this.roomId)
    }
    async initHandelers(){
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            console.error("Canvas context could not be initialized.");
            return;
        }

        let existingShape: Shape[] = await getExistingShape(this.roomId);

        // Handle incoming WebSocket messages
        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'chat' && message.message) {
                    const parsedShape = JSON.parse(message.message);
                    if (parsedShape.shape) {
                        existingShape.push(parsedShape.shape);
                        clearCanvas();
                    }
                }
            } catch (error) {
                console.error("Error parsing shape from socket message:", error);
            }
        };

    // Initial canvas rendering
        clearCanvas();

    let isClicked = false;
    let startX = 0;
    let startY = 0;

    }
    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0,0,0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.existingShapes.forEach((shape) => {
            this.ctx.strokeStyle = "rgba(255,255,255)";
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle" && shape.radius > 0) {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
    }
}
