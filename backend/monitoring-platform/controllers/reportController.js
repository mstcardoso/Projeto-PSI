const asyncHandler = require("express-async-handler");
const { ActRules, WcagTechniques, Report} = require("../models/Report");
const { ObjectId } = require("mongodb");

exports.report_regist = asyncHandler(async (req, res, next) => {
    try {
        const report = await Report.create({ 
          data: req.body.report, 
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: "Falha ao registrar o report", error: error.message });
    }
  });

exports.getActRulesById = asyncHandler(async (req, res, next) => {
    try {
      const actRuleData = await ActRules.findById(req.params.id);
      res.status(200).json(actRuleData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar os dados de act_rules", error: error.message });
    }
});
  
exports.getWcagById = asyncHandler(async (req, res, next) =>{
    try {
      const wcagTechniqueData = await WcagTechniques.findById(req.params.id);
      res.status(200).json(wcagTechniqueData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar os dados de wcag_techniques", error: error.message });
    }
});

exports.getReportById = asyncHandler(async (req, res, next) =>{
    try {
      const report = await Report.findById(req.params.id);
      res.status(200).json(report);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar o report", error: error.message });
    }
});
  
exports.deleteReportById = asyncHandler(async (req, res, next) => {
    try {
      const report = await Report.findById(req.params._id);
      if (!report) {
        return res.status(404).json({ message: "Relatório não encontrado" });
      }
  
      await ActRules.findByIdAndDelete(report.act_rules._id);
      await WcagTechniques.findByIdAndDelete(report.wcag_techniques_id);
      await Report.findByIdAndDelete(req.params._id);
      
      res.status(200).json({ message: "Report excluído com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao excluir o Report", error: error.message });
    }
});
  