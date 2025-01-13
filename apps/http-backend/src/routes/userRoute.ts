import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
import {SignupSchema} from '@repo/common/types'
import {SigninSchema} from '@repo/common/types'

const userRouter = Router();


userRouter.post("/signup", async(req, res) => {
    const validateBody = req.body;
    const validate = SignupSchema.safeParse(validateBody)
    if(!validate.success){
        res.send("Input validation error!")
        return
    }

    try{
        const {username,password, name} = req.body
        const existingUser = await User.findOne({ username });
        if(existingUser){
            res.status(400).json({ message: "User already exists" });
            return
}
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword ,name});
        const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {expiresIn: "1h"});
        await newUser.save();
        res.status(201).json({ message: "User created successfully", token });
    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
});
userRouter.post("/signin", async(req, res) => {
    const validateBody = req.body
    const validate = SigninSchema.safeParse(validateBody)
    if(!validate.success){
        res.send("Input validation error!")
        return
    }
    try{
        const {username,password} = req.body
        const existingUser = await User.findOne({ username });
        if(!existingUser){
            res.status(400).json({ message: "User doesn't exists" });
            return
        }

        const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {expiresIn: "1h"});
        res.status(201).json({ message: "User logged insuccessfully", token });
    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;
