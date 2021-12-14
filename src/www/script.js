let headerContainer = document.getElementById("pim-header");
let formContainer = document.getElementById("login-form-container");
let navContainer = document.getElementById("nav-container");
let notesContainer = document.getElementById("pim-notes-container");
let imagesContainer = document.getElementById("pim-images-container");
let todoContainer = document.getElementById("pim-todo-container");
let soundsContainer = document.getElementById("pim-sound-container");

let addNoteButton;
let sideNav;
let modal;
let modalImg;
let removeTodoItem;
let loggedIn;
let authUsername;
let authPassword;
let authUserID;
let chosenFolderID;
let current;
let currentItem;

let users = [];
let notes = [];
let images = [];
let folders = [];

// CHANGE PAGE FUNCTIONS

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
  let result = await fetch("/rest/users/" + authUsername + "/" + folderName + "/folderID");
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

  let result = await fetch("/rest/users/" + authUsername + "/delete/" + deletedFolderName, {
      method: "DELETE",
      body: JSON.stringify(deletedFolder),
  });

  notesContainer.innerHTML = "";
  sideNav.removeChild(element);
}

async function chooseFolder(folderName) {
  chosenFolderID = await getFolderID(folderName);
  notesContainer.innerHTML = "";
  imagesContainer.innerHTML = "";
  todoContainer.innerHTML = "";
  soundsContainer.innerHTML = "";
}

function createFolderElement(folderName) {
  let element = document.createElement("a");

  element.classList.add("folder");
  element.textContent = folderName;
  element.addEventListener("click", () => {
    chooseFolder(folderName);
    openNav();
    current = document.getElementsByClassName("active");

    if (current.length > 0) {
      current[0].className = current[0].className.replace(" active", "");
    }

    element.className += " active";

    currentItem = document.getElementsByClassName("active-item");
      if (currentItem.length > 0) { 
          currentItem[0].className = currentItem[0].className.replace(" active-item", "");
      }
  });

  element.addEventListener("dblclick", () => {
    let doDelete = confirm("Are you sure you wish to delete this folder?");

    if (doDelete) {
      deleteFolder(folderName, element);
    }
  });

  return element;
}

// ITEMS NAV FUNCTIONS

function openNav() {
  document.getElementById("itemsnav").style.width = "160px";
  document.getElementById("main-area-container").style.marginLeft = "360px";
}

function closeNav() {
  document.getElementById("itemsnav").style.width = "0";
  document.getElementById("main-area-container").style.marginLeft = "0";
}

function changeItemsHeader(itemName) {
  headerContainer.innerHTML = `
    <h1>${authUsername}'s PIM</h1>
    <h3 id="items-header" onclick="openNav()">${itemName}</h3>
    <button id="logout-button" onclick="logOut()">Logout</button>    
  `;
}

// NOTE FUNCTIONS

async function getNotes(folderID) {
  let result = await fetch("/rest/users/" + authUsername + "/" + folderID + "/notes");
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
    "/rest/users/" + authUsername + "/" + chosenFolderID + "/notes/" + noteId, {
      method: "PUT",
      body: JSON.stringify(note),
  });
}

async function saveNote(noteId, content, folder) {
  let note = {
    id: noteId,
    folderID: folder,
    notes: content,
  };

  let result = await fetch(
    "/rest/users/" + authUsername + "/" + folder + "/notes", {
      method: "POST",
      body: JSON.stringify(note),
  });
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
  let result = await fetch(
    "/rest/users/" + authUsername + "/" + chosenFolderID + "/images");
  myJSON = await result.text();
  images = JSON.parse(myJSON);

  return images;
}

function showImage(imageUrl, element) {
  modal.style.display = "block";
  modalImg.src = imageUrl;

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  window.ondblclick = function(event) {
    if (event.target == modalImg) {
      let doDelete = confirm("Are you sure you wish to delete this image?");
    
      if (doDelete) {
        deleteImage(imageUrl, element);
        modal.style.display = "none";
      }
    }
  };
}


