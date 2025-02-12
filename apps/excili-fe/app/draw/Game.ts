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

type Tool = "arrow" | "circle" | "rect" | "eraser";

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
            this.existingShapes.push(parsedShape.shape);
            this.clearCanvas();
          }
        } else if (message.type === "delete_shape") {
          this.existingShapes.splice(message.index, 1);
          this.clearCanvas();
        }
      } catch (error) {
        console.error("Error parsing message from socket:", error);
      }
    };

    // Initial canvas rendering
    this.clearCanvas();
  }

  private isPointInShape(x: number, y: number, shape: Shape): boolean {
    switch (shape.type) {
      case "rect":
        return x >= shape.x && x <= shape.x + shape.width &&
               y >= shape.y && y <= shape.y + shape.height;
      case "circle":
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
      case "arrow":
        // Simplified hit detection - checks if point is near the line
        const threshold = 5;
        const A = { x: shape.x, y: shape.y };
        const B = { x: shape.endX, y: shape.endY };
        const distance = this.pointToLineDistance(x, y, A, B);
        return distance <= threshold;
    }
  }

  private pointToLineDistance(x: number, y: number, A: {x: number, y: number}, B: {x: number, y: number}): number {
    const numerator = Math.abs((B.y - A.y) * x - (B.x - A.x) * y + B.x * A.y - B.y * A.x);
    const denominator = Math.sqrt(Math.pow(B.y - A.y, 2) + Math.pow(B.x - A.x, 2));
    return numerator / denominator;
  }

  private async deleteShape(index: number) {
    // Add API call to delete shape from database
    try {
      await fetch(`/api/shapes/${this.roomId}/${index}`, { method: 'DELETE' });
      this.existingShapes.splice(index, 1);
      this.socket.send(JSON.stringify({
        type: "delete_shape",
        index,
        roomId: this.roomId,
      }));
      this.clearCanvas();
    } catch (error) {
      console.error("Error deleting shape:", error);
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedTool === "eraser") {
      const x = e.offsetX;
      const y = e.offsetY;

      // Find and delete the first shape that contains the clicked point
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        if (this.isPointInShape(x, y, this.existingShapes[i])) {
          this.deleteShape(i);
          return;
        }
      }
    } else {
      this.isClicked = true;
      this.startX = e.offsetX;
      this.startY = e.offsetY;
    }
  }

  mouseUpHandler =  (e: MouseEvent) => {
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

  mouseMoveHandler = (e: MouseEvent) => {
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
      }else if(shape.type === "arrow") {
      // Draw the line
      this.ctx.beginPath();
      this.ctx.moveTo(shape.x, shape.y);
      this.ctx.lineTo(shape.endX, shape.endY);
      this.ctx.stroke();

      // Calculate angle for arrow direction
      const angle = Math.atan2(shape.endY - shape.y, shape.endX - shape.x);

      // Draw arrowhead
      this.ctx.save();
      this.ctx.translate(shape.endX, shape.endY);
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -5);
      this.ctx.lineTo(0, 0);
      this.ctx.lineTo(-10, 5);
      this.ctx.stroke();
      this.ctx.restore();
    }
    });
  }
}
