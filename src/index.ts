import express, { Request, Response } from "express";
import db from "./db";
import UserModel from "./models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./models/middleware";
import { ContentModel } from "./models/Content";
import { LinkModel } from "./models/Link";
import { random } from "./utils";
import { TagModel } from "./models/Tag";
import cors from "cors";






const app = express();

app.use(express.json());
app.use(cors());
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
        {expiresIn:"1d"}
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


app.post("/api/v1/content", userMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, tags,link,type } = req.body; 

    if (!title || !Array.isArray(tags)) {
       res.status(400).json({ message: "Title and tags are required" });
    }

    
    const existingTags = await TagModel.find({ name: { $in: tags } });

    const existingTagNames = existingTags.map(tag => tag.name);
    const existingTagIds = existingTags.map(tag => tag._id);

   
    //@ts-ignore
    const newTagNames = tags.filter(name => !existingTagNames.includes(name));

    // Create new tags
    //@ts-ignore
    const newTags = await TagModel.insertMany(
      //@ts-ignore
      newTagNames.map(name => ({ name }))
    );

    const newTagIds = newTags.map(tag => tag._id);

    const allTagIds = [...existingTagIds, ...newTagIds];

    // Create content with tag ObjectIds
    await ContentModel.create({
      title,
      tags: allTagIds,
      link:link,
      type:type,
      //@ts-ignore
      userId: req.userId
    });

    res.status(201).json({
      message: "Content created successfully"
    });

  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      message: "Failed to create content"
    });
  }
});


app.get("/api/v1/content",userMiddleware, async(req: Request, res: Response) => {

try {
   // @ts-ignore
 const userId=req.userId;
 //console.log("userId",userId);
 const content=await ContentModel.find({
  userId:userId
 }).populate("userId","username").populate("tags","name");

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

app.delete("/api/v1/content",userMiddleware, async(req: Request, res: Response) => {
 try {
  
   const contentId=req.body.contentId;
   

  await ContentModel.deleteMany({
    contentId,
    //@ts-ignore
    userId:req.userId
  })

  res.status(201).json({
    message:"deleted successfully"
  })
 } catch (error) {
    res.status(500).json({
      message:"Error deleting the content"
    })
 }
});


app.post("/api/v1/brain/share", userMiddleware, async (req: Request, res: Response) => {
  try {
    const share=req.body.share;

  if(share){
    const existingLink=await LinkModel.findOne({
      //@ts-ignore
      userId:req.userId
    })

    if(existingLink){
      res.status(201).json({
      message:"link shared",
      link:existingLink.hash
    })
    }

    const hash=random(10);
    await LinkModel.create({
      //@ts-ignore
      userId:req.userId,
      hash:hash

    })

    res.json({
      message:'Shareable link created',
      link:"/share/"+hash
    })
  }else{
    await LinkModel.deleteOne({
      //@ts-ignore
      userId:req.userId
    })
    res.json({
      message:"Link deleted"
    })
  }

  
  } catch (error) {
    res.status(401).json({
      message:"Failed to create the link"
    })
  }

});


app.get("/api/v1/brain/:shareLink", async(req: Request, res: Response) => {
  try {
    const hash=req.params.shareLink;

    const link=await LinkModel.findOne({
      hash:hash
    });

    if(!link){
      res.status(411).json({
        message:"Sorry incoorect input"
      })
      return;
    }

    //userId
    const content=await ContentModel.find({
      userId:link.userId
    })
    const user=await UserModel.findOne({
      _id:link.userId
    })

    if(!user){
      res.status(411).json({
        message:"user not found errro should ideally not happen"
      })
      return;
    }

    res.status(201).json({
      username:user?.username,
      content:content
    })
  } catch (error) {
    res.status(500).json({
      message:"Unale to find data"
    })
  }

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
