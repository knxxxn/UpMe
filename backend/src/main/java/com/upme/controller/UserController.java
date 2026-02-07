package com.upme.controller;

import com.upme.model.User;
import com.upme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        /**
         * 프로필 조회
         * GET /api/users/profile
         */
        @GetMapping("/profile")
        public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();
                log.info("프로필 조회: userId={}", userId);

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

                return ResponseEntity.ok(Map.of(
                                "id", user.getId(),
                                "email", user.getEmail() != null ? user.getEmail() : "",
                                "name", user.getName(),
                                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                                "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "",
                                "stats", Map.of(
                                                "solvedProblems", 0,
                                                "totalSubmissions", 0,
                                                "successRate", 0)));
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

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

                // 이름 수정
                if (request.containsKey("name") && request.get("name") != null) {
                        user.setName(request.get("name"));
                }

                // 휴대폰 번호 수정
                if (request.containsKey("phoneNumber")) {
                        user.setPhoneNumber(request.get("phoneNumber"));
                }

                userRepository.save(user);
                log.info("프로필 수정 완료: userId={}", userId);

                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "프로필이 수정되었습니다",
                                "user", Map.of(
                                                "id", user.getId(),
                                                "name", user.getName(),
                                                "email", user.getEmail() != null ? user.getEmail() : "",
                                                "phoneNumber",
                                                user.getPhoneNumber() != null ? user.getPhoneNumber() : "")));
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

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

                // 현재 비밀번호 검증
                String currentPassword = request.get("currentPassword");
                if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "success", false,
                                        "message", "현재 비밀번호가 일치하지 않습니다"));
                }

                // 새 비밀번호 설정
                String newPassword = request.get("newPassword");
                if (newPassword == null || newPassword.length() < 8) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "success", false,
                                        "message", "새 비밀번호는 8자 이상이어야 합니다"));
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                log.info("비밀번호 변경 완료: userId={}", userId);

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

                if (!userRepository.existsById(userId)) {
                        return ResponseEntity.badRequest().body(Map.of(
                                        "success", false,
                                        "message", "사용자를 찾을 수 없습니다"));
                }

                userRepository.deleteById(userId);
                log.info("계정 삭제 완료: userId={}", userId);

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

                // TODO: 활동 내역 테이블 생성 후 실제 조회 구현
                return ResponseEntity.ok(Map.of(
                                "recentSubmissions", java.util.List.of(),
                                "recentConversations", java.util.List.of()));
        }
}
