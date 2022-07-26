const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'antokenforjwt';


// Route 1 : Create a User using :POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {

    // If threre are errors return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check wheather the user exist with same email already
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ errors: 'Email already registered!' });
        }

        // Creating new User if not found
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ authToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})



// Route 2 : Authenticate a User using :POST "/api/auth/login". No login required 
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Enter a Password').exists()
], async (req, res) => {

    // If threre are errors return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // All okay then hit tje API with Data
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passCompare = await bcrypt.compare(password, user.password)
        if (!passCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ authToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})




// Route 3 : Get login user Details using : POST "/api/auth/getuser". login required 
router.post('/getuser',fetchuser,async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;