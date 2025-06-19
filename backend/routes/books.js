const express = require('express');
const auth = require('../middleware/auth');
const { upload , processImage } = require('../middleware/multer-config');
const router = express.Router();

const booksCtrl = require('../controllers/books');

router.post('/', auth, upload, processImage, booksCtrl.createBook);
router.put('/:id', auth, upload, processImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/bestrating', booksCtrl.getBestRatings);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);
router.post('/:id/rating', auth, booksCtrl.ratingBook);

module.exports = router
