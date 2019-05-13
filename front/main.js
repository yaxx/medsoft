const {app,BrowserWindow,session} = require('electron');
const cookie = { url: 'http://localhost/4200', name: 'dummy_name', value: 'dummy' }

let win;
function createWindow () {

  win = new BrowserWindow({
    height: 700,
    width: 1200,
    backgroundColor: '#ffffff'
  })
  win.loadURL(`file://${__dirname}/dist/front/index.html`)
  // session.defaultSession.cookies.set({ url: 'http://localhost/4200', name: 'dummy_name', value: 'dummy', domain:'localhost', path:'/', secure: false, httpOnly: true, expirationDate: 99999999 })
  // .then(() => {
  //   // success
  // }, (error) => {
  //   console.error(error)
  // })
  win.once('ready-to-show', () => {win.show()})
    win.on('closed',function() {
    win = null;
  })

}
app.on('ready', createWindow)
app.on('windows-all-closed', () => {
  if(process.platform!=='darwin') {
    app.quit();
  }
})
app.on('activate',function() {
  if(win==null){
    createWindow()

  }
})
