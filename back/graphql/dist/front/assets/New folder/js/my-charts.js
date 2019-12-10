var ctx = document.getElementById('myChart').getContext('2d');

var myChart = new Chart(ctx, {
  type: 'bar',
    options: {
        maintainAspectRatio:false,
        layout:{
            padding:{
                left:100,
                right:190,
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
            // color:whitesmoke
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
          }
        }]
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [6, 10, 12, 18, 8, 7, 0],
      tension: 0.0,
      borderColor: '#96f4f4',
      backgroundColor: '#96f4f4',
      pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1
    }]
  }
});
var hbar = document.getElementById('performance').getContext('2d');

var myChart = new Chart(hbar, {
  type: 'horizontalBar',
    options: {
        maintainAspectRatio:false,
        layout:{
            padding:{
                left:10,
                right:10,
                top:40,
                bottom:20

            }
        },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            fontSize: 11,
            fontColor: 'lightgrey'
          }
        }],
        yAxes: [{
          gridLines: {
            // drawBorder: false,
          },
          ticks: {
            beginAtZero: true,
            fontSize: 11,
            fontColor: 'lightgrey',
            maxTicksLimit: 100,
            padding: 5,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['K.Olumide', 'A.Sani', 'M.Alex', 'A.Hamza', 'F.Khalid'],
    datasets: [{
      data: [6, 10, 12, 18, 8 ],
      tension: 0.0,
      borderColor: '#96f4f4',
      backgroundColor: '#96f4f4',
      pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1
    }]
  }
});





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
      labels: ['', 'typhoid', 'Ulcer', 'TB', 'Asma', 'Hepatitis', 'M.Fever', '', 'Sep','Oct','Nov', 'Dec'],
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
   
var dn0 = document.getElementById('sidenut').getContext('2d');

var myChart0 = new Chart(dn0, {
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
      labels: ['In-Patient', 'Out-Patient'],
    datasets: [{
      data: [10, 17],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['#dfe3e6', '#96f4f4'],
      pointBackgroundColor: ['white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});
var dn1 = document.getElementById('nut1').getContext('2d');

var myChart1 = new Chart(dn1, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:85,
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
        backgroundColor: 'white'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [0, 4, 8, 11, 9, 17, 13],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['red', 'green', 'blue', 'pink', 'orange', 'purple', '#bbf7f0'],
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});
   
var dn2 = document.getElementById('nut2').getContext('2d');
console.log(Chart.defaults.doughnut)
var myChart2 = new Chart(dn2, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:85,
        // circumference:6,
        layout:{
            padding:{
                left:20,
                right:20,
                top:0,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
       
      
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: [ 'Chemical Pathology', 'Heamatology', 'Radiology', 'Chemotherapy', 'Sugery'],
    datasets: [{
      data: [ 24, 14, 9, 20, 2],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['red',   'pink', 'orange', 'purple', '#bbf7f0'],
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});
   
var dn3 = document.getElementById('nut3').getContext('2d');
// console.log(Chart.defaults.doughnut)
var myChart3 = new Chart(dn3, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:85,
        // circumference:6,
        layout:{
            padding:{
                left:20,
                right:20,
                top:0,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
       
      
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [ 20, 8, 14, 4],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['#00f9c7', '#fbd181', '#d4fb81', 'pink'],
      pointBackgroundColor: [ 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});
   
var dn4 = document.getElementById('nut4').getContext('2d');
console.log(Chart.defaults.doughnut)
var myChart4 = new Chart(dn4, {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:85,
        // circumference:6,
        layout:{
            padding:{
                left:20,
                right:20,
                top:0,
                bottom:0

            }
        },
      legend: {
        display: false,
      },
      scales: {
       
      
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [10, 18, 5],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['pink', 'orange',  '#bbf7f0'],
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1,
   
    //   fill:true
    }]
  }
});


var cc = document.getElementById('dc').getContext('2d');

var mycc = new Chart(cc, {
  type: 'bar',
    options: {
        maintainAspectRatio:false,
        layout:{
            padding:{
                left:100,
                right:100,
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
            // color:whitesmoke
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
          }
        }]
      },
      tooltips: {
        backgroundColor: '#bbf7f0'
      }
    },
    data: {
      labels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
    datasets: [{
      data: [0, 4, 8, 11, 9, 17, 13],
      tension: 0.0,
      borderColor: '#96f4f4',
      backgroundColor: '#96f4f4',
      pointBackgroundColor: ['white', 'white', 'white', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 1
    }]
  }
});


