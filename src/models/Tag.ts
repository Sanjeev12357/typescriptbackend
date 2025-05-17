import { Schema, model } from "mongoose";

const TagSchema = new Schema({
  name: { type: String, required: true, unique: true }
});

export const TagModel = model("Tag", TagSchema);
