 var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
    options: {
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
          },
          ticks: {
            fontSize: 13,
            fontColor: 'lightgrey'
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
          },
          ticks: {
            beginAtZero: true,
            fontSize: 13,
            fontColor: 'lightgrey',
            maxTicksLimit: 5,
            padding: 25,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#1e90ff'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [0, 0, 0, 11, 9, 17, 13],
      tension: 0.0,
      borderColor: '#02d1b8',
      backgroundColor: 'rgba(0,0,0,0.0)',
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1
    }]
  }
});
   