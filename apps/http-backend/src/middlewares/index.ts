import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";




const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization
    const actToken = token?.split(" ")[1]
    if(!actToken){
        res.status(401).json({ message: "Unauthorized" });
        return
    }
    jwt.verify(actToken,JWT_SECRET, (err, decoded) => {
        if(err){
            res.status(401).json({ message: "Unauthorized" });
            return
        }
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    })
}

export default userMiddleware;
