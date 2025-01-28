import { getExistingShape } from "./apiCalls";

export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      height: number;
      width: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  |{
    type:"arrow";
    x: number;
    y: number;
    endX: number;
    endY: number;
}

type Tool = "arrow" | "circle" | "rect";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private isClicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";

  destroy(){
    this.canvas.removeEventListener("mousedown",this.mouseDownHandler)
    this.canvas.removeEventListener("mousedown",this.mouseUpHandler)
    this.canvas.removeEventListener("mousedown",this.mouseMoveHandler)
  }
  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.isClicked = false;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }


  async init() {
    this.existingShapes = await getExistingShape(this.roomId);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async initHandlers() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context could not be initialized.");
      return;
    }

    const existingShapes = await getExistingShape(this.roomId);

    // Handle incoming WebSocket messages
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "chat" && message.message) {
          const parsedShape = JSON.parse(message.message);
          if (parsedShape.shape) {
            existingShapes.push(parsedShape.shape);
            this.clearCanvas();
          }
        }
      } catch (error) {
        console.error("Error parsing shape from socket message:", error);
      }
    };

    // Initial canvas rendering
    this.clearCanvas();
  }

    mouseDownHandler =  (e) => {
        this.isClicked = true;
        this.startX = e.offsetX; // Use offsetX for accurate canvas coordinates
        this.startY = e.offsetY;
    }

    mouseUpHandler =  (e) => {
      if (!this.isClicked) return;
      this.isClicked = false;

      const width = e.offsetX - this.startX;
      const height = e.offsetY - this.startY;

      let shape: Shape | null = null;

      if (this.selectedTool === "rect") {
        shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          height,
          width,
        };
      } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2; // Use diagonal for radius
        shape = {
          type: "circle",
          radius,
          centerX: this.startX + width / 2,
          centerY: this.startY + height / 2,
        };
      }else if(this.selectedTool === "arrow"){
        const endX = e.offsetX
        const endY = e.offsetY
        shape = {
            type: "arrow",
            x: this.startX ,
            y: this.startY,
            endX: endX,
            endY: endY,
        }
    }

      if (shape) {
        this.existingShapes.push(shape);
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
        this.clearCanvas();
      }
    }

    mouseMoveHandler = (e) => {
      if (!this.isClicked) return;

      const width = e.offsetX - this.startX;
      const height = e.offsetY - this.startY;

      this.clearCanvas();

      this.ctx.strokeStyle = "rgba(255, 255, 255)";
      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedTool === "circle") {
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }else if(this.selectedTool  === "arrow"){
        const endX = e.offsetX
        const endY = e.offsetY
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX,this.startY)
        this.ctx.lineTo(endX,endY)
        this.ctx.font = "16px arial"
        this.ctx.fillStyle = "white"
        this.ctx.fillText(">", endX-10,endY+5)
        if((endX - this.startX)<0){
            this.ctx.direction="rtl"
        }else{
            this.ctx.direction="ltr"

        }
        this.ctx.stroke()
      }
    }
  initMouseHandlers(){
    this.canvas.addEventListener("mousedown", this.mouseDownHandler)
    this.canvas.addEventListener("mouseup", this.mouseUpHandler)
    this.canvas.addEventListener("mousedown", this.mouseMoveHandler)
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "rgba(255,255,255)";
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle" && shape.radius > 0) {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }else if(shape.type  === "arrow"){
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x,shape.y)
        this.ctx.lineTo(shape.endX,shape.endY)
        this.ctx.stroke()
        this.ctx.closePath()

        this.ctx.font = "16px arial"
        this.ctx.fillStyle = "white"
        if((shape.endX - shape.x)<0){
            this.ctx.direction="rtl"
        }else{
            this.ctx.direction="ltr"

        }
        this.ctx.fillText(">", shape.endX-10,shape.endY+5)
      }
    });
  }
}
