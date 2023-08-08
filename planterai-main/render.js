const ipcRenderer = require("electron").ipcRenderer;

const generatePassword = () => {
    
    var username = document.querySelector(".UserName").value;
    var password = document.querySelector(".Password").value;
    var res =  username + "+++++" + password;
    ipcRenderer.send(
            "generatePassword",
            res
        );
};

ipcRenderer.on('recievedPassword', (event, data) => {
    const obj = JSON.parse(data);
    // alert(obj.success);
    alert(obj.message);
});



const loginRedirect = () => {
    ipcRenderer.send(
        "login_redirect",
        '123'
    );
}




const registerUserRegister = () => {

    var username = document.querySelector(".UserName").value;
    var email = document.querySelector(".Email").value;
    var firstname = document.querySelector(".FirstName").value;
    var lastname = document.querySelector(".LastName").value;
    var res =  username + "+++++" + email + "+++++" + firstname + "+++++" + lastname;

    ipcRenderer.send(
        "registerUserRegister",
        res
    );

};

const openQRPage = () => {
    ipcRenderer.send(
            "openQRPage",""
        );
};


ipcRenderer.on('recieveRegisterUserData', (event, data) => {

    // let age = prompt('Password', data);
    alert( data);


});

ipcRenderer.on('readingsTableData', (event, data) => {
	document.getElementById("readingsTable").innerHTML = data;
});


// method to navigate between pages
const registerUserData = () => {
    ipcRenderer.send(
            "generatePassword",
            'register_user'
        );
};
// method to navigate between pages end

// ipcRenderer.on('recieveRegisterUserData', (event, data) => {
//     alert(data);
// });

