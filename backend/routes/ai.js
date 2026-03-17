const express = require("express");
const router = express.Router();

router.post("/analyze", (req, res) => {

    console.log("Request received:", req.body);

    const { text } = req.body;

    const result = {
        billType: "Water Bill",
        amount: "1500",
        dueDate: "April 1",
        suggestion: "Set reminder two days before due date"
    };

    res.json(result);

});

module.exports = router;