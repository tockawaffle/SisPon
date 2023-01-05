const router = require('express').Router();
const path = require('path');

function htmlPath(filename) {
    return path.join(__dirname, `../../public/pages/${filename}.html`);
}

router.get("/",async(req, res) => {
    res.sendFile(htmlPath("index"));
})

module.exports = router;