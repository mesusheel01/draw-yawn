'use client'

import {initCanvas} from "@/app/draw"
import { useEffect, useRef, useState } from "react"
import { ToolButton } from "./ToolButton"
import { MoveRight, Circle, RectangleHorizontalIcon, Eraser } from "lucide-react"
import { Game } from "@/app/draw/Game"

type shape = "circle"| "rect"|"arrow" | "eraser"

export default function Canvas({roomId, socket}: {roomId:string,socket:WebSocket},) {
    const [game, setGame] = useState<Game>()
    const [selectionTool, setSelectionTool] = useState<shape>("circle")

    useEffect(()=>{
        game?.setTool(selectionTool)
    },[selectionTool,game])

   const canvasRef = useRef<HTMLCanvasElement>(null)
   useEffect(()=>{
       if(canvasRef.current){
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g)
        }
    },[canvasRef])

    return (
        <div className="h-[100vh] overflow-hidden text-center flex flex-col items-center">
    <canvas ref={canvasRef} height={window.innerHeight} width={window.innerWidth}>
        </canvas>
        <ToolBar setSelectionTool={setSelectionTool} selectionTool={selectionTool} />
    </div>
    )
}

export function ToolBar({selectionTool, setSelectionTool}:{
    selectionTool: shape,
    setSelectionTool:(s:shape)=>void
}){
    return <div className="fixed top-0 p-2 border rounded-lg border-gray-500 flex gap-10 m-2"
>
        <ToolButton
        active={selectionTool==="arrow"}
        onClick={()=>setSelectionTool("arrow")}
        icon={<MoveRight />}
        />
        <ToolButton
        icon={<RectangleHorizontalIcon />}
        active={selectionTool==="rect"}
        onClick={()=>setSelectionTool("rect")}
        />
        <ToolButton
        icon={<Circle />}
        active={selectionTool==="circle"}
        onClick={()=>setSelectionTool("circle")}
        />
        <ToolButton
        icon={<Eraser />}
        active={selectionTool==="eraser"}
        onClick={()=>setSelectionTool("eraser")}
        />


    </div>
}
