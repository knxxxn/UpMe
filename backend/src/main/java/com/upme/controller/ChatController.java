package com.upme.controller;

import com.upme.dto.request.ChatRequest;
import com.upme.dto.response.ChatResponse;
import com.upme.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;

    /**
     * AI 회화 메시지 전송
     * POST /api/chat
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("채팅 요청: topicId={}, message={}", request.getTopicId(),
                request.getMessage().substring(0, Math.min(50, request.getMessage().length())));

        ChatResponse response = geminiService.chat(request);

        log.info("AI 응답 완료: reply 길이={}, feedback 존재={}",
                response.getReply().length(),
                !response.getFeedback().isEmpty());

        return ResponseEntity.ok(response);
    }

    /**
     * 서비스 상태 확인
     * GET /api/chat/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "gemini-chat"));
    }
}
