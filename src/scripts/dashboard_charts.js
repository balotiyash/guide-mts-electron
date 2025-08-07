/** 
 * File: dashboard_charts.js
 * Author: Yash Balotiya
 * Description: Main script for the Dashboard page. This script initializes the charts on the dashboard.
 * Created on: 04/08/2025
 * Last Modified: 04/08/2025
*/

// const Chart = require('chart.js/auto');

window.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('chart1').getContext('2d');

    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: 'Total Students Enrolled',
                data: [12, 19, 3, 5, 2, 3, 7, 8, 6, 10, 15, 20],
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
            responsive: false, // <== disable responsive resizing
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctx1 = document.getElementById('chart2').getContext('2d');
    const myChart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: 'Total Earnings',
                data: [65, 59, 80, 81, 56, 55, 40, 65, 70, 75, 80, 90],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false // Set to true to fill the area under the line
            },
            {
                label: 'Car Fuel Consumption',
                data: [10, 20, 15, 25, 30, 22, 18, 24, 28, 26, 30, 35],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false
            }]
        },
        options: {
            responsive: false, // <== disable responsive resizing
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false,
                    text: 'My Line Chart'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }

    });

    const ctx3 = document.getElementById('chart3').getContext('2d');
    const myChart3 = new Chart(ctx3, {
        type: 'doughnut',
        data: {
            labels: ['Wagon R', 'Swift', 'Baleno', 'Alto', 'Innova', 'Fortuner'],
            datasets: [{
                label: 'Votes',
                data: [12, 19, 3, 5, 2, 3, 7],
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
            responsive: false, // <== disable responsive resizing
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
