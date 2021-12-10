let headerContainer = document.getElementById("pim-header");
let formContainer = document.getElementById("login-form-container");
let navContainer = document.getElementById("nav-container");
let notesContainer = document.getElementById("pim-notes-container");
let imagesContainer = document.getElementById("pim-images-container");
let todoContainer = document.getElementById("pim-todo-container");
let addNoteButton;
let sideNav;

let loggedIn;
let authUsername;
let authPassword;
let authUserID;
let chosenFolderID;
let users = [];
let notes = [];
let images = [];
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
      } else {
        goToPage("/");
        alert(
          "You need to be logged in to access the Personal Information Manager."
        );
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

  if (uname == "") {
    alert("Please enter a username.");
    return;
  } else if (pwd == "") {
    alert("Please enter a password.");
    return;
  }

  let user = {
    username: uname,
    password: pwd,
  };

  let result = await fetch("/rest/users/login", {
    method: "POST",
    body: JSON.stringify(user),
  });

  let continueWithLogIn = await result.text();

  console.log(continueWithLogIn);

  if (continueWithLogIn == "true") {
    loggedIn = true;
    authUsername = uname;
    authPassword = pwd;
    authUserID = await getUserID();
    alert("Login successful.");
    goToPage("/#pim-page");
  } else {
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

  if (uname == "") {
    alert("Please enter a username.");
  } else if (pwd == "") {
    alert("Please enter a password.");
  } else if (pwd.length < 5) {
    alert("Password needs 5 or more characters.");
    document.getElementById("create-account-form").reset();
  } else {
    let user = {
      username: uname,
      password: pwd,
    };

    let result = await fetch("/rest/users", {
      method: "POST",
      body: JSON.stringify(user),
    });

    continueWithCreation = await result.text();
  }

  if (continueWithCreation == "true") {
    loggedIn = true;
    authUsername = uname;
    authPassword = pwd;
    authUserID = await getUserID();
    alert("Account created successfully.");
    goToPage("/#pim-page");
  } else {
    alert("Username is already taken.");
    document.getElementById("create-account-form").reset();
  }
}

// USER FUNCTIONS

async function getUserID() {
  let result = await fetch("/rest/users/" + authUsername + "/userID");
  myJSON = await result.text();

  userID = JSON.parse(myJSON);

  return userID.id;
}

// FOLDER FUNCTIONS

async function getFolders() {
  let folders = [];
  let result = await fetch("/rest/users/" + authUsername + "/folders");
  myJSON = await result.text();
  folders = JSON.parse(myJSON);

  return folders;
}

async function getFolderID(folderName) {
  let result = await fetch(
    "/rest/users/" + authUsername + "/" + folderName + "/folderID"
  );
  myJSON = await result.text();

  folderID = JSON.parse(myJSON);

  return folderID.id;
}

async function addFolder() {
  let folders = await getFolders();
  let newFolderName = "New Folder" + "(" + folders.length + ")";

  let newFolder = {
    userID: authUserID,
    folderName: newFolderName,
  };

  let result = await fetch("/rest/users/" + authUsername + "/newfolder", {
    method: "POST",
    body: JSON.stringify(newFolder),
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
    folderName: deletedFolderName,
  };

  let result = await fetch(
    "/rest/users/" + authUsername + "/delete/" + deletedFolderName,
    {
      method: "DELETE",
      body: JSON.stringify(deletedFolder),
    }
  );

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
    openNav();
  });

  element.addEventListener("dblclick", () => {
    let doDelete = confirm("Are you sure you wish to delete this folder?");

    if (doDelete) {
      deleteFolder(folderName, element);
    }
  });

  return element;
}
// ITEMS BAR FUNCTIONS
function openNav() {
  document.getElementById("itemsnav").style.width = "160px";
  document.getElementById("main-area-container").style.marginLeft = "360px";
}

function closeNav() {
  document.getElementById("itemsnav").style.width = "0";
  document.getElementById("main-area-container").style.marginLeft = "0";
}

// NOTE FUNCTIONS

