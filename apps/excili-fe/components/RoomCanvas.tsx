'use client'

import { useEffect, useState } from "react"
import Canvas from "./Canvas"
import { WS_URL } from "@/config"

export function RoomCanvas({roomId}: {roomId:string}){
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}/?token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MjM2ZjY1Yy1kNDk4LTRlZGQtYTVhYi0yZTE0YTk0NGQwZDMiLCJpYXQiOjE3Mzc3NDY1MjQsImV4cCI6MTczNzc1MDEyNH0.4jhQD2s_m6ImNL4Da5Cl1jTkDI94Jb3ToOEyQNF_rUI"`)

        ws.onopen = ()=>{
            setSocket(ws)
            const data = JSON.stringify({
                type:"join_room",
                roomId
            })

            ws.send(data)
        }

    },[])
    if(!socket){
        return <div>Connection to a room....</div>
    }
    return <Canvas roomId={roomId} socket={socket} />
}
