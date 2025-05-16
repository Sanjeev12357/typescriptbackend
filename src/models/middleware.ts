import { NextFunction, Request,Response } from "express";
import jwt from "jsonwebtoken";




export const userMiddleware=async(req:Request,res:Response, next:NextFunction)=>{
    const header=req.headers["authorization"];
    const decoded=jwt.verify(header as string,"Sanjeev");
    if(decoded){
        //@ts-ignore
        req.userId=decoded.id;
        next();
    }else{
        res.status(403).json({
            message:"User not authorized"
        });
    }
}