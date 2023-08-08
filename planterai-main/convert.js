const { app, BrowserWindow, ipcMain,autoUpdater, dialog, remote  } = require("electron");

const ipcRenderer = require("electron").ipcRenderer;
var data =  "123"
const getQRcode = () => {
    
    var username = "111111111111111";
    var password = "222222222222222";
    var res =  username + "+++++" + password;
    ipcRenderer.send(
            "getQRcode",
            res
        );
};
const loginRedirect = () => {
    ipcRenderer.send(
        "login_redirect",
        '123'
    );
}
const readingsRedirect = () => {
    ipcRenderer.send(
        "readings_redirect",
        '123'
    );
}

ipcRenderer.on('sendQRCode', (event, data) => {
    this.data = data;
    // alert(obj.success);
    
    new Vue({
        el: '#app',
        data: {
            plainText: data
        },
        methods: {
            setImage: function() {
                if (this.plainText != '') {
                    return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + this.plainText;
                } else {
                    return "assets/img/default.png";
                }
            }
        }
    })
    // alert(data);
});
// const getQRcode = () => {
    
//     alert();
// };

$(document).ready(function() {
    getQRcode();
    


    // Convert to QR Code

    // new Vue({
    //     el: '#app',
    //     data: {
    //         plainText: data
    //     },
    //     methods: {
    //         setImage: function() {
    //             if (this.plainText != '') {
    //                 return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + this.plainText;
    //             } else {
    //                 return "assets/img/default.png";
    //             }
    //         }
    //     }
    // })
});


