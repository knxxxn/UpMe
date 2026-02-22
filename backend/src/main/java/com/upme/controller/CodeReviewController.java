package com.upme.controller;

import com.upme.dto.request.CodeReviewRequest;
import com.upme.dto.response.CodeReviewResponse;
import com.upme.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/code-review")
@RequiredArgsConstructor
public class CodeReviewController {

    private final GeminiService geminiService;

    /**
     * AI 코드 리뷰 요청
     * POST /api/code-review
     * 인증 필요 (로그인 사용자만)
     */
    @PostMapping
    public ResponseEntity<CodeReviewResponse> reviewCode(@RequestBody CodeReviewRequest request) {
        log.info("코드 리뷰 요청: 문제 #{} ({}), 언어: {}",
                request.getProblemId(), request.getProblemTitle(), request.getLanguage());

        CodeReviewResponse response = geminiService.reviewCode(request);

        log.info("코드 리뷰 완료: summary 길이={}", response.getSummary().length());

        return ResponseEntity.ok(response);
    }
}
