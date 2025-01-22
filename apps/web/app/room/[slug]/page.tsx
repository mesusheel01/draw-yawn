import axios from "axios"
import ChatRoom from "../../../components/ChatRoom"
import { BACKEND_URL } from "../../config"

async function getRoomId(slug:string){
    const response = await axios.get(`${BACKEND_URL}/api/v1/room/${slug}`)
}

export default async function ({
    params
}:{
    params:{

        slug:string
    }
}) {
    const slug = (await params).slug
    const roomId = await getRoomId(slug)

    return <ChatRoom id={roomId} />
}
