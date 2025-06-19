const multer = require("multer")
const sharp = require("sharp")
const fs = require("fs").promises

const MIME_TYPES = {
    "image/jpg": "webp",
    "image/jpeg": "webp",
    "image/png": "webp",
}

const storage = multer.memoryStorage()
const upload = multer({ storage: storage }).single("image")

const processImage = async (req, res, next) => {
    if (!req.file) {
        return next() 
    }

    try {
        const bookObject = JSON.parse(req.body.book)
        const name = bookObject.title.split(" ").join("_")
        const extension = MIME_TYPES[req.file.mimetype]
        const fileName = name + Date.now() + "." + extension

        const buffer = await sharp(req.file.buffer)
            .resize({
                height: 595,
                fit: sharp.fit.outside,
                position: sharp.strategy.entropy,
            })
            .toFormat("webp")
            .toBuffer()

        const imagePath = `images/${fileName}`
        await fs.writeFile(imagePath, buffer)

        req.file.filename = fileName
        next()
    } catch (error) {
        console.error("Error processing image:", error)
        res.status(500).json({ error: "Internal server error." })
    }
}

module.exports = { upload, processImage }