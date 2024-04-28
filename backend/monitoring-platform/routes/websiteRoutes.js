const express = require("express");
const router = express.Router();

const websiteController = require('../controllers/websiteController');

router.post('/website', websiteController.website_regist);

router.get('/websites', websiteController.website_list);

router.get('/website/:_id', websiteController.website_detail);

router.put('/website/:_id', websiteController.website_update)

router.post('/page', websiteController.page_regist);

router.get('/pages', websiteController.page_list);

router.post('/init', websiteController.init);

module.exports = router;