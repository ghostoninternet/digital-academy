import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String, 
    required: true
  },
  email: {
    type: String, 
    required: true
  },
  password: {
    type: String, 
    required: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    default: "Male",
  },
  avatarUrl: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  jobTitle: {
    type: String,
    default: "",
  },
  organization: {
    type: String,
    default: "",
  },
  enrolledCourses: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  preferences: {
    type: {
      theme: String,
      language: String,
    },
    default: {
      theme: "light",
      language: "english"
    }
  },
  role: {
    type: String,
    enum: ['instructor', 'user'],
    default: 'user',
  }
}, {
  timestamps: true
});

const Users = mongoose.model("Users", userSchema);

export default Users;
