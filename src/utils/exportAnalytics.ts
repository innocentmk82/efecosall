import { AnalyticsData } from './analytics';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  timeRange: string;
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export function exportAnalyticsData(data: AnalyticsData, options: ExportOptions): void {
  switch (options.format) {
    case 'csv':
      exportToCSV(data, options);
      break;
    case 'json':
      exportToJSON(data, options);
      break;
    case 'pdf':
      exportToPDF(data, options);
      break;
  }
}

function exportToCSV(data: AnalyticsData, options: ExportOptions): void {
  const csvContent = generateCSVContent(data, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateCSVContent(data: AnalyticsData, options: ExportOptions): string {
  const headers = [
    'Metric',
    'Value',
    'Unit',
    'Time Range'
  ];

  const rows = [
    ['Total Fuel Used', data.totalFuelUsed.toString(), 'L', `${options.timeRange} days`],
    ['Total Cost', data.totalCost.toString(), 'E', `${options.timeRange} days`],
    ['Average Efficiency', data.averageEfficiency.toFixed(2), 'L/100km', `${options.timeRange} days`],
    ['Total Trips', data.totalTrips.toString(), 'trips', `${options.timeRange} days`],
    ['Anomalies Detected', data.anomaliesCount.toString(), 'count', `${options.timeRange} days`]
  ];

  if (options.includeDetails) {
    // Add vehicle performance data
    data.vehiclePerformance.forEach(vehicle => {
      rows.push([
        `Vehicle - ${vehicle.name}`,
        vehicle.fuelUsed.toString(),
        'L',
        `${options.timeRange} days`
      ]);
    });

    // Add driver performance data
    data.driverPerformance.forEach(driver => {
      rows.push([
        `Driver - ${driver.name}`,
        driver.fuelUsed.toString(),
        'L',
        `${options.timeRange} days`
      ]);
    });
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

function exportToJSON(data: AnalyticsData, options: ExportOptions): void {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      timeRange: options.timeRange,
      format: 'json'
    },
    summary: {
      totalFuelUsed: data.totalFuelUsed,
      totalCost: data.totalCost,
      averageEfficiency: data.averageEfficiency,
      totalTrips: data.totalTrips,
      anomaliesCount: data.anomaliesCount
    },
    details: options.includeDetails ? {
      vehiclePerformance: data.vehiclePerformance,
      driverPerformance: data.driverPerformance,
      departmentStats: data.departmentStats,
      budgetStatus: data.budgetStatus,
      recentAnomalies: data.recentAnomalies
    } : undefined
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToPDF(data: AnalyticsData, options: ExportOptions): void {
  // This would require a PDF library like jsPDF
  // For now, we'll create a simple HTML report that can be printed
  const reportHTML = generateReportHTML(data, options);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  }
}

function generateReportHTML(data: AnalyticsData, options: ExportOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 30px; }
        .metric { margin-bottom: 10px; }
        .metric-label { font-weight: bold; }
        .details { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Analytics Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Time Range: Last ${options.timeRange} days</p>
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="metric">
          <span class="metric-label">Total Fuel Used:</span> ${data.totalFuelUsed.toFixed(1)}L
        </div>
        <div class="metric">
          <span class="metric-label">Total Cost:</span> E${data.totalCost.toLocaleString()}
        </div>
        <div class="metric">
          <span class="metric-label">Average Efficiency:</span> ${data.averageEfficiency.toFixed(1)}L/100km
        </div>
        <div class="metric">
          <span class="metric-label">Total Trips:</span> ${data.totalTrips}
        </div>
        <div class="metric">
          <span class="metric-label">Anomalies Detected:</span> ${data.anomaliesCount}
        </div>
      </div>
      
      ${options.includeDetails ? `
        <div class="details">
          <h2>Vehicle Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Fuel Used (L)</th>
                <th>Cost (E)</th>
                <th>Efficiency (L/100km)</th>
                <th>Trips</th>
              </tr>
            </thead>
            <tbody>
              ${data.vehiclePerformance.map(vehicle => `
                <tr>
                  <td>${vehicle.name}</td>
                  <td>${vehicle.fuelUsed.toFixed(1)}</td>
                  <td>${vehicle.cost.toLocaleString()}</td>
                  <td>${vehicle.efficiency.toFixed(1)}</td>
                  <td>${vehicle.trips}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Driver Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Fuel Used (L)</th>
                <th>Cost (E)</th>
                <th>Efficiency (L/100km)</th>
                <th>Trips</th>
              </tr>
            </thead>
            <tbody>
              ${data.driverPerformance.map(driver => `
                <tr>
                  <td>${driver.name}</td>
                  <td>${driver.fuelUsed.toFixed(1)}</td>
                  <td>${driver.cost.toLocaleString()}</td>
                  <td>${driver.efficiency.toFixed(1)}</td>
                  <td>${driver.trips}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

export function generateAnalyticsReport(data: AnalyticsData, options: ExportOptions): string {
  const report = {
    title: 'Analytics Report',
    generatedAt: new Date().toISOString(),
    timeRange: options.timeRange,
    summary: {
      totalFuelUsed: data.totalFuelUsed,
      totalCost: data.totalCost,
      averageEfficiency: data.averageEfficiency,
      totalTrips: data.totalTrips,
      anomaliesCount: data.anomaliesCount
    },
    insights: generateInsights(data),
    recommendations: generateRecommendations(data)
  };

  return JSON.stringify(report, null, 2);
}

function generateInsights(data: AnalyticsData): string[] {
  const insights = [];
  
  if (data.averageEfficiency > 15) {
    insights.push('Fleet efficiency is above optimal levels. Consider driver training programs.');
  }
  
  if (data.anomaliesCount > 0) {
    insights.push(`${data.anomaliesCount} fuel anomalies detected. Review recent trips for unusual patterns.`);
  }
  
  if (data.totalCost > 10000) {
    insights.push('High fuel costs detected. Consider route optimization and fuel efficiency improvements.');
  }
  
  return insights;
}

function generateRecommendations(data: AnalyticsData): string[] {
  const recommendations = [];
  
  if (data.averageEfficiency > 15) {
    recommendations.push('Implement driver efficiency training programs');
    recommendations.push('Consider vehicle maintenance to improve fuel efficiency');
  }
  
  if (data.anomaliesCount > 0) {
    recommendations.push('Investigate fuel anomalies to prevent future issues');
    recommendations.push('Review driver behavior and route planning');
  }
  
  recommendations.push('Monitor fuel consumption trends regularly');
  recommendations.push('Set up automated alerts for budget thresholds');
  
  return recommendations;
} 