import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  pages: number;
  status: "Read" | "Re-read" | "DNF" | "Currently reading" | "Returned Unread" | "Want to read";
  price: number;
  pagesRead: number;
  format: "Print" | "PDF" | "Ebook" | "AudioBook";
  suggestedBy: string;
  finished: boolean;
  currentlyAt(): string;
  deleteBook(): string;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  pages: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Read", "Re-read", "DNF", "Currently reading", "Returned Unread", "Want to read"],
    required: true,
  },
  price: { type: Number, required: true },
  pagesRead: { type: Number, required: true },
  format: {
    type: String,
    enum: ["Print", "PDF", "Ebook", "AudioBook"],
    required: true,
  },
  suggestedBy: { type: String, required: true },
  finished: { type: Boolean, default: false },
});

BookSchema.pre<IBook>("save", function (next) {
  if (this.pagesRead >= this.pages) {
    this.finished = true;
  }
  next();
});

BookSchema.methods.currentlyAt = function (): string {
  const percentage = ((this.pagesRead / this.pages) * 100).toFixed(1);
  return `${percentage}% completed`;
};

BookSchema.methods.deleteBook = function (): string {
  return `Book "${this.title}" deleted successfully`;
};

export default mongoose.model<IBook>("Book", BookSchema);