async function addImage() {
  // upload image with FormData
  let files = document.querySelector("#image-input[type=file]").files;
  let formData = new FormData();

  for (let file of files) {
    formData.append("files", file, file.name);
  }

  // upload selected files to server
  let uploadResult = await fetch("/rest/image-upload", {
    method: "POST",
    body: formData
  });

  // get the uploaded image url from response
  let uploadedImageUrl = await uploadResult.text();

  let imagePost = {
    folderId: chosenFolderID,
    title: "jaja",
    imageUrl: uploadedImageUrl
  };

  let result = await fetch("/rest/file-upload/imagepost", {
    method: "POST",
    body: JSON.stringify(imagePost)
  });
}

async function deleteImage(deletedImageUrl, element) {
  let image = {
    imageUrl: deletedImageUrl
  };

  let result = await fetch("/rest/users/" + authUsername + "/images/delete", {
    method: "DELETE",
    body: JSON.stringify(image)
  });

  imagesContainer.removeChild(element);
}

function createImageElement(imageUrl) {
  let element = document.createElement("img");

  element.classList.add("image");
  element.src = imageUrl;
  element.alt = "There should be an image here...";

  element.addEventListener("click", () => {
    showImage(imageUrl, element);
  });

  return element;
}

// TODO FUNCTIONS

function newTodoElement() {
  let li = document.createElement("li");
  let inputValue = document.getElementById("myTodoInput").value;
  let t = document.createTextNode(inputValue);
  li.appendChild(t);

  if (inputValue === "") {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }

  document.getElementById("myTodoInput").value = "";

  let span = document.createElement("SPAN");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  removeTodoItem = document.getElementsByClassName("close");

  for (let i = 0; i < removeTodoItem.length; i++) {
    removeTodoItem[i].onclick = function() {
        let div = this.parentElement;
        div.style.display = "none";
    }
  }

  for (let i = 0; i < removeTodoItem.length; i++) {
    removeTodoItem[i].onclick = function() {
    let div = this.parentElement;
    div.style.display = "none";
    }
  }
}

function removeAll(){
  let lst = document.getElementsByTagName("ul");
    lst[0].innerHTML = "";
}

// SOUND FUNCTIONS

async function getSounds() {
  let result = await fetch("/rest/users/" + authUsername + "/" + chosenFolderID + "/sounds");
  myJSON = await result.text();
  sounds = JSON.parse(myJSON);

  return sounds;
}

async function addSound() {
  let files= document.querySelector("#sound-upload[type=file]").files;
  let formData= new FormData();

  for(let file of files){
    formData.append("files",file,file.name);
  }   

  let uploadResult = await fetch("/rest/sounds-upload",{
    method: "POST",
    body: formData
  });

  let uploadedSoundUrl = await uploadResult.text();

  let soundPost= {
    folderId: chosenFolderID,
    title: "dada",
    soundUrl: uploadedSoundUrl
  };

  let result = await fetch("/rest/sounds-upload/soundpost", {
    method: "POST",
    body: JSON.stringify(soundPost)
  });
}

//deleteSound()
function createSoundElement(soundUrl) {
  let element = document.createElement("audio");

  element.classList.add("audio");
  element.controls="controls";
  element.src=soundUrl;
    
  return element;
}

  // This function make sound file play 
