package com.upme.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    /**
     * 프로필 조회
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("프로필 조회: userId={}", userId);

        // TODO: DATABASE 연결 후 실제 사용자 조회
        // User user = userRepository.findById(userId).orElseThrow();

        return ResponseEntity.ok(Map.of(
                "id", userId,
                "email", "user@example.com",
                "name", "테스트 사용자",
                "profileImage", "",
                "createdAt", "2026-01-01",
                "stats", Map.of(
                        "solvedProblems", 42,
                        "totalSubmissions", 128,
                        "successRate", 85)));
    }

    /**
     * 프로필 수정
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("프로필 수정: userId={}, data={}", userId, request);

        // TODO: DATABASE 연결 후 실제 프로필 수정
        // User user = userRepository.findById(userId).orElseThrow();
        // user.setName(request.get("name"));
        // userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "프로필이 수정되었습니다",
                "user", Map.of(
                        "id", userId,
                        "name", request.getOrDefault("name", "테스트 사용자"))));
    }

    /**
     * 비밀번호 변경
     * PUT /api/users/password
     */
    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("비밀번호 변경: userId={}", userId);

        // TODO: DATABASE 연결 후 비밀번호 검증 및 변경
        // User user = userRepository.findById(userId).orElseThrow();
        // if (!passwordEncoder.matches(request.get("currentPassword"),
        // user.getPassword())) {
        // throw new BadCredentialsException("현재 비밀번호가 일치하지 않습니다");
        // }
        // user.setPassword(passwordEncoder.encode(request.get("newPassword")));
        // userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "비밀번호가 변경되었습니다"));
    }

    /**
     * 계정 삭제
     * DELETE /api/users/account
     */
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, Object>> deleteAccount(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("계정 삭제: userId={}", userId);

        // TODO: DATABASE 연결 후 계정 삭제
        // userRepository.deleteById(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "계정이 삭제되었습니다"));
    }

    /**
     * 활동 내역 조회
     * GET /api/users/activity
     */
    @GetMapping("/activity")
    public ResponseEntity<Map<String, Object>> getActivityHistory(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("활동 내역 조회: userId={}", userId);

        // TODO: DATABASE 연결 후 활동 내역 조회

        return ResponseEntity.ok(Map.of(
                "recentSubmissions", java.util.List.of(),
                "recentConversations", java.util.List.of()));
    }
}
