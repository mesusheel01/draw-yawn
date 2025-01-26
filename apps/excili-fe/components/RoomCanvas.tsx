'use client'

import { useEffect, useState } from "react"
import Canvas from "./Canvas"
import { WS_URL } from "@/config"

export function RoomCanvas({roomId}: {roomId:string}){
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NmYyN2EzNi01Mzg1LTQ5ODgtOWU4NC0zYWI5YTg3ZjdlMWYiLCJpYXQiOjE3Mzc5MDE2NjYsImV4cCI6MTczNzkwODg2Nn0._JoEz1O0hYOXtoJuovs0iMuOOYceNr11p3CuRE1IXW0`)

        ws.onopen = ()=>{
            setSocket(ws)
            const data = JSON.stringify({
                type:"join_room",
                message:"",
                roomId
            })
            console.log(data)
            ws.send(data)
        }

        ws.onerror = (err)=> console.log(err)
        ws.onclose  = () => console.log("connection closed!")

    },[roomId])
    if(!socket){
        return <div>Connection to a room....</div>
    }
    return <Canvas roomId={roomId} socket={socket} />
}
