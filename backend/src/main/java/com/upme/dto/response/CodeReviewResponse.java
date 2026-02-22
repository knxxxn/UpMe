package com.upme.dto.response;

public class CodeReviewResponse {

    private String summary;
    private String strengths;
    private String improvements;
    private String timeComplexity;
    private String tips;

    public CodeReviewResponse() {
    }

    public CodeReviewResponse(String summary, String strengths, String improvements,
            String timeComplexity, String tips) {
        this.summary = summary;
        this.strengths = strengths;
        this.improvements = improvements;
        this.timeComplexity = timeComplexity;
        this.tips = tips;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getImprovements() {
        return improvements;
    }

    public void setImprovements(String improvements) {
        this.improvements = improvements;
    }

    public String getTimeComplexity() {
        return timeComplexity;
    }

    public void setTimeComplexity(String timeComplexity) {
        this.timeComplexity = timeComplexity;
    }

    public String getTips() {
        return tips;
    }

    public void setTips(String tips) {
        this.tips = tips;
    }
}
