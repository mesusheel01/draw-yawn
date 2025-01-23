"use client"

import initCanvas from "@/app/draw"
import { useEffect, useRef } from "react"

export default function CanvasPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(()=>{
       if(canvasRef.current){
            initCanvas(canvasRef.current)
       }
    },[canvasRef])


  return (
    <canvas ref={canvasRef} height={1000} width={1000}>

    </canvas>
  )
}
