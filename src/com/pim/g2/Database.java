package com.pim.g2;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.javalin.http.UploadedFile;
import nosqlite.utilities.Utils;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.*;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

public class Database {

    private Connection conn;

    public Database() {
        try {
            conn = DriverManager.getConnection("jdbc:sqlite:database/PIM-g2-DB.db");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public User getUserID(String username) {
        User user = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Users.id AS id " +
                    "FROM Users " +
                    "WHERE Users.username = ?");
            stmt.setString(1, username);

            ResultSet rs = stmt.executeQuery();

            User[] userFromRS = (Utils.resultSetToObject(rs, User[].class));

            user = userFromRS[0];

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return user;
    }

    public List<Folder> getFolders(String username) {
        List<Folder> folders = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Folders.folderName AS folderName\n" +
                    "FROM Folders\n" +
                    "INNER JOIN Users\n" +
                    "ON Users.id = Folders.userId\n" +
                    "WHERE Users.username = ?");
            stmt.setString(1, username);

            ResultSet rs = stmt.executeQuery();

            Folder[] foldersFromRS = Utils.resultSetToObject(rs, Folder[].class);

            folders = List.of(foldersFromRS);

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return folders;
    }

    public List<Note> getNotes(String username, int folderID) {
        List<Note> notes = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Notes.id AS id, Notes.note AS notes\n" +
                    "FROM Notes\n" +
                    "INNER JOIN Folders\n" +
                    "ON Folders.id = Notes.folderId\n" +
                    "INNER JOIN Users\n" +
                    "ON Users.id = Folders.userId\n" +
                    "WHERE Users.username = ? AND Folders.id = ?");
            stmt.setString(1, username);
            stmt.setInt(2, folderID);
            ResultSet rs = stmt.executeQuery();

