const Worker = require('../models/Worker');
const Alert = require('../models/Alert');
const { sequelize } = require('../utils/database');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const report = await generateReport(today, tomorrow);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const report = await generateReport(weekAgo, today);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const report = await generateReport(monthAgo, today);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPPEComplianceReport = async (req, res) => {
  try {
    const workers = await Worker.findAll();
    const totalWorkers = workers.length;
    const compliantWorkers = workers.filter(w => 
      w.ppeCompliance && w.ppeCompliance.compliant
    ).length;
    
    const complianceData = {
      overall: (compliantWorkers / totalWorkers * 100).toFixed(2),
      helmet: workers.filter(w => w.ppeCompliance?.helmet).length,
      mask: workers.filter(w => w.ppeCompliance?.mask).length,
      vest: workers.filter(w => w.ppeCompliance?.vest).length,
      byDepartment: {}
    };
    
    // Group by department
    workers.forEach(worker => {
      if (!complianceData.byDepartment[worker.department]) {
        complianceData.byDepartment[worker.department] = {
          total: 0,
          compliant: 0
        };
      }
      complianceData.byDepartment[worker.department].total++;
      if (worker.ppeCompliance?.compliant) {
        complianceData.byDepartment[worker.department].compliant++;
      }
    });
    
    res.json({ success: true, complianceData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkerPerformanceReport = async (req, res) => {
  try {
    const workers = await Worker.findAll();
    const performanceData = workers.map(worker => ({
      workerId: worker.workerId,
      name: worker.name,
      department: worker.department,
      totalActiveTime: worker.totalActiveTime,
      status: worker.status,
      ppeCompliance: worker.ppeCompliance,
      efficiency: calculateEfficiency(worker)
    }));
    
    res.json({ success: true, performanceData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { format } = req.query;
    
    let reportData;
    switch(reportType) {
      case 'daily':
        reportData = await exports.getDailyReport({}, { json: () => {} });
        break;
      case 'weekly':
        reportData = await exports.getWeeklyReport({}, { json: () => {} });
        break;
      case 'monthly':
        reportData = await exports.getMonthlyReport({}, { json: () => {} });
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid report type' });
    }
    
    if (format === 'pdf') {
      await generatePDFReport(reportData, res);
    } else if (format === 'excel') {
      await generateExcelReport(reportData, res);
    } else {
      res.json({ success: true, data: reportData });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function generateReport(startDate, endDate) {
  const workers = await Worker.findAll();
  const alerts = await Alert.findAll({
    where: {
      timestamp: {
        [Op.between]: [startDate, endDate]
      }
    }
  });
  
  return {
    period: {
      start: startDate,
      end: endDate
    },
    summary: {
      totalWorkers: workers.length,
      activeWorkers: workers.filter(w => w.status === 'active').length,
      totalAlerts: alerts.length,
      resolvedAlerts: alerts.filter(a => a.resolved).length,
      ppeComplianceRate: calculateComplianceRate(workers)
    },
    alerts: alerts.map(alert => ({
      type: alert.alertType,
      severity: alert.severity,
      count: 1
    })).reduce((acc, curr) => {
      const key = `${curr.type}_${curr.severity}`;
      acc[key] = (acc[key] || 0) + curr.count;
      return acc;
    }, {}),
    workers: workers.map(worker => ({
      workerId: worker.workerId,
      department: worker.department,
      activeTime: worker.totalActiveTime,
      status: worker.status
    }))
  };
}

function calculateComplianceRate(workers) {
  const compliant = workers.filter(w => w.ppeCompliance?.compliant).length;
  return (compliant / workers.length * 100).toFixed(2);
}

function calculateEfficiency(worker) {
  // Calculate efficiency based on active time vs expected time
  const expectedTime = 8 * 3600000; // 8 hours in milliseconds
  const efficiency = (worker.totalActiveTime / expectedTime * 100);
  return Math.min(100, efficiency.toFixed(2));
}

async function generatePDFReport(reportData, res) {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  doc.pipe(res);
  
  doc.fontSize(20).text('Workforce Safety Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${reportData.report.period.start} to ${reportData.report.period.end}`);
  doc.moveDown();
  doc.text(`Total Workers: ${reportData.report.summary.totalWorkers}`);
  doc.text(`Active Workers: ${reportData.report.summary.activeWorkers}`);
  doc.text(`Total Alerts: ${reportData.report.summary.totalAlerts}`);
  doc.text(`PPE Compliance Rate: ${reportData.report.summary.ppeComplianceRate}%`);
  
  doc.end();
}

async function generateExcelReport(reportData, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Safety Report');
  
  worksheet.columns = [
    { header: 'Worker ID', key: 'workerId', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Active Time (hours)', key: 'activeTime', width: 20 },
    { header: 'Status', key: 'status', width: 15 }
  ];
  
  reportData.report.workers.forEach(worker => {
    worksheet.addRow({
      workerId: worker.workerId,
      department: worker.department,
      activeTime: (worker.activeTime / 3600000).toFixed(2),
      status: worker.status
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
  
  await workbook.xlsx.write(res);
  res.end();
}