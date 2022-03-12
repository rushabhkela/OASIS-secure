var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Auth = require('../middlewares/auth');
const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "userdocs");
    },
    filename: async (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        const d = Date.now();
        const newFile = new Docs({
            name: file.originalname,
            location: `${req.user._id}-${file.fieldname}-${d}.${ext}`,
            ofUser: req.user._id,
            uploadedAt: d,
            description: req.body.description
        });
        await newFile.save();
        cb(null, `${req.user._id}-${file.fieldname}-${d}.${ext}`);
    },
});

const upload = multer({
    storage: multerStorage
});

router.get('/', Auth, async (req, res) => {
    const user = req.user;
    const documents = await Docs.find({ ofUser: mongoose.Types.ObjectId(user._id) });
    res.render('docs', { title: "OASIS - Documents", user: user, documents: documents });
})


router.post('/upload', Auth, upload.single("file"), async (req, res) => {
    try {
        res.redirect('/documents');
    } catch (error) {
        res.redirect('/error');
    }
})

router.get('/getfile/:id', Auth, async (req, res) => {
    res.download("./userdocs/" + req.params.id);
})

module.exports = router;