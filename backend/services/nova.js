async function analyzeBill(text) {

    console.log("Received text:", text);

    return {
        billType: "Water Bill",
        amount: "1500",
        dueDate: "April 1",
        suggestion: "Set reminder two days before the due date"
    }
}

module.exports = { analyzeBill}