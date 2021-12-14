package com.pim.g2;

import express.Express;
import io.javalin.http.UploadedFile;

import java.nio.file.Paths;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        Express app = new Express();
        Database db = new Database();

        //GET-METHODS

        app.get("/rest/users/:username/userID", (req, res) -> {
            String username = req.params("username");

            User user = db.getUserID(username);

            res.json(user);
        });

        app.get("/rest/users/:username/folders", (req, res) -> {
            String username = req.params("username");

            List<Folder> folders = db.getFolders(username);

            res.json(folders);
        });

        app.get("/rest/users/:username/:folderID/notes", (req, res) -> {
            String username = req.params("username");
            int folderID = Integer.parseInt(req.params("folderID"));

            List<Note> notes = db.getNotes(username, folderID);

            res.json(notes);
        });

        app.get("/rest/users/:username/:folder/folderID", (req, res) -> {
            String username = req.params("username");
            String folderName = req.params("folder");

            Folder folder = db.getFolderID(username, folderName);

            res.json(folder);
        });

        app.get("/rest/users/:username/:folderID/images", (req, res) -> {
            String username = req.params("username");
            int folderID = Integer.parseInt(req.params("folderID"));

            List<ImagePost> imagePosts = db.getImagePosts(username, folderID);
            res.json(imagePosts);
        });

        app.get("/rest/users/:username/:folderID/sounds", (req, res) -> {
            String username = req.params("username");
            int folderID = Integer.parseInt(req.params("folderID"));

            List<SoundPost> soundPosts = db.getSoundPosts(username, folderID);
            System.out.println(soundPosts);
            res.json(soundPosts);
        });

        //POST-METHODS

        app.post("/rest/users/:username/:folder/notes", (req, res) -> {
            String username = req.params("username");
            String folderName = req.params("folder");

            Note note = req.body(Note.class);
            db.addNote(note);

            res.json(note);
        });

        app.post("/rest/image-upload", (req, res) -> {
            String imageUrl = null;

            UploadedFile file = req.formDataFile("files");
            imageUrl = db.uploadImage(file);

            res.send(imageUrl);
        });

        app.post("/rest/sounds-upload", (req, res) -> {
            String soundUrl = null;

            UploadedFile file = req.formDataFile("files");
            soundUrl = db.uploadSound(file);
            System.out.println(soundUrl);
            res.send(soundUrl);
        });

        app.post("/rest/sounds-upload/soundpost", (req, res) -> {
            SoundPost soundPost= req.body(SoundPost.class);

            db.createSoundPost(soundPost);
            System.out.println(soundPost);
        });



        app.post("/rest/file-upload/imagepost", (req, res) -> {
            ImagePost imagePost = req.body(ImagePost.class);

            db.createImagePost(imagePost);
            res.send("post OK");
        });

        app.post("/rest/users/:username/newfolder", (req, res) -> {
            String username = req.params("username");

            Folder folder = req.body(Folder.class);
            db.addFolder(folder);

            res.json(folder);
        });

        app.post("/rest/users/login", (req, res) -> {
            User user = req.body(User.class);

            if (db.validateUser(user) == true) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });

        app.post("/rest/users", (req, res) -> {
            User user = req.body(User.class);

            boolean msg = db.checkDuplicateUser(user);

            res.send(msg);
        });

        //PUT-METHODS

        app.put("/rest/users/:username/:folderID/notes/:id", (req, res) -> {
            String username = req.params("username");
            String folderID = req.params("folderID");
            String id = req.params("id");

            System.out.println(folderID + " " + username + " " + id);
            Note note = req.body(Note.class);

            db.updateNote(note);
        });

        //DELETE-METHODS

        app.delete("/rest/users/:username/delete/:folder", (req, res) -> {
            String username = req.params("username");
            String folderName = req.params("folder");

            Folder folder = req.body(Folder.class);

            db.deleteFolder(folder);
        });

        app.delete("/rest/users/:username/notes/delete", (req, res) -> {
            String username = req.params("username");

            Note note = req.body(Note.class);

            db.deleteNote(note);
        });

        app.delete("/rest/users/:username/images/delete", (req, res) -> {
            String username = req.params("username");

            ImagePost image = req.body(ImagePost.class);

            db.deleteImage(image);
        });

        app.delete("/rest/users/:username/sounds/delete", (req, res) -> {
            String username = req.params("username");

            SoundPost sound = req.body(SoundPost.class);

            db.deleteSound(sound);
        });

        app.useStatic(Paths.get("src/www"));

        app.listen(3000);
        System.out.println("Server started on port 3000.");
    }
}
