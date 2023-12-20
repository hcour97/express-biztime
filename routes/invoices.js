const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const { route } = require("../app");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices ORDER BY id`);
        return res.json({ invoices: results.rows})
    } catch (err) {
        return next(err)
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;

        const results = await db.query(`SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description 
        FROM invoices as i
        INNER JOIN companies AS c ON (i.comp_code = c.code) 
        WHERE id=$1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Sorry. Cannot find invoice with id of ${id}`, 404);
        }
        // format the data results:
        const data = results.rows[0]
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_data: data.paid_date,
        }
        return res.json({ "invoice": invoice})
    } catch (err) {
        return next(err)
    }
});

router.post('/', async (req, res, next) => {
    try {
        let {comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) 
        VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
        [comp_code, amt]);
        return res.json({ "invoice": results.rows[0]})
    } catch (err) {
        return next(err)
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let {amt, paid} = req.body;
        let paidDate = null;

        const currRes = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [id]);

        if (currRes.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404);
        }

        const currPaidDate = currRes.rows[0].paid_data;
        if (!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }

        const results = await db.query(`UPDATE invoices 
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [amt, paid, paidDate, id])

            return res.json({"invoice": results.rows[0]})
    }  catch (err) {
        return next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id])
        return res.json({status: "DELETED."});
    } catch (err) {
        return next(err)
    }
});

module.exports = router;