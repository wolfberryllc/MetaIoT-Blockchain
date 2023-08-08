const { app, BrowserWindow, ipcMain,autoUpdater, dialog, powerMonitor  } = require("electron");
const request = require("request");
const mqtt = require('mqtt');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const client  = mqtt.connect('mqtt://localhost')
const update_listener  = mqtt.connect('mqtt://www.planterai.com')
const schedule = require('node-schedule')

const sensorValue = 0;
var token = "none";
var readings_page = "no";
var username = "";
var portFound = "wait";

async function searchDevices(){
devices = await SerialPort.list().then(function(ports){
    console.log("Searching Arduino Kit...");
  ports.forEach(function(portData){
    console.log("Port: ", portData);
	console.log(portData["vendorId"]);
	if(portData["vendorId"]==="2341" && portFound!="yes")
	{
		portFound = "yes";
		console.log("Port found!");
		const port = new SerialPort({ path: portData['path'], baudRate: 9600 })
		const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
		parser.on('data', processSerialData);
	}
  })
  if(portFound=="yes"){console.log("Arduino Kit Connected!");}else{portFound="no";console.log("Arduino Kit Not found");}
});
}
function processSerialData(data) {
	//console.log(data);
	//console.log(token);
	if(token!="none")
	{
		try{
			data_obj = JSON.parse(data);
			console.log(data);			
			data_obj["time"] = new Date().toISOString();
			var payload = JSON.stringify(
				{
				  "fcn": "MintWithTokenURI",
				  "args": [JSON.stringify(data_obj)]
				}
			);
			request({ 
				body: payload, 
				followAllRedirects: true,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer '+token,
				},
				method: 'POST',
				//contact for URL
				url: ''}, push_cb);
			function push_cb(error, response, body) {
				console.log(body);
				update_listener.publish(username+'/update', 'true');
				update_readings();
			};
		}catch(err) {
			console.log("Error:");
			console.log(err);
		}
	}
}

function update_readings(){
	request({ 
		followAllRedirects: true,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+token,
		},
		method: 'GET',
		//contact for URL
		url: ""}, fetch_cb);
	function fetch_cb(error, response, body) {
		try{
			var data = JSON.parse(body);
			var results = data.result;
			new_html = "";
			count = 1;
			for (let i in results) {
				uri = results[i].Record.tokenURI;
				var uriObj = JSON.parse(uri);
				//console.log(JSON.stringify(uriObj, null, 2));
				new_html += `<tr>
					<th scope="row">${count}</th>
					<td>
						Moisture:${uriObj["moisture"]}%
						
					</td>
					<td>
						Pressure:${uriObj["pressure"]}
						<br />
						Temp:${uriObj["temp"]}C
						<br />
						acceleration:${uriObj["acceleration"]}m
					</td>

					<td>Light Level:${uriObj["light"]}</td>

					<td>Sound Value:${uriObj["sound"]}</td>
					<td>${uriObj["time"]}</td>
				</tr>`;
				count=count+1;
			}
			//console.log(new_html);
			win.webContents.send('readingsTableData', new_html);
		}catch(err) {
				console.log(err);
		}
	}
}

update_listener.on('message', function (topic, message) {
	if(token!="none" && readings_page === "yes")
	{
		update_readings();
	}
});

let win = null;
const { platform, env } = process

let tokenSend = "";

const createWindow = () => {
	searchDevices();
	if(portFound=="no")
	{
		console.log("Port not found!");
		dialog.showErrorBox("Error", "Arduino Kit not found!");
		app.exit(1);
	}
    win  = new BrowserWindow({
        width: 1000,
        height: 600,
		autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule : true
        }
    })
    win.loadFile("index.html")
    //win.on("closed", () => {
    //    scheduledJob.cancel();
    //    win = null;
    //  })
};

function createBrowserWindow() {
    win.loadFile("register.html");
}


