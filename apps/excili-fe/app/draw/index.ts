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


export default function initCanvas(canvas : HTMLCanvasElement ){

    const ctx  =canvas.getContext('2d')
    let existingShape: shape[] = []
    if(!ctx) {return}

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
        existingShape.push({
            type:'rect',
            x:startX,
            y:startY,
            height,
            width
        })

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
