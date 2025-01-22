import axios from "axios"
import ChatRoomClient from "./ChatRoomClient"

async function getChats(roomId: string){
    const res = await axios.get(`BACKEND_URL/room/chats/${roomId}`)
    return res.data.messages
}

export default async function ChatRoom({id}:{id:string}) {
    const messages = await getChats(id)
    return <ChatRoomClient id={id} messages={messages} />
}
