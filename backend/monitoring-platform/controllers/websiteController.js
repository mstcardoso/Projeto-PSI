const Website = require("../models/Website");
const WebsitePage = require("../models/WebsitePage")
const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");

exports.website_regist = asyncHandler(async (req, res, next) => {
    const { url, monitoringStatus, registrationDate, pages } = req.body;

    try {
        const newWebsite = await Website.create({ url, monitoringStatus, registrationDate, pages });

        res.status(201).json(newWebsite);

    } catch (error) {
        res.status(500).json({ message: "Falha ao registrar o website", error: error.message });
    }
});

exports.page_regist = asyncHandler(async (req, res, next) => {
  const { url, monitoringStatus} = req.body;

  try {
      const newPage = await WebsitePage.create({ url, monitoringStatus});

      res.status(201).json(newPage);

  } catch (error) {
      res.status(500).json({ message: "Falha ao registrar o website", error: error.message });
  }
});

exports.website_list = asyncHandler(async (req, res, next) => {
    try {
      const list_websites = await Website.find({}, "_id url monitoringStatus registrationDate lastEvaluationDate pages");
      const formattedWebsites = list_websites.map((website) => {
        return { id: website._id.toString(), url: website.url, monitoringStatus: website.monitoringStatus, registrationDate: website.registrationDate, lastEvaluationDate: website.last, pages: website.pages};
      });
      res.json(formattedWebsites);
    } catch (err) {
      return next(err);
    }
  });

  exports.page_list = asyncHandler(async (req, res, next) => {
    try {
      const list_pages = await WebsitePage.find({}, "_id url monitoringStatus");
      const formattedPages = list_pages.map((page) => {
        return { id: page._id.toString(), url: page.url, monitoringStatus: page.monitoringStatus};
      });
      res.json(formattedPages);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  });


exports.website_update = asyncHandler(async (req, res, next) => { 
    const websiteId = req.params._id;
    const {pages } = req.body;
    
    try {
       const updatePage = await Website.findOneAndUpdate({_id: websiteId}, {pages: pages});

       if (!updatePage) {
          return res.status(404).json({ message: 'Website não encontrado' });
       }

       res.json(updatePage);

    } catch (error) {
      res.status(500).json({ message: "Falha ao atualizar o website", error: error.message });
    }
});

exports.website_detail = asyncHandler(async (req, res, next) => {
  try {
    const websiteId = req.params._id;
    if (!ObjectId.isValid(websiteId)) {
      const err = new Error("ID do website inválido");
      err.status = 400; // Bad request
      return next(err);
    }

    const website = await Website.findById(websiteId);
    if (!website) {
      const err = new Error("Website não encontrado");
      err.status = 404;
      return next(err);
    }

    res.json(website);
  } catch (err) {
    return next(err);
  }
});

exports.website_detail = asyncHandler(async (req, res, next) => {
  try {
    const websiteId = req.params._id;
    const website = await Website.findById(websiteId).populate('pages').exec();
    if (!website) {
      return res.status(404).json({ error: "Website não encontrado" });
    }
    res.json(website);
  } catch (error) {
    next(error);
  }
});

exports.website_delete_get = asyncHandler(async (req, res, next) => {
  try {
    const websiteId = req.params._id;
    if (!ObjectId.isValid(websiteId)) {
      const err = new Error("ID do website inválido");
      err.status = 400; // Bad request
      return next(err);
    }

    const deletedWebsite = await Website.findByIdAndDelete(websiteId);
    if (!deletedWebsite) {
      const err = new Error("Website não encontrado");
      error.status = 404;
      return next(error);
    }
    res.json({ message: "Website deleted successfully", deletedWebsite });
  } catch (err) {
    return next(err);
  }
});

exports.init = asyncHandler(async (req, res, next) => {

  const page1 = await WebsitePage.create({
    url: 'https://www.google.com/email',
    lastEvaluationDate: new Date(),
    monitoringStatus: 'Conforme'
  });
  const page2 = await WebsitePage.create({
    url: 'https://www.google.com/maps',
    lastEvaluationDate: new Date(),
    monitoringStatus: 'Não conforme'
  });

  const website = await Website.create({
    url: 'https://www.google.com',
    monitoringStatus: 'Por avaliar',
    registrationDate: new Date(),
    lastEvaluationDate: new Date(),
    pages: [page1._id, page2._id]
  });

  const page3 = await WebsitePage.create({
    url: 'https://www.facebook.com/messages',
    lastEvaluationDate: new Date(),
    monitoringStatus: 'Conforme'
  });
  const page4 = await WebsitePage.create({
    url: 'https://www.facebook.com/photos',
    lastEvaluationDate: new Date(),
    monitoringStatus: 'Não conforme'
  });

  const website2 = await Website.create({
    url: 'https://www.facebook.com',
    monitoringStatus: 'Por avaliar',
    registrationDate: new Date(),
    lastEvaluationDate: new Date(),
    pages: [page3._id, page4._id]
  });

  res.status(201).json({ message: 'Dados inicializados com sucesso' });
});