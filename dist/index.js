"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const User_1 = __importDefault(require("./models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./models/middleware");
const Content_1 = require("./models/Content");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, db_1.default)();
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield User_1.default.findOne({ username });
        if (!user) {
            res.status(401).json({
                message: "User does not exist",
            });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                message: "Password is incorrect",
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, "Sanjeev", { expiresIn: "1h" });
        res.json({
            message: "Signin successful",
            token
            // Optionally add JWT token here
        });
    }
    catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        yield User_1.default.create({
            username,
            password: hashedPassword,
        });
        res.json({
            message: "User signed up successfully",
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Unable to sign up, please try again",
        });
    }
}));
// Empty route handlers - you can implement later
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const title = req.body.title;
        const link = req.body.link;
        yield Content_1.ContentModel.create({
            link,
            title,
            //@ts-ignore
            userId: req.userId,
            tags: []
        });
        res.status(201).json({
            message: "Content created succesfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "failed to create content"
        });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.userId;
        //console.log("userId",userId);
        const content = yield Content_1.ContentModel.find({
            userId: userId
        }).populate("userId", "username");
        res.status(201).json({
            content,
            message: "Content fetched succefully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Unable to getch teh content for this user"
        });
    }
}));
app.delete("/api/v1/signin", (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});
app.post("/api/v1/brain/share", (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
    res.status(501).json({ message: "Not implemented" });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
