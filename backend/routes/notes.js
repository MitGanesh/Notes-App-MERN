const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');


// Route 1 : Get all Notes using :GET "/api/notes/createuser". login required
router.get('/allnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})



// Route 2 : Add a new Note using :POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid Title').isLength({ min: 3 }),
    body('description', 'Enter a Brief Description').isLength({ min: 5 })], async (req, res) => {
        // If threre are errors return Bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // If threre is no error create new note by using Notes Model
            const { title, description, tag } = req.body;
            const note = new Notes({
                title, description, tag, user: req.user.id,
            })

            const saveNote = await note.save();
            res.json(saveNote)
        } catch (error) {
            console.error(error.message)
            res.status(500).send("Internal Server Error")
        }
    })



// Route 3 : Update an existing note using :PUT "/api/notes/updatenote". login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Find the note that to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findOneAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})




// Route 4 : Delete an existing note using :DELET "/api/notes/deletenote". login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    // Find the note that to be updated and update it
    try {
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found")
        }
    
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has deleted", note: note })
        
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;