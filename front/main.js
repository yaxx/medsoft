const {app,BrowserWindow} = require('electron');
let win;
function createWindow (){
  win = new BrowserWindow({
    height: 700,
    width:1200,
    backgroundColor:'#ffffff'
  })

  win.loadURL(`file://${__dirname}/dist/front/index.html`)
  win.once('ready-to-show', ()=>{win.show()})

    win.on('closed',function(){
    win=null;
  })
}

app.on('ready',createWindow)

app.on('windows-all-closed',()=>{
  if(process.platform!=='darwin'){
    app.quit();
  }

})
app.on('activate',function(){
  if(win==null){
    createWindow()
  }
})
