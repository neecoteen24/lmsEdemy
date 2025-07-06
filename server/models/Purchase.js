import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  courseId: {type:mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    req: true
  },
  userId: {
    type: String,
    ref: 'User',
    req: true
  },
  amount: {type: Number, required: true},
  status: {type: String, enum: ['pending','completed','failed'], default: 'pending'}
}, {timestamps: true}
);

export default mongoose.model('Purchase', PurchaseSchema)