/** 
 * File: src/scripts/renderer/dashboard_charts.js
 * Author: Yash Balotiya
 * Description: Handles all chart rendering for the dashboard.
 * Created on: 04/08/2025
 * Last Modified: 27/08/2025
*/

// Charts Instances
let chart1Instance = null;
let chart2Instance = null;
let chart3Instance = null;

// Initialize all charts
const initCharts = (chart1Data, chart2RevenueData, chart2FuelData, chart3Names, chart3Counts) => {
    // ---------- Chart 1 ----------
    if (!chart1Instance) {
        const ctx1 = document.getElementById('chart1').getContext('2d');
        chart1Instance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: [
                    'January','February','March','April','May','June',
                    'July','August','September','October','November','December'
                ],
                datasets: [{
                    label: 'Total Students Enrolled',
                    data: chart1Data,
                    // Multiple bg colors
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(201, 203, 207, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        chart1Instance.data.datasets[0].data = chart1Data;
        chart1Instance.update();
    }

    // ---------- Chart 2 ----------
    if (!chart2Instance) {
        const ctx2 = document.getElementById('chart2').getContext('2d');
        chart2Instance = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [
                    'January','February','March','April','May','June',
                    'July','August','September','October','November','December'
                ],
                datasets: [
                    {
                        label: 'Total Earnings',
                        data: chart2RevenueData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false
                    },
                    {
                        label: 'Car Fuel Consumption',
                        data: chart2FuelData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        chart2Instance.data.datasets[0].data = chart2RevenueData;
        chart2Instance.data.datasets[1].data = chart2FuelData;
        chart2Instance.update();
    }

    // ---------- Chart 3 ----------
    if (!chart3Instance) {
        const ctx3 = document.getElementById('chart3').getContext('2d');
        chart3Instance = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: chart3Names,
                datasets: [{
                    label: 'Vehicle Usage',
                    data: chart3Counts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false
            }
        });
    } else {
        chart3Instance.data.labels = chart3Names;
        chart3Instance.data.datasets[0].data = chart3Counts;
        chart3Instance.update();
    }
};

export default initCharts;
