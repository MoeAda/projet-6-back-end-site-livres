const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true},
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type:Number, required: true }
        }
    ],
    averageRating: { type:Number, required: true } 
});

const averageRating = async(book) => {
    if (book.ratings && book.ratings.length > 0) {
        const totalNotes = book.ratings.reduce((total, rating) => total + rating.grade, 0);
        book.averageRating = totalNotes / book.ratings.length;
    } else {
        book.averageRating = 0;
    }
    return book.averageRating;
};

bookSchema.pre('save', function (next) {
    averageRating(this);
    next();
});

module.exports = mongoose.model('Book', bookSchema);