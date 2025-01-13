import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"] ?? "";
    if(!token){
        res.status(401).json({ message: "Unauthorized" });
        return
    }
    jwt.verify(token, "secret", (err, decoded) => {
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
