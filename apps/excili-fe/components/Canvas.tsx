'use client'

import {initCanvas} from "@/app/draw"
import { useEffect, useRef, useState } from "react"

export default function Canvas({roomId, socket}: {roomId:string,socket:WebSocket},) {

    const [selectionTool, setSelectionTool] = useState("rect")

   const canvasRef = useRef<HTMLCanvasElement>(null)
   useEffect(()=>{
        if(canvasRef.current){
            initCanvas(canvasRef.current, roomId, socket,selectionTool)
        }
    },[canvasRef])


    return (
    <canvas ref={canvasRef} height={1000} width={1000}>
        <div className="text-white">
            <div onClick={()=>setSelectionTool('arrow')}>
                Arrow
            </div>
            <div onClick={()=>setSelectionTool('circle')}>
                Circle
            </div>
            <div onClick={()=>setSelectionTool('rect')}>
                Rect
            </div>
        </div>
    </canvas>
    )
}