            Note[] notesFromRS = Utils.resultSetToObject(rs, Note[].class);
            notes = List.of(notesFromRS);

        } catch (SQLException e) {
            e.printStackTrace();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return notes;
    }

    public List<ImagePost> getImagePosts(String username, int folderID) {
        List<ImagePost> imagePosts = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Images.imageUrl AS imageUrl " +
                    "FROM Images " +
                    "INNER JOIN Folders " +
                    "ON Folders.id = Images.folderId " +
                    "INNER JOIN Users " +
                    "ON Users.id = Folders.userId " +
                    "WHERE Users.username = ? AND Folders.id = ?");
            stmt.setString(1, username);
            stmt.setInt(2, folderID);

            ResultSet rs = stmt.executeQuery();

            ImagePost[] imagesFromRS = (Utils.resultSetToObject(rs, ImagePost[].class));
            imagePosts = List.of(imagesFromRS);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return imagePosts;
    }

    public List<SoundPost> getSoundPosts(String username, int folderID) {
        List<SoundPost> soundPosts = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Sounds.soundUrl AS soundUrl " +
                    "FROM Sounds " +
                    "INNER JOIN Folders " +
                    "ON Folders.id = Sounds.folderId " +
                    "INNER JOIN Users " +
                    "ON Users.id = Folders.userId " +
                    "WHERE Folders.id = ?");

            stmt.setInt(1, folderID);

            ResultSet rs = stmt.executeQuery();

            SoundPost[] soundsFromRS = (Utils.resultSetToObject(rs, SoundPost[].class));
            soundPosts = List.of(soundsFromRS);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return soundPosts;
    }


    public Folder getFolderID(String username, String folderName) {
        Folder folder = null;

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT Folders.id AS id " +
                    "FROM Folders " +
                    "INNER JOIN Users " +
                    "ON Users.id = Folders.userId " +
                    "WHERE Users.username = ? " +
                    "AND Folders.folderName = ? " +
                    "AND Folders.userId = Users.id");
            stmt.setString(1, username);
            stmt.setString(2, folderName);

            ResultSet rs = stmt.executeQuery();

            Folder[] folderFromRS = (Utils.resultSetToObject(rs, Folder[].class));

            folder = folderFromRS[0];

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return folder;
    }

    public void addNote(Note note) {

        try {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Notes (id, note, folderId) VALUES(?, ?, ?)");
            stmt.setInt(1, note.getId());
            stmt.setString(2, note.getNotes());
            stmt.setInt(3, note.getFolderID());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void createImagePost(ImagePost imagePost) {
        try {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Images (folderId, title, imageUrl) VALUES(?, ?, ?)");
            stmt.setInt(1, imagePost.getFolderId());
            stmt.setString(2, imagePost.getTitle());
            stmt.setString(3, imagePost.getImageUrl());

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String uploadImage(UploadedFile file) {
        String imageUrl = "/uploads/" + file.getFilename();
        System.out.println(imageUrl);

        try (var os = new FileOutputStream(Paths.get("src/www" + imageUrl).toString())) {

            os.write(file.getContent().readAllBytes());
        } catch (Exception e) {
            e.printStackTrace();

            return null;
        }

        return imageUrl;
    }

    public String uploadSound(UploadedFile file) {
        String soundUrl = "/sounds/" + file.getFilename();
        System.out.println(soundUrl);

        try (var os = new FileOutputStream(Paths.get("src/www" + soundUrl).toString())) {

            os.write(file.getContent().readAllBytes());
        } catch (Exception e) {
            e.printStackTrace();

            return null;
        }

        return soundUrl;
    }

    public void createSoundPost(SoundPost soundPost){

        try {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Sounds (folderId, title, soundUrl) VALUES(?, ?, ?)");
            stmt.setInt(1, soundPost.getFolderId());
            stmt.setString(2, soundPost.getTitle());
            stmt.setString(3, soundPost.getSoundUrl());

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void addFolder(Folder folder) {
        try {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Folders (userId, folderName) " +
                    "VALUES(?, ?)");
            stmt.setInt(1, folder.getUserID());
            stmt.setString(2, folder.getFolderName());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public boolean validateUser(User user) {

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Users");
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                if (Objects.equals(user.getUsername(), rs.getString("username"))) {
                    if (Objects.equals(user.getPassword(), rs.getString("password"))) {
                        return true;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
        return false;
    }

    public boolean checkDuplicateUser(User user) {

        try {
            PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Users");
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                if (Objects.equals(user.getUsername(), rs.getString("username"))) {
                    return false;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        createUser(user);

        return true;
    }

    public void createUser(User user) {

        try {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO Users (username, password) VALUES(?, ?)");
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPassword());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateNote(Note note) {
        try {
            PreparedStatement stmt = conn.prepareStatement("UPDATE Notes SET note = ? WHERE id = ?");
            stmt.setString(1, note.getNotes());
            stmt.setInt(2, note.getId());

            System.out.println(note.getNotes());
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteFolder(Folder folder) {
        deleteAllNotesInFolder(folder);

        try {
            PreparedStatement stmt = conn.prepareStatement(("DELETE FROM Folders " +
                    "WHERE Folders.userId = ? " +
                    "AND Folders.folderName = ?"));
            stmt.setInt(1, folder.getUserID());
            stmt.setString(2, folder.getFolderName());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteNote(Note note) {
        try {
            PreparedStatement stmt = conn.prepareStatement(("DELETE FROM Notes WHERE id = ?"));
            stmt.setInt(1, note.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteImage(ImagePost image) {
        try {
            PreparedStatement stmt = conn.prepareStatement(("DELETE FROM Images WHERE imageUrl = ?"));
            stmt.setString(1, image.getImageUrl());

            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteAllNotesInFolder(Folder folder) {
        try {
            PreparedStatement stmt = conn.prepareStatement("DELETE FROM Notes WHERE Notes.folderId = ?");
            stmt.setInt(1, folder.getId());

            stmt.executeUpdate();

        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
    }
}
