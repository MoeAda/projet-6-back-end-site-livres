const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = async (req, res, next) => {

  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      ratings: [],
      averageRating: 0,
    });

   await  book.save();
    res.status(201).json({ message: "Book saved" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: res.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...thingObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.ratingBook = (req, res, next) => {
  const userId = req.auth.userId;
  const grade = req.body.rating; // ou req.body.grade selon ta structure

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: "La note doit être entre 0 et 5" });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Livre non trouvé" });

      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(403).json({ message: "Vous avez déjà noté ce livre" });
      }

      book.ratings.push({ userId, grade });
      const sum = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = sum / book.ratings.length;

      console.log("SUM " . sum)
      console.log("BOOK => " . book)

      book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRatings = async (req, res, next) => {
    try {
        const books = await Book.find()
        const topRated = books
            .sort((a, b) => {
                return b.averageRating - a.averageRating
            })
            .slice(0, 3)
        res.status(200).json(topRated)
    } catch (error) {
        res.status(400).json({ error })
    }
};
