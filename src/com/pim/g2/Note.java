package com.pim.g2;

public class Note {

    private int id;
    private int folderID;
    private String notes;

    public Note() {

    }

    public Note(int id) {
        this.id = id;
    }

    public Note(int id, String notes) {
        this.id = id;
        this.notes = notes;
    }

    public Note(int id, int folderID, String notes) {
        this.id = id;
        this.folderID = folderID;
        this.notes = notes;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getFolderID() {
        return folderID;
    }

    public void setFolderID(int folderID) {
        this.folderID = folderID;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "Note{" +
                "id=" + id +
                ", folderID=" + folderID +
                ", notes='" + notes + '\'' +
                '}';
    }
}
