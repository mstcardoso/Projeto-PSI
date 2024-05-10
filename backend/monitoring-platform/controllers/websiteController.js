const Website = require("../models/Website");
const WebsitePage = require("../models/WebsitePage")
const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongodb");
// importar avaliador do pacote
const { QualWeb } = require('@qualweb/core');


// o avaliador usa instâncias do browser cccccccccccccChrome para executar a avaliação
// definir as diferentes opções a usar
// plugins para bloquear anúncios e para que não seja detectado que o browser que está a ser usado em modo automático
const plugins = {
  adBlock: true, // Default value = false
  stealth: true // Default value = false
};
// o avaliador cria um cluster de páginas em avaliação
// definir o tempo que cada tab do browser vai esperar pelo fim do carregamento da página
const clusterOptions = {
  timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
};
// opções para lançamento do browser
const launchOptions = {
};

exports.evaluate_page = asyncHandler(async (req, res, next) => {
  var report
  try {
    // criar instância do avaliador
    const qualweb = new QualWeb(plugins);

    // iniciar o avalidor
    await qualweb.start(clusterOptions, launchOptions);
    
    // especificar as opções, incluindo o url a avaliar
    const qualwebOptions = {
        url: req.body.url // substituir pelo url a avaliar
    };

    // executar a avaliação, recebendo o relatório
    report = await qualweb.evaluate(qualwebOptions);

    // parar o avaliador
    await qualweb.stop();
  } catch (error) {
    console.log("123")
    const updatePage = await WebsitePage.findOneAndUpdate({_id: req.body.id}, {monitoringStatus: "Erro na avaliação"});
    res.status(500).json({message: "Erro na avaliação"});
    return
  }

  try {
    var failedA = false
    var failedAA = false 
    var failedAAA = false
    var failedTests = []
    const commonErrors = new Map()
    //console.log(report[req.body.url]['modules']['wcag-techniques']['assertions'])
    for(let assertion of Object.keys(report[req.body.url]['modules']['act-rules']['assertions'])) {
      for(let element of Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'])){
        if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'][element]['failed'] > 0)) {
          if(assertion in commonErrors){
            commonErrors[assertion] = (parseInt(commonErrors[assertion]) + 1).toString()
          }
          else {
            commonErrors[assertion] = '1'
          }
          for(let criteria of Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'][element])){
            if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'A')){
              failedA = true
            }
            if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'AA')){
              failedAA = true
            }
            if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'AAA')){
              failedAAA = true
            }
          }
        }
      }


      /* for(let result of Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['results'])){
        if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['results'][result]['verdict'] == 'failed')){

        //TODO CONSIDERAR COMO PAGINA C ERRO
        }
          
      } */
    }

    
    for(let assertion of Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'])) {
      for(let element of Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'])){
        if(Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'][element]['failed'] > 0)) {
          if(assertion in commonErrors){
            commonErrors[assertion] = (parseInt(commonErrors[assertion]) + 1).toString()
          }
          else {
            commonErrors[assertion] = '1'
          }
          for(let criteria of Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'][element])){
            if(Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'A')){
              failedA = true
            }
            if(Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'AA')){
              failedAA = true
            }
            if(Object.keys(report[req.body.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata'][element][criteria]['level'] == 'AAA')){
              failedAAA = true
            }
          }
        }
      }

      /* for(let result of Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['results'])){
        if(Object.keys(report[req.body.url]['modules']['act-rules']['assertions'][assertion]['results'][result]['verdict'] == 'failed')){

        //TODO CONSIDERAR COMO PAGINA C ERRO
        }
          
      } */
    }
    

    failedTests = [failedA, failedAA, failedAAA]
    
    let entries = Object.entries(commonErrors);

    entries.sort((a, b) => b[1] - a[1]);
    
    let sortedCommonErrors = Object.fromEntries(entries);

    // enviar se o pagina tem erro
    // enviar se tem erros A AA AAA para WebsitePage
    // enviar top 10 erros guardar no mapa

    const date = report[req.body.url]['system']['date'] // guardar esta data na DB
    console.log("----------------")
    console.log(req.body.id)
    console.log(date)
    console.log(sortedCommonErrors)
    
    // atualizar pagina
    let estado = "Conforme"
    if(failedTests[0] || failedTests[1])
      estado = "Não conforme"
    const updatePage = await WebsitePage.findOneAndUpdate({_id: req.body.id}, {monitoringStatus: estado, lastEvaluationDate: date, errorsType: failedTests, commonErrors: sortedCommonErrors});

    if (!updatePage) {
        return res.status(404).json({ message: 'Website não encontrado' });
    }

    res.status(201).json(updatePage);
  } catch (error) {
      res.status(500).json({ message: "erro", error: error.message });
  }
});

exports.website_regist = asyncHandler(async (req, res, next) => {
    try {
        const newWebsite = await Website.create({ 
          url: req.body.url, 
          monitoringStatus: 'Por avaliar', 
          registrationDate: new Date(), 
          pages: []
        });
        res.status(201).json(newWebsite);
    } catch (error) {
        res.status(500).json({ message: "Falha ao registrar o website", error: error.message });
    }
});

exports.page_regist = asyncHandler(async (req, res, next) => {

  try {
      const newPage = await WebsitePage.create({ 
        url: req.body.url,
        monitoringStatus: 'Por avaliar'
      });

      res.status(201).json(newPage);

  } catch (error) {
      res.status(500).json({ message: "Falha ao registrar o website", error: error.message });
  }
});

exports.website_list = asyncHandler(async (req, res, next) => {
  try {
    const list_websites = await Website.find({}, "_id url monitoringStatus registrationDate lastEvaluationDate pages");
    const formattedWebsites = await Promise.all(list_websites.map(async (website) => {
      const pages = await getPageList(website.pages);
      return { 
        id: website._id.toString(), 
        url: website.url, 
        monitoringStatus: website.monitoringStatus, 
        registrationDate: website.registrationDate, 
        lastEvaluationDate: website.last, 
        pages: pages
      };
    }));
    res.json(formattedWebsites);
  } catch (err) {
    return next(err);
  }
});

const getPageList = async (pageIds) => {
  try {
    const list_pages = await WebsitePage.find({ _id: { $in: pageIds } }, "_id url monitoringStatus");
    const formattedPages = list_pages.map((page) => {
      return { id: page._id.toString(), url: page.url, monitoringStatus: page.monitoringStatus};
    });
    return formattedPages;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

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
    //console.log(req.body);
    const websiteId = req.params._id;
    const {pages } = req.body;

    const updatedPages = pages.map(page => {
        if (!page._id) {
            page._id = page.id;
            delete page.id;
        }

        if (!page.__v) {
            page.__v = 0;
        }

        return page;
    });
    
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


exports.page_delete_get = asyncHandler(async (req, res, next) => {
  try {
    const pageId = req.params._id;
    if (!ObjectId.isValid(pageId)) {
      const err = new Error("ID da página inválido");
      err.status = 400; // Bad request
      return next(err);
    }

    const deletedPage = await WebsitePage.findByIdAndDelete(pageId);
    if (!deletedPage) {
      const err = new Error("Página não encontrada");
      error.status = 404;
      return next(error);
    }
    res.json({ message: "Página apagada corretamente", deletedPage });
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