// backend/models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
username: {
type: String,
required: true,
unique: true,
minlength: 3,
maxlength: 30
},
email: {
type: String,
required: true,
unique: true,
match: /^\S+@\S+\.\S+$/
},
password: {
type: String,
required: true,
minlength: 6
},
role: {
type: String,
enum: ['user', 'admin'],
required: true
},
isVerified: {
    type: Boolean,
    default: false
},
balance: { 
type: Number, 
default: 0 
},
isTestAccount: {
    type: Boolean,
    default: false
}
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);

