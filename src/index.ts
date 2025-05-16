import express, { Request, Response } from "express";
import db from "./db";
import UserModel from "./models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./models/middleware";
import { ContentModel } from "./models/Content";

const app = express();

app.use(express.json());
db();

app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) {
       res.status(401).json({
        message: "User does not exist",
      });
    }

   const isMatch = await bcrypt.compare(password, user!.password!);
    if (!isMatch) {
       res.status(401).json({
        message: "Password is incorrect",
      });
    }

    const token =jwt.sign({id:user!._id,username:user!.username},
        "Sanjeev",
        {expiresIn:"1h"}
    )

     res.json({
      message: "Signin successful",
      token
      // Optionally add JWT token here
    });
  } catch (error) {
    console.error("Signin error:", error);
     res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await UserModel.create({
      username,
      password: hashedPassword,
    });

     res.json({
      message: "User signed up successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
     res.status(500).json({
      message: "Unable to sign up, please try again",
    });
  }
});

// Empty route handlers - you can implement later
app.post("/api/v1/content",userMiddleware,async (req: Request, res: Response) => {
  try {
    const title=req.body.title;
    const link=req.body.link;
    await ContentModel.create({
      link,
      title,
      //@ts-ignore
      userId:req.userId,
      tags:[]
    })

    res.status(201).json({
      message:"Content created succesfully"
    })
  } catch (error) {
    res.status(500).json({
      message:"failed to create content"
    })
  }
});

app.get("/api/v1/content",userMiddleware, async(req: Request, res: Response) => {

try {
   // @ts-ignore
 const userId=req.userId;
 //console.log("userId",userId);
 const content=await ContentModel.find({
  userId:userId
 }).populate("userId","username");

 res.status(201).json({
  content,
  message:"Content fetched succefully"
 })

} catch (error) {
  res.status(500).json({
    message:"Unable to getch teh content for this user"
  })
}
});

app.delete("/api/v1/signin",userMiddleware, async(req: Request, res: Response) => {
 try {
  
   const contentId=req.body.contentId;
   

  await ContentModel.deleteMany({
    contentId,
    //@ts-ignore
    userId:req.userId
  })
 } catch (error) {
  
 }
});

app.post("/api/v1/brain/share", (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

app.get("/api/v1/brain/:shareLink", (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
