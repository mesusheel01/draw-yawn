import axios from "axios";
import { Shape } from "./Game";
import { HTTP_BACKEND_URL } from "@/config";

export async function getExistingShape(roomId: string): Promise<Shape[]> {
    try {
        const response = await axios.get(
            `${HTTP_BACKEND_URL}api/v1/room/chats/${roomId}`,
            {
                headers: {
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NmYyN2EzNi01Mzg1LTQ5ODgtOWU4NC0zYWI5YTg3ZjdlMWYiLCJpYXQiOjE3MzkzODYyNzZ9.pSZjy4lWMPlVkJLF67VrFlafMCBuIJXQS_-5XOJWMWg"
                }
            }
        );

        const messages = response.data.messages || [];
        return messages
            .map((msg: { message: string }) => {
                try {
                    const data = JSON.parse(msg.message);
                    return data.shape || null;
                } catch {
                    console.error("Invalid shape data:", msg.message);
                    return null;
                }
            })
            .filter((shape: Shape | null) => shape !== null);
    } catch (error) {
        console.error("Error fetching existing shapes:", error);
        return [];
    }
}
