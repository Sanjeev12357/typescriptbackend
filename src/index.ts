import express from "express"
import db from "./db"

const app=express();


db();


app.post("/api/v1/signin",(req,res)=>{

})
app.post("/api/v1/content",(req,res)=>{
    
})
app.get("/api/v1/content",(req,res)=>{
    
})
app.delete("/api/v1/signin",(req,res)=>{
    
})
app.post("/api/v1/brain/share",(req,res)=>{
    
})
app.get("/api/v1/brain/:shareLink",(req,res)=>{
    
})

app.listen(3000,()=>{
    console.log("print")
})