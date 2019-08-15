
var trans = document.getElementById('trans').getContext('2d');

var myTrans = new Chart(trans, {
  type: 'line',
    options: {
        maintainAspectRatio:false,
       
        layout:{
            padding:{
                left:90,
                right:90,
                top:0,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            color:'white'
          },
          ticks: {
            fontSize: 11,
            fontColor: 'lightgrey'
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
          },
          ticks: {
            beginAtZero: true,
            fontSize: 11,
            fontColor: 'lightgrey',
            maxTicksLimit: 5,
            padding: 20,
            tension:0,
            lineTension:0,
            bezierCurve : false
          }
        }]
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep','Oct','Nov', 'Dec'],
        datasets: [{
            fill:false,
            backgroundColor: 'white',
            borderColor: '#96f4f4',
            data: [20, 16, 24, 40, 19, 37, 53,27, 20, 45, 35, 30],
        }]
    }
});
var ds = document.getElementById('disease').getContext('2d');

var dsChart = new Chart(ds, {
  type: 'bar',
    options: {
        maintainAspectRatio:false,
       
        layout:{
            padding:{
                left:90,
                right:90,
                top:0,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            color:'white'
          },
          ticks: {
            fontSize: 11,
            fontColor: 'lightgrey'
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
          },
          ticks: {
            beginAtZero: true,
            fontSize: 11,
            fontColor: 'lightgrey',
            maxTicksLimit: 5,
            padding: 20,
            tension:0,
            lineTension:0,
            bezierCurve : true
          }
        }]
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['ampiclose', 'amathem', 'condom', 'vc', 'destrosaline','syringe', 'pcm', 'tramol', 'peniciline','spirits','quinine', 'pad'],
    datasets: [{
      data: [10, 16, 24, 30, 19, 37, 53,27, 20, 15, 35, 30],
      tension: 0.0,
      borderColor: '#96f4f4',
      backgroundColor: '#96f4f4',
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
      lineTension:0
    }]
  }
});
   
var status = document.getElementById('status-chart').getContext('2d');

var myChart0 = new Chart(status, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:90,
        // circumference:6,
        layout:{
            padding:{
                left:20,
                right:20,
                top:20,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
       
      
      },
      tooltips: {
        backgroundColor: 'lightgrey'
      }
    },
    data: {
      labels: ['Expired', 'Below Avg','Out of Stock','Above Avg'],
    datasets: [{
      data: [5, 17,20, 40],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['#92f79','#dfe3e6', '#96f4f4','#92f792'],
      pointBackgroundColor: ['white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});
var categories = document.getElementById('category-chart').getContext('2d');

var myChart0 = new Chart(categories, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:90,
        // circumference:6,
        layout:{
            padding:{
                left:20,
                right:20,
                top:20,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
       
      
      },
      tooltips: {
        backgroundColor: 'lightgrey'
      }
    },
    data: {
      labels: ['Expired', 'Below Avg','Out of Stock','Above Avg'],
    datasets: [{
      data: [4, 17, 25, 40],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['red','#dfe3e6', '#96f4f4','#92f792'],
      pointBackgroundColor: ['white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});

   

   




