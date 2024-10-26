const electron = require('electron')
const Menu = electron.Menu
const MenuItem = electron.MenuItem
const app = electron.app
const shell = electron.shell
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const isMac = process.platform === 'darwin'

const template = [
	...(isMac ? { role: 'appMenu' } : []),
	/*...(isMac ? [{
		label: app.name,
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	}] : []),*/
	{
		label: 'File',
		submenu: [
			{
				label: 'Hide sidebars',
				click: function() {
					mainWindow.webContents.executeJavaScript(`
						for (let el of document.querySelectorAll('#obot, #oside')) {
							el.parentElement.removeChild(el)
						}
						let wrapper = document.querySelector('.wrapper')
						if (wrapper) {
							wrapper.style.minWidth = '660px'
							wrapper.style.minHeight = '440px'
						}
					`)
				}
			},
			{ type: 'separator' },
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	},
	{ role: 'viewMenu' },
	{ role: 'windowMenu' },
]

const appMenu = Menu.buildFromTemplate(template)
//console.log(appMenu)
Menu.setApplicationMenu(appMenu)

let mainWindow, helpWindow

function createWindow () {
	// Create the browser window.
	const showOnceReady = false
	let options = {
		width: 1024,
		height: 720,
		//frame: false,
		backgroundColor: "#405070",
		title: "Terrasavr is loading",
		webPreferences: {
			nodeIntegration: false,
			devTools: true
		},
		show: !showOnceReady,
	}
	mainWindow = new BrowserWindow(options)
	if (showOnceReady) {
		mainWindow.once('ready-to-show', () => mainWindow.show())
	}
	
	mainWindow.loadURL('https://yal.cc/r/terrasavr')

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

app.on('web-contents-created', (_, contents) => {
	contents.on('new-window', async (e, url, frameName, disposition, options) => {
		const qurl = new URL(url)
		//console.log(qurl)
		e.preventDefault()
		if (qurl.host == "yal.cc" && (
			qurl.pathname == '/r/terrasavr/doc' || qurl.pathname.startsWith('/r/terrasavr/doc/')
		)) {
			if (helpWindow == null) {
				helpWindow = new BrowserWindow({
					webContents: options.webContents,
					show: false
				})
				helpWindow.once('ready-to-show', () => helpWindow.show())
				helpWindow.on('closed', () => helpWindow = null)
				if (!options.webContents) helpWindow.loadURL(url)
				e.newGuest = helpWindow
			} else helpWindow.focus()
		} else if (qurl.host == "yal.cc" && (
			qurl.pathname == '/r/terrasavr' || qurl.pathname == '/r/terrasavr/'
		)) {
			mainWindow.focus()
		} else {
			await shell.openExternal(url)
		}
	})
	contents.on('will-navigate', async (e, url) => {
		const qurl = new URL(url)
		if (qurl.host == "yal.cc") {
			if (qurl.pathname.startsWith('/r/terrasavr/doc/')) return
			if (qurl.pathname == '/r/terrasavr' || qurl.pathname == '/r/terrasavr/') {
				e.preventDefault()
				mainWindow.focus()
				return
			}
		}
		e.preventDefault()
		await shell.openExternal(url)
	})
})

app.on('browser-window-created', (e, wnd) => {
	//wnd.setMenu(null)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createWindow()
})
