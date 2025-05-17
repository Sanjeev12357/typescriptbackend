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
const Link_1 = require("./models/Link");
const utils_1 = require("./utils");
const Tag_1 = require("./models/Tag");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, "Sanjeev", { expiresIn: "1d" });
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
        const { title, tags, link, type } = req.body;
        if (!title || !Array.isArray(tags)) {
            res.status(400).json({ message: "Title and tags are required" });
        }
        const existingTags = yield Tag_1.TagModel.find({ name: { $in: tags } });
        const existingTagNames = existingTags.map(tag => tag.name);
        const existingTagIds = existingTags.map(tag => tag._id);
        //@ts-ignore
        const newTagNames = tags.filter(name => !existingTagNames.includes(name));
        // Create new tags
        //@ts-ignore
        const newTags = yield Tag_1.TagModel.insertMany(
        //@ts-ignore
        newTagNames.map(name => ({ name })));
        const newTagIds = newTags.map(tag => tag._id);
        const allTagIds = [...existingTagIds, ...newTagIds];
        // Create content with tag ObjectIds
        yield Content_1.ContentModel.create({
            title,
            tags: allTagIds,
            link: link,
            type: type,
            //@ts-ignore
            userId: req.userId
        });
        res.status(201).json({
            message: "Content created successfully"
        });
    }
    catch (error) {
        console.error("Error creating content:", error);
        res.status(500).json({
            message: "Failed to create content"
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
        }).populate("userId", "username").populate("tags", "name");
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
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        yield Content_1.ContentModel.deleteMany({
            contentId,
            //@ts-ignore
            userId: req.userId
        });
        res.status(201).json({
            message: "deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting the content"
        });
    }
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body.share;
        if (share) {
            const existingLink = yield Link_1.LinkModel.findOne({
                //@ts-ignore
                userId: req.userId
            });
            if (existingLink) {
                res.status(201).json({
                    message: "link shared",
                    link: existingLink.hash
                });
            }
            const hash = (0, utils_1.random)(10);
            yield Link_1.LinkModel.create({
                //@ts-ignore
                userId: req.userId,
                hash: hash
            });
            res.json({
                message: 'Shareable link created',
                link: "/share/" + hash
            });
        }
        else {
            yield Link_1.LinkModel.deleteOne({
                //@ts-ignore
                userId: req.userId
            });
            res.json({
                message: "Link deleted"
            });
        }
    }
    catch (error) {
        res.status(401).json({
            message: "Failed to create the link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield Link_1.LinkModel.findOne({
            hash: hash
        });
        if (!link) {
            res.status(411).json({
                message: "Sorry incoorect input"
            });
            return;
        }
        //userId
        const content = yield Content_1.ContentModel.find({
            userId: link.userId
        });
        const user = yield User_1.default.findOne({
            _id: link.userId
        });
        if (!user) {
            res.status(411).json({
                message: "user not found errro should ideally not happen"
            });
            return;
        }
        res.status(201).json({
            username: user === null || user === void 0 ? void 0 : user.username,
            content: content
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Unale to find data"
        });
    }
}));
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
