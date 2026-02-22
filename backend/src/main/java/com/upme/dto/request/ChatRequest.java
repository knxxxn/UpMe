package com.upme.dto.request;

import java.util.List;

public class ChatRequest {

    private String message;
    private int topicId;
    private List<MessageItem> history;

    public ChatRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTopicId() {
        return topicId;
    }

    public void setTopicId(int topicId) {
        this.topicId = topicId;
    }

    public List<MessageItem> getHistory() {
        return history;
    }

    public void setHistory(List<MessageItem> history) {
        this.history = history;
    }

    public static class MessageItem {
        private String role; // "user" or "ai"
        private String content;

        public MessageItem() {
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