async function getNotes(folderID) {
  let result = await fetch(
    "/rest/users/" + authUsername + "/" + folderID + "/notes"
  );
  myJSON = await result.text();

  notes = JSON.parse(myJSON);

  return notes;
}

function addNote() {
  let noteObject = {
    id: Math.floor(Math.random() * 100000),
    content: "",
  };

  let noteElement = createNoteElement(noteObject.id, noteObject.content);
  notesContainer.insertBefore(noteElement, addNoteButton);

  saveNote(noteObject.id, noteObject.content, chosenFolderID);
}

async function updateNote(noteId, newContent) {
  let note = {
    id: noteId,
    folderID: chosenFolderID,
    notes: newContent,
  };

  let result = await fetch(
    "/rest/users/" + authUsername + "/" + chosenFolderID + "/notes/" + noteId,
    {
      method: "PUT",
      body: JSON.stringify(note),
    }
  );
}

async function saveNote(noteId, content, folder) {
  let note = {
    id: noteId,
    folderID: folder,
    notes: content,
  };

  let result = await fetch(
    "/rest/users/" + authUsername + "/" + folder + "/notes",
    {
      method: "POST",
      body: JSON.stringify(note),
    }
  );
}

async function deleteNote(noteId, element) {
  let note = {
    id: noteId,
  };

  let result = await fetch("/rest/users/" + authUsername + "/notes/delete", {
    method: "DELETE",
    body: JSON.stringify(note),
  });

  notesContainer.removeChild(element);
}

function createNoteElement(id, content) {
  let element = document.createElement("textarea");

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

async function getImages() {
  console.log(chosenFolderID);

  let result = await fetch(
    "/rest/users/" + authUsername + "/" + chosenFolderID + "/images"
  );
  myJSON = await result.text();

  images = JSON.parse(myJSON);

  return images;
}

async function addImage() {
  console.log("addImage() clicked");

  // upload image with FormData
  let files = document.querySelector("#image-input[type=file]").files;
  let formData = new FormData();

  for (let file of files) {
    formData.append("files", file, file.name);
  }

  // upload selected files to server
  let uploadResult = await fetch("/rest/file-upload", {
    method: "POST",
    body: formData,
  });

  // get the uploaded image url from response
  let uploadedImageUrl = await uploadResult.text();

  console.log(uploadedImageUrl);

  let imagePost = {
    folderId: chosenFolderID,
    title: "jaja",
    imageUrl: uploadedImageUrl,
  };

  let result = await fetch("/rest/file-upload/imagepost", {
    method: "POST",
    body: JSON.stringify(imagePost),
  });
}

function createImageElement(imageUrl) {
  let element = document.createElement("img");

  element.classList.add("image");
  element.src = imageUrl;
  element.alt = "There should be an image here...";

  /*element.addEventListener("click", () => {
        showImage();
    });*/

  /*element.addEventListener("dblclick", () => {
        let doDelete = confirm("Are you sure you wish to delete this image?");
    
        if (doDelete) {
          deleteImage(id, element);
        }
    });*/

  return element;
}

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
        <h3 id="render-images-button" onclick="openNav()">Images</h3>
        <button id="logout-button" onclick="logOut()">Logout</button>    
    `;
  navContainer.innerHTML = `
        <div id="sidenav">
            <a onclick="addFolder()">Add new folder +</a>
        </div>
        <div id="itemsnav">
            <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
            <a id="note-nav" onclick="renderNotes(chosenFolderID)"><img src="/images/comment.png" alt="" />Note</a>
            <a><img src="/images/microphone.png" alt="" />Sound</a>   
            <a><img src="/images/check.png" alt="" />Todo</a>
            <a onclick="renderImages()"><img src="/images/copy.png" alt="" />Images</a>

            
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
        <input id="image-input" type="file" accept="image/*" oninput="addImage()"/> 
    `;

  images = await getImages();
  for (const image of images) {
    let imageElement = createImageElement(image.imageUrl);
    imagesContainer.insertBefore(
      imageElement,
      imagesContainer.querySelector("#custom-image-input")
    );
  }
}
