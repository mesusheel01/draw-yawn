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
}

export class Game{

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string


    constructor(canvas:HTMLCanvasElement, roomId: string){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.existingShapes = []
        this.roomId = roomId
        this.init();
        this.initHandelers()
    }
    async init(){
        this.existingShapes = await getExistingShape(this.roomId)
    }
    initHandelers()
}
