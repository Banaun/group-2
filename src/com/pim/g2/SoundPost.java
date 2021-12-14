package com.pim.g2;

public class SoundPost {

    private int id;
    private int folderId;
    private String title;
    private String soundUrl;

    public SoundPost() {

    }

    public SoundPost(int folderId, String soundUrl) {
        this.folderId = folderId;
        this.soundUrl = soundUrl;
    }

    public SoundPost(int folderId, String title, String soundUrl) {
        this.folderId = folderId;
        this.title = title;
        this.soundUrl = soundUrl;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getFolderId() {
        return folderId;
    }

    public void setFolderId(int folderId) {
        this.folderId = folderId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSoundUrl() {
        return soundUrl;
    }

    public void setSoundUrl(String soundUrl) {
        this.soundUrl = soundUrl;
    }

    @Override
    public String  toString() {
        return "SoundPost{" +
                "id=" + id +
                ", folderId=" + folderId +
                ", title='" + title + '\'' +
                ", soundUrl='" + soundUrl + '\'' +
                '}';
    }
}
