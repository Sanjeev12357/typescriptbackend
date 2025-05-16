"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String
});
const UserModel = (0, mongoose_1.model)("User", UserSchema);
exports.default = UserModel;
