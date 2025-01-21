import {z} from "zod"

export const SignupSchema = z.object({
    username: z.string(),
    email:z.string(),
    password: z.string(),
})
export const SigninSchema = z.object({
    username: z.string(),
    password: z.string(),
})
export const RoomSchema = z.object({
    roomName:z.string().min(3).max(6)
})
