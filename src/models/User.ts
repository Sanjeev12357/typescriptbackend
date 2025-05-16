import mongoose,{model , Schema} from "mongoose";


const UserSchema=new Schema({
    username:{
        type:String,
        unique:true
    },
    password:String
})

const UserModel =  model("User",UserSchema);


export default UserModel;