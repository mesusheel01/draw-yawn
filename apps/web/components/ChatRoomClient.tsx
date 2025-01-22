'use client'

import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket'

export default function ChatRoomClient({
    messages,
    id
}:{
    messages:{message:string} [],
    id:string
}) {
    const [chats, setChats] = useState(messages)
    const [currentMessages, setCurrentMessages] = useState("")
    const {socket, loading}  =useSocket()

    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type: 'join_room',
                roomId: id
            }))
        }

        socket.onmessage = (e)=>{
            const parsedData = JSON.parse(e.data)
            if(parsedData.type === 'chat'){
                setChats(c=> [...c, parsedData.message])
            }
        }
    },[socket,loading,id])


    return <div>
        {chats.map(m=>
        <div>
                {m.message}
        </div>)}
        <input type='text' value={currentMessages} onChange={(e)=> setCurrentMessages(e.target.value)} placeholder='Enter a message...'/>
        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                roomId: id,
                messages:currentMessages
            }))
            setCurrentMessages("")
        }}>Send Message</button>
    </div>
}
