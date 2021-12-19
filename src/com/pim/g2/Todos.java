package com.pim.g2;

public class Todos {

    private int todoId;
    private String task;
    private boolean completed;

    public Todos() {
    }

    public Todos(String task) {
        this.task = task;
    }

    public Todos(int todoId, String task) {
        this.todoId = todoId;
        this.task = task;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public int getTodoId() {
        return todoId;
    }

    public void setTodoId(int todoId) {
        this.todoId = todoId;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    @Override
    public String toString() {
        return "Todos{" +
                "todoId=" + todoId +
                ", task='" + task + '\'' +
                '}';
    }
}
