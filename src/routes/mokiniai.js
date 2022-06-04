const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loggedInMiddleware } = require('../../middleware/loggedIn');

const { jwtSecret } = require('../../../config');
const loggedIn = require('../../middleware/loggedIn');

const router = Router();

async function getDalyviai(mysql, user_id) {
    const query = `
            SELECT 
                d.id,
                d.firstname,
                d.lastname,
                d.email,
                d.birth_date,
                d.user_id
            FROM 
                dalyviai d
                WHERE user_id = ?               
            ;
            `;

    const [mokiniai] = await mysql.query(query, [user_id]);

    return mokiniai;
}

router.post('/', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;
    const { firstname, lastname, email, birth_date } = req.body

    try {
        const query = `
        INSERT INTO mokiniai 
            (firstname, lastname, email, birth_date, user_id)
        VAlUES 
            (?, ?, ?, ?, ?)
        `;

        await mysql.query(
            query,
            [firstname, lastname, email, birth_date, user_id]
        );

        return res.status(201).send({
            firstname,
            lastname,
            email,
            birth_date,
            user_id
        })
    } catch (error) {
        res.status(500).send({
            error: error.message,
        });
    }
})

router.get("/", loggedInMiddleware, async (req, res) => {
    try {
        const { mysql } = req.app;

        console.log(req.token);

        const user_id = req.token.id;

        const dalyviai = await getDalyviai(mysql, user_id);

        res.send({
            mokiniai,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message,
        });
    }
});


router.patch('/', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;

    const { id, firstname, lastname, email, birth_date } = req.body

    try {
        const query = `
            UPDATE dalyviai 
                SET
                    firstname = ?,
                    lastname = ?,
                    email = ?, 
                    birth_date = ?
                WHERE
                    user_id = ?
                    AND
                    id = ?
        `;

        await mysql.query(
            query,
            [firstname, lastname, email, birth_date, user_id, id]
        );

        return res.status(201).send({
            firstname,
            lastname,
            email,
            birth_date,
            user_id
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message,
        });
    }
})

router.delete('/:dalyvio_id', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;
    const dalyvio_id = req.params.dalyvio_id;

    try {
        const query = `
            DELETE FROM dalyviai
                WHERE
                    user_id = ?
                    AND
                    id = ?
        `;

        await mysql.query(
            query,
            [user_id, dalyvio_id]
        );

        return res.status(201).send({
            dalyvio_id
        });
    } catch (error) {
        res.status(500).send({
            error: error.message,
        });
    }
})



module.exports = router;