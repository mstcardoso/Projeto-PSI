const express = require("express");
const router = express.Router();

const websiteController = require('../controllers/websiteController');

router.post('/website', websiteController.website_regist);

router.get('/websites', websiteController.website_list);

router.get('/website/:_id', websiteController.website_detail);

router.put('/website/:_id', websiteController.website_update)

router.put('/page/:_id', websiteController.page_update)

router.post('/page', websiteController.page_regist);

router.get('/pages', websiteController.page_list);

router.post('/init', websiteController.init);

router.delete("/website/:_id", websiteController.website_delete_get);

router.delete("/page/:_id", websiteController.page_delete_get);

router.post("/page/evaluate", websiteController.evaluate_page);

module.exports = router;