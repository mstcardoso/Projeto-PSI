const express = require("express");
const router = express.Router();

const reportController = require('../controllers/reportController');

router.post('/report', reportController.report_regist);

router.get('/report/act-rules/:id', reportController.getActRulesById);

router.get('/report/wcag-techniques/:id', reportController.getWcagById);

router.get('/report/:id', reportController.getReportById);

router.delete('/report/:_id', reportController.deleteReportById);

module.exports = router;