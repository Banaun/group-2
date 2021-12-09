package com.pim.g2;

import java.awt.*;

public class ImagePost {

    private int id;
    private int folderId;
    private String title;
    private String imageUrl;

    public ImagePost() {

    }

    public ImagePost(int folderId, String imageUrl) {
        this.folderId = folderId;
        this.imageUrl = imageUrl;
    }

    public ImagePost(int folderId, String title, String imageUrl) {
        this.folderId = folderId;
        this.title = title;
        this.imageUrl = imageUrl;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "ImagePost{" +
                "id=" + id +
                ", folderId=" + folderId +
                ", title='" + title + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
