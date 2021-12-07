package com.pim.g2;

public class Folder {

    private int id;
    private int userID;
    private String folderName;

    public Folder() {

    }

    public Folder(int id) {
        this.id = id;
    }

    public Folder(int userID, String folderName) {
        this.userID = userID;
        this.folderName = folderName;
    }

    public Folder(int id, int userID, String folderName) {
        this.id = id;
        this.userID = userID;
        this.folderName = folderName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getFolderName() {
        return folderName;
    }

    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }

    @Override
    public String toString() {
        return "Folder{" +
                "id=" + id +
                ", userID=" + userID +
                ", folderName='" + folderName + '\'' +
                '}';
    }
}
