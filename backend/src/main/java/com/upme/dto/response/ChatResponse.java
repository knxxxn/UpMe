package com.upme.dto.response;

public class ChatResponse {

    private String reply;
    private String feedback;

    public ChatResponse() {
    }

    public ChatResponse(String reply, String feedback) {
        this.reply = reply;
        this.feedback = feedback;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
