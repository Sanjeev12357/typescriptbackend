import mongoose, {model,Schema} from "mongoose";

const ContentSchema=new Schema({
    title:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId, ref:"Tag"}],
    userId:{type:mongoose.Types.ObjectId,ref:"User",required:true}
})


export const ContentModel= model("Content",ContentSchema);