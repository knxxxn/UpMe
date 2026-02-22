package com.upme.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.upme.dto.request.ChatRequest;
import com.upme.dto.response.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String model;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    /**
     * Gemini API 메시지 보내고 응답 받기
     */
    public ChatResponse chat(ChatRequest request) {
        try {
            log.info("Gemini API 호출 시작 - model: {}", model);
            String systemPrompt = buildSystemPrompt(request.getTopicId());
            Map<String, Object> requestBody = buildRequestBody(systemPrompt, request);

            log.debug("Request body: {}", requestBody);

            String responseJson = webClient.post()
                    .uri("/v1beta/models/{model}:generateContent?key={key}", model, apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(body -> {
                                        log.error("Gemini API 에러 응답 ({}): {}", clientResponse.statusCode(), body);
                                        return new RuntimeException(
                                                "Gemini API error " + clientResponse.statusCode() + ": " + body);
                                    }))
                    .bodyToMono(String.class)
                    .block();

            log.debug("Gemini 응답 원본: {}", responseJson);
            return parseResponse(responseJson);
        } catch (Exception e) {
            log.error("Gemini API 호출 실패: {}", e.getMessage(), e);
            return new ChatResponse(
                    "I'm sorry, I'm having trouble responding right now. Please try again!",
                    "⚠️ AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 주제별 시스템 프롬프트 생성
     */
    private String buildSystemPrompt(int topicId) {
        String basePrompt = """
                You are a friendly and helpful English conversation partner for Korean learners.

                RULES:
                1. Always reply to the user IN ENGLISH for the conversation part.
                2. If the user makes grammar mistakes, vocabulary errors, or unnatural expressions, provide feedback IN KOREAN.
                3. Keep your English replies natural, encouraging, and at an intermediate level.
                4. If the user's English is perfect, leave feedback empty.
                5. Be conversational and ask follow-up questions to keep the chat going.

                You MUST respond in the following JSON format ONLY (no markdown, no code blocks):
                {"reply": "Your English conversation response here", "feedback": "한국어로 문법/단어 피드백 (없으면 빈 문자열)"}

                IMPORTANT: Output ONLY the JSON object. No other text before or after it.
                """;

        String topicContext = switch (topicId) {
            case 1 -> "\nTOPIC: Daily conversation (일상 대화) - Talk about everyday life, hobbies, weather, food, etc.";
            case 2 -> "\nTOPIC: Travel (여행) - Discuss travel plans, experiences, destinations, and travel tips.";
            case 3 ->
                "\nTOPIC: Business (비즈니스) - Practice business meetings, email writing, and professional communication.";
            case 4 ->
                "\nTOPIC: Job Interview (면접 준비) - Practice common interview questions and professional responses.";
            case 5 ->
                "\nTOPIC: Tech Discussion (기술 토론) - Discuss programming, technology trends, and software development.";
            case 6 -> "\nTOPIC: Free Topic (자유 주제) - Talk about anything the user wants.";
            default -> "\nTOPIC: Free conversation - Talk about anything.";
        };

        return basePrompt + topicContext;
    }

    /**
     * Gemini API 요청 바디 구성
     */
    private Map<String, Object> buildRequestBody(String systemPrompt, ChatRequest request) {
        // System instruction
        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", systemPrompt)));

        // Conversation history + current message
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add history
        if (request.getHistory() != null) {
            for (ChatRequest.MessageItem item : request.getHistory()) {
                String role = "user".equals(item.getRole()) ? "user" : "model";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", item.getContent()))));
            }
        }

        // Add current user message
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", request.getMessage()))));

        // Build full request
        Map<String, Object> body = new HashMap<>();
        body.put("system_instruction", systemInstruction);
        body.put("contents", contents);
        body.put("generationConfig", Map.of(
                "temperature", 0.8,
                "maxOutputTokens", 1024));

        return body;
    }

    /**
     * Gemini API 응답 파싱
     */
    private ChatResponse parseResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");

            if (candidates.isEmpty()) {
                log.warn("Gemini 응답에 candidates가 없습니다: {}", responseJson);
                return new ChatResponse(
                        "I couldn't generate a response. Could you try rephrasing?",
                        "");
            }

            String text = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            // Clean up markdown code blocks if present
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            }
            if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();

            // Parse JSON response
            JsonNode parsed = objectMapper.readTree(text);
            String reply = parsed.path("reply").asText("I'm not sure how to respond to that.");
            String feedback = parsed.path("feedback").asText("");

            return new ChatResponse(reply, feedback);
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 실패: {}", e.getMessage());
            log.debug("원본 응답: {}", responseJson);
            return new ChatResponse(
                    "I had trouble understanding. Could you say that again?",
                    "⚠️ AI 응답을 처리하는 중 오류가 발생했습니다.");
        }
    }
}