function createReadingWindow() {
  win.loadFile("qrpage.html");
}

app.whenReady().then(createWindow);
  
//const scheduledJob = schedule.scheduleJob('*/1 * * * *', () => {
//      console.log("Hi there");
//  });
  
// Quit when all windows are closed.
//app.on("window-all-closed", () => {
//  scheduledJob.cancel();
//  if (process.platform !== "darwin") {
//    app.quit()
//  }
//})

app.on("activate", () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('generatePassword', (event, data) => {

    if(data == "register_user") {
        createBrowserWindow();
    }else{
      win.webContents.send('recievedPassword', data);

    const myArr = data.split("+++++");
    username = myArr[0];
    var password = myArr[1]; 

      console.log(username);
      console.log(password);

    var payload = JSON.stringify({"username": username,"password":password});


  //   var payload1 = JSON.stringify({
  //     "username": "omer1a",
  //     "password": "YfzauuFNWEAf"
  // });

    request({ 
      body: payload, 
      followAllRedirects: true,
      headers: {
         'Content-Type': 'application/json',
        },
      method: 'POST',
      //contact for URL
      url: ''}, callback);

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {

          //console.log("body:"+body);
            const obj = JSON.parse(body);
            var succ = obj.success;
            var mess = obj.message;
            token = obj.token;
            tokenSend = token;

            if(succ == false) {
              win.webContents.send('recievedPassword', body);
              console.log(succ);
              console.log(mess);
            } else {
              createReadingWindow();
              win.webContents.send('sendQRCode', token);
			  client.publish('token', token);
			  update_listener.subscribe(username+'/update', function (err) {
				if (!err) {
					console.log("Subscribed for update");
				}else{
					console.log("Update subscribe error");
				}
			  })
            }
        } else {
            console.log("Error: \n"+body);
            win.webContents.send('recievedPassword', body);
        }
      };
        // const randomPassword = data;
    }

})


ipcMain.on('registerUserRegister', (event, data) => {
  const myArr = data.split("+++++");
  
    var username = myArr[0];
    var email = myArr[1];
    var firstname = myArr[2];
    var lastname = myArr[3]; 

    var payload = JSON.stringify({"username": username,"email":email,"first_name":firstname,"lastname":lastname});
    // const randomPassword = data;
    // win.webContents.send('recieveRegisterUserData', payload);

    request({ 
      body: payload, 
      followAllRedirects: true,
      headers: {
         'Content-Type': 'application/json',
        },
      method: 'POST',
      //contact for URL
      url: ''}, callback);
      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
			console.log(body);
            const obj = JSON.parse(body);
            var succ = obj.success;
            var mess = obj.message;
            var secret = obj.secret
            var token = obj.token;

            // var res = succ +  "=====" + mess + "=====" + secret + "=====" + token;


            var res = "Save Your Password: " + secret;

            if(succ == false) {
              win.webContents.send('recieveRegisterUserData', res);
              console.log(res);
            } else {
              win.webContents.send('recieveRegisterUserData', res);
              console.log(res);
            }
        } else {
            console.log("Error: \n"+error);
            win.webContents.send('recievedPassword', body);
        }
      }
    // const randomPassword = data;
    // win.webContents.send('recieveRegisterUserData', payload);
})




ipcMain.on('getQRcode', (event, data) => {
    const randomPassword = data;
    win.webContents.send('sendQRCode', tokenSend);
})

ipcMain.on('openQRPage', (event, data) => {
	createReadingWindow();
	win.webContents.send('sendQRCode', token);
})

ipcMain.on('login_redirect', (event, data) => {
  win.loadFile("index.html");
})

ipcMain.on('readings_redirect', (event, data) => {
  win.loadFile("readings.html");
  readings_page = "yes";
  update_readings();
})


// ipcMain.on('registerUserData', (event, data) => {
//     const randomPassword = data;
//     win.webContents.send('registerUserData', randomPassword);
// })
