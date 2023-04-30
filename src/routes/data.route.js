const router = require('express').Router();
const {
  adddata,
} = require('../controllers/data.controller');
router.post('/add-data', adddata);

module.exports = router;