function handleFiles(event) {
  let files = event.target.files;
  $("#src").attr("src", URL.createObjectURL(files[0]));
  document.querySelector(".audio").load();
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
      <label for="username" class="username-label">Username</label><br />
      <input id="username" type="text" /><br />
      <label for="password" class="password-label">Password</label><br />
      <input id="password" type="password" /><br />
      <button id="btn-login" type="submit">Login</button>
    </form>
    <button id="btn-go-to-create-account" onclick="goToPage('/#create-account')"> Register account</button>
  `;
}

function renderCreateAccountPage() {
  navContainer.innerHTML = "";
  headerContainer.innerHTML = "<h2>Create Account</h2>";
  notesContainer.innerHTML = "";
  formContainer.innerHTML = `
    <form id="create-account-form">
      <label for="username" class="username-label">New Username</label><br />
      <input id="username" type="text" /><br />
      <label for="password" class="password-label">New Password</label><br />
      <input id="password" type="password" /><br />
      <button id="btn-create-account"type="submit">Create account</button>
    </form>
    <button id="btn-go-to-create-account" onclick="goToPage('/')">Back to login page</button>
  `;
}

function renderPimPage() {
  formContainer.innerHTML = "";
  headerContainer.innerHTML = `
    <h1>${authUsername}'s PIM</h1>
    <button id="logout-button" onclick="logOut()">Logout</button>    
  `;
  navContainer.innerHTML = `
    <div id="sidenav">
      <a onclick="addFolder()">Add new folder +</a>
    </div>
    <div id="itemsnav">
      <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
      <a class="sub-folder-nav-button" onclick="renderNotes(chosenFolderID)"><img src="/images/comment.png" alt="" />Note</a>
      <a class="sub-folder-nav-button" onclick="renderSounds()"><img src="/images/microphone.png" alt="" />Sound</a>   
      <a class="sub-folder-nav-button" onclick="renderTodo()"><img src="/images/check.png" alt="" />Todo</a>
      <a class="sub-folder-nav-button" onclick="renderImages()"><img src="/images/copy.png" alt="" />Images</a>
    </div>        
  `;

  let itemsNav = document.getElementById("itemsnav");
  let btns = itemsNav.getElementsByClassName("sub-folder-nav-button");
  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
      currentItem = document.getElementsByClassName("active-item");
      if (currentItem.length > 0) { 
        currentItem[0].className = currentItem[0].className.replace(" active-item", "");
      }
      this.className += " active-item";
    });
  }      

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
  soundsContainer.innerHTML= "";
  todoContainer.innerHTML = "";
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

  changeItemsHeader("Notes");
}

async function renderImages() {
  soundsContainer.innerHTML= "";
  todoContainer.innerHTML = "";
  notesContainer.innerHTML = "";
  imagesContainer.innerHTML = `
    <label for="image-input" id="custom-image-input">+</label>
    <input id="image-input" type="file" accept="image/*" oninput="addImage()"/>
    <!-- The Modal -->
    <div id="myModal" class="modal">

      <!-- Modal Content (The Image) -->
      <img class="modal-content" id="img01">

      <!-- Modal Caption (Image Text) -->
      <div id="caption"></div>

    </div> 
  `;

  modal = document.getElementById("myModal");
  modalImg = document.getElementById("img01");

  images = await getImages();
  for (const image of images) {
    let imageElement = createImageElement(image.imageUrl);
    imagesContainer.insertBefore(
      imageElement,
      imagesContainer.querySelector("#custom-image-input")
    );
  }

  changeItemsHeader("Images");
}

function renderTodo() {
  soundsContainer.innerHTML= "";
  imagesContainer.innerHTML = "";
  notesContainer.innerHTML = "";
  todoContainer.innerHTML = `
    <div class="todo-header">
      <h2 style="margin:5px">To Do List</h2>
      <input type="text" id="myTodoInput" placeholder="Title...">
      <span onclick="newTodoElement()" class="addBtn">Add</span>
    </div>
    <ul id="myUL"></ul>
    <button type="button" id="clear-list" onclick="removeAll()">Clear Items</button>
  `;

  let list = document.querySelector('ul');
  list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
      ev.target.classList.toggle('checked');
    }
  }, 
  false);

  changeItemsHeader("Todo");
}

async function renderSounds() {
  todoContainer.innerHTML = "";
  notesContainer.innerHTML = "";
  imagesContainer.innerHTML = "";
  soundsContainer.innerHTML= `
    <label for="sound-upload" id="add-sound">+</label>
    <input type="file" id="sound-upload" accept="sound/*" />
  `;

  let input = document.getElementById("sound-upload");
  input.addEventListener("change", handleFiles, false);
  sounds = await getSounds();
  for (const sound of sounds) {
    let soundElement = createSoundElement(sound.soundUrl);
    soundsContainer.insertBefore(soundElement, soundsContainer.querySelector("#add-sound"));
  }
  
  changeItemsHeader("Sound");
}
