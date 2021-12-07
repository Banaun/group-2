let headerContainer = document.getElementById("pim-header");
let formContainer = document.getElementById("login-form-container");
let navContainer = document.getElementById("nav-container");
let notesContainer = document.getElementById("pim-notes-container");
let imagesContainer = document.getElementById("pim-images-container");
let addNoteButton;
let sideNav;

let loggedIn;
let authUsername;
let authPassword;
let authUserID;
let chosenFolderID;
let users = [];
let notes = [];
let folders = [];

onhashchange = changePage;
changePage();

function changePage() {
    let page = location.hash.replace("#", "");
    console.log("redirected to page: " + page);

    switch (page) {
        case "create-account":
            renderCreateAccountPage();
            const createAccountForm = document.querySelector("#create-account-form");
            createAccountForm.addEventListener("submit", createAccount);
            break;
        case "pim-page":
            if (loggedIn == true) {
                renderPimPage();
                break;
            }
            else {
                goToPage("/");
                alert("You need to be logged in to access the Personal Information Manager.");
                break;
            }
        default:
            renderLoginPage();
            const loginForm = document.querySelector("#login-form");
            loginForm.addEventListener("submit", logIn);
    }      
}

function goToPage(pageToGo) {
    location.href = pageToGo;
}

// LOGIN FUNCTIONS

async function logIn(event) {
    event.preventDefault();

    console.log("login");
    
    let uname = document.getElementById("username").value;
    let pwd = document.getElementById("password").value;

    console.log(uname);
    console.log(pwd);
  
    if (uname == '') {
        alert("Please enter a username.");
        return;
    }
    else if (pwd == '') {
        alert("Please enter a password.")
        return;
    }
  
    let user = {
        username: uname,
        password: pwd
    };
  
    let result = await fetch("/rest/users/login", {
        method: "POST",
        body: JSON.stringify(user)
    });
  
    let continueWithLogIn = await result.text();

    console.log(continueWithLogIn);
  
    if (continueWithLogIn == 'true') {
        loggedIn = true;
        authUsername = uname;
        authPassword = pwd;
        authUserID = await getUserID();
        alert("Login successful.");
        goToPage("/#pim-page");
    }
    else {
        alert("Wrong username and/or password.");
        document.getElementById("login-form").reset();
        return;
    }
}

function logOut() {
    goToPage("/");

}

async function createAccount(event) {
    event.preventDefault();
  
    console.log("createAccount clicked");
  
    let uname = document.getElementById("username").value;
    let pwd = document.getElementById("password").value;

    let continueWithCreation = false;
  
    if (uname == '') {
        alert("Please enter a username.");
    }
    else if (pwd == '') {
        alert("Please enter a password.");
    }
    else if (pwd.length < 5) {
        alert("Password needs 5 or more characters.")
        document.getElementById("create-account-form").reset();
    }
    else {
        let user = {
            username: uname,
            password: pwd
        };
    
        let result = await fetch("/rest/users", {
            method: "POST",
            body: JSON.stringify(user)
        });

        continueWithCreation = await result.text();
    }
  
    if (continueWithCreation == 'true') {
        loggedIn = true;
        authUsername = uname;
        authPassword = pwd;
        authUserID = await getUserID();
        alert("Account created successfully.");
        goToPage("/#pim-page");
    }
    else {
        alert("Username is already taken.");
        document.getElementById("create-account-form").reset();
    }
}

// USER FUNCTIONS

async function getUserID() {
    let result = await fetch("/rest/users/" + authUsername + "/userID");
    myJSON = await result.text();

    userID = JSON.parse(myJSON);

    console.log(userID.id);

    return userID.id;
}

// FOLDER FUNCTIONS

async function getFolders() {
    let folders = [];
    let result = await fetch("/rest/users/" + authUsername + "/folders");
    myJSON = await result.text();
    folders = JSON.parse(myJSON);
    console.log(folders);

    return folders;
}

async function getFolderID(folderName) {
    let result = await fetch("/rest/users/" + authUsername + "/" + folderName + "/folderID");
    myJSON = await result.text();

    folderID = JSON.parse(myJSON);

    console.log(folderID.id);

    return folderID.id;
}

async function addFolder() {
    let folders = await getFolders();
    let newFolderName = 'New Folder' + '(' + folders.length + ')';

    let newFolder = {
        userID: authUserID,
        folderName: newFolderName
    };

    let result = await fetch("/rest/users/" + authUsername + "/newfolder", {
        method: "POST",
        body: JSON.stringify(newFolder)
    });

    chosenFolderID = await getFolderID(newFolderName);

    //RENDER NEW FOLDER
    let folderElement = createFolderElement(newFolderName);
    sideNav.appendChild(folderElement);
}

async function deleteFolder(deletedFolderName, element) {
    let deletedFolder = {
        id: chosenFolderID,
        userID: authUserID,
        folderName: deletedFolderName
    }

    console.log(deletedFolderName);

    let result = await fetch("/rest/users/" + authUsername + "/delete/" + deletedFolderName, {
        method: "DELETE",
        body: JSON.stringify(deletedFolder)
    });

    notesContainer.innerHTML = "";
    sideNav.removeChild(element);
}

async function chooseFolder(folderName) {
    chosenFolderID = await getFolderID(folderName);
    notesContainer.innerHTML = "";
    await renderNotes(chosenFolderID);
}

