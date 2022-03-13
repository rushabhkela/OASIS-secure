var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
const multerS3 = require("multer-s3");
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
    if (!req.user) {
        res.redirect('/users/login');
    }
    else {
        const documents = await Docs.find({ ofUser: mongoose.Types.ObjectId(req.user._id) });
        res.render('docs', { title: "OASIS - Documents", documents: documents, user: req.user  });
    }
})


router.post('/upload', upload, async (req, res) => {
    try {
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
            var newDoc = new Docs({
                name: req.body.name,
                description: req.body.description,
                location: data.Location,
                ofUser: req.user._id,
                uploadedAt: new Date()
            });
            await newDoc.save();
            res.redirect('/documents');
        })
    } catch (error) {
        res.redirect('/error');
    }
})

module.exports = router;