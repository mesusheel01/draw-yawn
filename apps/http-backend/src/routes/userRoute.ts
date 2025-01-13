import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userRouter = Router();


userRouter.post("/signup", async(req, res) => {
    const { username, password } = req.body;
    try{
        const existingUser = await User.findOne({ username });
        if(existingUser){
            res.status(400).json({ message: "User already exists" });
            return
}
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        await newUser.save();
        res.status(201).json({ message: "User created successfully", token });
    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
});
userRouter.post("/signin", async(req, res) => {
    const { username, password } = req.body;
    try{
        const existingUser = await User.findOne({ username });
        if(!existingUser){
            res.status(400).json({ message: "User doesn't exists" });
            return
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        await newUser.save();
        res.status(201).json({ message: "User logged insuccessfully", token });
    }catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;
