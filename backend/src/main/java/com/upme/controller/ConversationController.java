package com.upme.controller;

import com.upme.dto.request.ChatRequest;
import com.upme.dto.response.ChatResponse;
import com.upme.model.ChatMessage;
import com.upme.model.Conversation;
import com.upme.service.ConversationService;
import com.upme.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final GeminiService geminiService;

    /**
     * 내 대화 목록 조회
     * GET /api/conversations
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getConversations() {
        Long userId = getCurrentUserId();
        List<Conversation> conversations = conversationService.getUserConversations(userId);

        List<Map<String, Object>> result = conversations.stream()
                .map(c -> Map.<String, Object>of(
                        "id", c.getId(),
                        "topicId", c.getTopicId() != null ? c.getTopicId() : 6,
                        "title", c.getTitle() != null ? c.getTitle() : "대화",
                        "createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "",
                        "updatedAt",
                        c.getUpdatedAt() != null ? c.getUpdatedAt().toString()
                                : c.getCreatedAt() != null ? c.getCreatedAt().toString() : ""))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 새 대화 생성
     * POST /api/conversations
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createConversation(@RequestBody Map<String, Integer> body) {
        Long userId = getCurrentUserId();
        Integer topicId = body.getOrDefault("topicId", 6);

        Conversation conversation = conversationService.createConversation(userId, topicId);

        return ResponseEntity.ok(Map.of(
                "id", conversation.getId(),
                "topicId", conversation.getTopicId(),
                "title", conversation.getTitle()));
    }

    /**
     * 대화 메시지 조회
     * GET /api/conversations/{id}/messages
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        List<ChatMessage> messages = conversationService.getMessages(id, userId);

        List<Map<String, Object>> result = messages.stream()
                .map(m -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", m.getId());
                    map.put("role", m.getRole());
                    map.put("content", m.getContent());
                    map.put("feedback", m.getFeedback());
                    map.put("createdAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 메시지 전송 (유저 메시지 → AI 응답 → DB 저장)
     * POST /api/conversations/{id}/messages
     */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatResponse> sendMessage(
            @PathVariable Long id,
            @RequestBody ChatRequest request) {

        Long userId = getCurrentUserId();

        // 본인 대화인지 확인 (getMessages에서 검증)
        conversationService.getMessages(id, userId);

        // Gemini AI 호출
        ChatResponse response = geminiService.chat(request);

        // DB에 메시지 저장
        conversationService.saveMessages(
                id,
                request.getMessage(),
                response.getReply(),
                response.getFeedback());

        return ResponseEntity.ok(response);
    }

    /**
     * 대화 삭제
     * DELETE /api/conversations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteConversation(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        conversationService.deleteConversation(id, userId);
        return ResponseEntity.ok(Map.of("message", "대화가 삭제되었습니다."));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (Long) auth.getPrincipal();
    }
}
