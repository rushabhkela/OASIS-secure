var express = require('express');
var router = express.Router();
const multer = require('multer');
const multerS3 = require("multer-s3");
const mongoose = require('mongoose');
const fs = require('fs');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
})

const upload = multer({ storage }).single('file');

router.get('/', async (req, res) => {
    const books = await Book.find({});
    res.render('allbook', { title: 'OASIS - Library', book: books });
})

router.get('/bookupload', async (req, res) => {
    res.render("book", { title: 'OASIS - Book Upload' });
})

router.route('/upload')
    .post(upload, async (req, res) => {
        const file = req.file;
        const myFile = file.originalname;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${req.user._id}-${Date.now()}`,
            Body: req.file.buffer
        }
        s3.upload(params, async (error, data) => {
            if (error) {
                res.redirect('/error');
            }
            var newBook = new Book({
                name: req.body.name,
                description: req.body.description,
                link: data.Location
            });
            await newBook.save();
            res.redirect('/books')
        })
    })

router.get('/getdata', async (req, res) => {
    const books = await Book.find({});
    res.status(200).json(books);
});

module.exports = router;