import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  });
  
  export default mongoose.model("Invitation", invitationSchema);
  