function createFolderElement(folderName) {
    let element = document.createElement("a");

    element.classList.add("folder");
    element.textContent = folderName;

    element.addEventListener("click", () => {
        chooseFolder(folderName);
    });

    element.addEventListener("dblclick", () => {
        let doDelete = confirm("Are you sure you wish to delete this folder?");
    
        if (doDelete) {
            deleteFolder(folderName, element);
        }
    });

    return element;
}

// NOTE FUNCTIONS

async function getNotes(folderID) {
    let result = await fetch("/rest/users/" + authUsername + "/" + folderID + "/notes");
    myJSON = await result.text();

    notes = JSON.parse(myJSON);
    console.log("notes hämtade genom chooseFolder");
    console.log(notes);

    return notes;
}

function addNote() {
    console.log("add-note-button clicked")

    let noteObject = {
        id: Math.floor(Math.random() * 100000),
        content: ""
    };

    let noteElement = createNoteElement(noteObject.id, noteObject.content);
    notesContainer.insertBefore(noteElement, addNoteButton);

    saveNote(noteObject.id, noteObject.content, chosenFolderID);
}

async function updateNote(noteId, newContent) {
    console.log(newContent);

    let note = {
        id: noteId,
        folderID: chosenFolderID,
        notes: newContent
    };



    let result = await fetch("/rest/users/" + authUsername + "/" + chosenFolderID + "/notes/" + noteId, {
        method: "PUT",
        body: JSON.stringify(note)
    });
}

async function saveNote(noteId, content, folder) {
    let note = {
        id: noteId,
        folderID: folder,
        notes: content
    };

    let result = await fetch("/rest/users/" + authUsername + "/" + folder + "/notes", {
        method: "POST",
        body: JSON.stringify(note)
    });

    console.log(await result.text());
}

async function deleteNote(noteId, element) {
    let note = {
        id: noteId,
    }

    let result = await fetch("/rest/users/" + authUsername + "/notes/delete", {
        method: "DELETE",
        body: JSON.stringify(note)
    });

    notesContainer.removeChild(element);
}

function createNoteElement(id, content) {
    let element = document.createElement("textarea");

    console.log(content);

    element.classList.add("note");
    element.value = content;
    element.placeholder = "Empty note";

    element.addEventListener("change", () => {
        updateNote(id, element.value);
    });

    element.addEventListener("dblclick", () => {
        let doDelete = confirm("Are you sure you wish to delete this sticky note?");
    
        if (doDelete) {
          deleteNote(id, element);
        }
    });

    return element;
}

// IMAGE FUNCTIONS



// RENDER FUNCTIONS

function renderLoginPage() {
    authUsername = "";
    authPassword = "";
    authUserID = NaN;
    chosenFolderID = NaN;

    navContainer.innerHTML = "";
    notesContainer.innerHTML = "";
    headerContainer.innerHTML = "<h2>PIM-g2 Login</h1>";
    formContainer.innerHTML = `
        <form id="login-form">
            <label for="username">Username</label><br />
            <input id="username" type="text" /><br />
            <label for="password">Password</label><br />
            <input id="password" type="password" /><br />
            <button id="btn-login" type="submit">Login</button>
        </form>
        <button id="btn-go-to-create-account" 
            onclick="goToPage('/#create-account')"> Register account</button>
    `;
}

function renderCreateAccountPage() {
    navContainer.innerHTML = "";
    headerContainer.innerHTML = "<h2>Create Account</h2>";
    notesContainer.innerHTML = "";
    formContainer.innerHTML = `
        <form id="create-account-form">
            <label for="username">New Username</label><br />
            <input id="username" type="text" /><br />
            <label for="password">New Password</label><br />
            <input id="password" type="password" /><br />
            <button id="btn-create-account"type="submit">Create account</button>
        </form>
        <button id="btn-go-to-create-account" 
            onclick="goToPage('/')">Back to login page</button>
    `;
}

function renderPimPage() {
    formContainer.innerHTML = "";
    headerContainer.innerHTML = `
        <h1>Your Notes</h1>
        <a id="render-images-button" onclick="renderImages()">Images</a>
        <button id="logout-button" onclick="logOut()">Logout</button>    
    `;
    navContainer.innerHTML = `
        <div id="sidenav">
            <a onclick="addFolder()">Add new folder +</a>
        </div>
    `;

    renderFolders();
}

async function renderFolders() {
    sideNav = document.getElementById("sidenav");
    
    folders = await getFolders();
    for (const folder of folders) {
        let folderElement = createFolderElement(folder.folderName);
        sideNav.appendChild(folderElement);
    }
}

async function renderNotes(folderID) {
    imagesContainer.innerHTML = "";
    notesContainer.innerHTML = `
        <label for="add-note" id="custom-note-input">+</label>
        <input id="add-note" type="button"/> 
    `;
    addNoteButton = notesContainer.querySelector("#custom-note-input");
    addNoteButton.addEventListener("click", () => addNote());

    notes = await getNotes(folderID);
    for (const note of notes) {
        let noteElement = createNoteElement(note.id, note.notes);
        notesContainer.insertBefore(noteElement, addNoteButton);
    }
}

async function renderImages() {
    notesContainer.innerHTML = "";
    imagesContainer.innerHTML = `
        <label for="image-input" id="custom-image-input">+</label>
        <input id="image-input" type="file" accept="image/png, image/jpg, image/jpeg"/>   
    `
    //<div id="display-image-container"></div>
}