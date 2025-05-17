import mongoose, {model,Schema} from "mongoose";

const ContentSchema=new Schema({
    title:String,
    link:String,
    type:String,
    tags:[{type:mongoose.Types.ObjectId, ref:"Tag"}],
    userId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
    shareLink: { type: String, unique: true, sparse: true }
})


export const ContentModel= model("Content",ContentSchema);