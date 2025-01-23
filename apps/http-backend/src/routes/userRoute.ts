import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
import { SignupSchema } from "@repo/common/types";
import { SigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/database-config/db"; // Fixed typo: primsaClient to prismaClient

const userRouter: Router = Router();

userRouter.post("/signup", async (req, res) => {
    const validateBody = req.body;
    const validate = SignupSchema.safeParse(validateBody);

    if (!validate.success) {
        res.status(400).send("Input validation error!");
        return;
    }

    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await prismaClient.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        // Generate a token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);

        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.post("/signin", async (req, res) => {
    const validateBody = req.body;
    const validate = SigninSchema.safeParse(validateBody);

    if (!validate.success) {
        res.status(400).send("Input validation error!");
        return;
    }

    try {
        const { username, password } = req.body;

        // Find the user by username
        const existingUser = await prismaClient.user.findUnique({
            where: { username },
        });

        if (!existingUser) {
            res.status(400).json({ message: "User doesn't exist" });
            return;
        }

        // Verify the password
        const passVerify = await bcrypt.compare(password, existingUser.password);
        if (!passVerify) {
            res.status(403).json({ message: "Incorrect password!" });
            return;
        }

        // Generate a token
        const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "User logged in successfully", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;
