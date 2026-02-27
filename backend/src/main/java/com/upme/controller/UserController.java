package com.upme.controller;

import com.upme.model.User;
import com.upme.repository.UserRepository;
import com.upme.repository.UserActivityRepository;
import com.upme.repository.SavedWordRepository;
import com.upme.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final UserActivityRepository userActivityRepository;
        private final SavedWordRepository savedWordRepository;
        private final ConversationRepository conversationRepository;

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

                java.util.Map<String, Object> result = new java.util.HashMap<>();
                result.put("id", user.getId());
                result.put("email", user.getEmail() != null ? user.getEmail() : "");
                result.put("name", user.getName());
                result.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                result.put("bojHandle", user.getBojHandle() != null ? user.getBojHandle() : "");
                result.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
                result.put("stats", Map.of(
                                "solvedProblems", 0,
                                "totalSubmissions", 0,
                                "successRate", 0));
                return ResponseEntity.ok(result);
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

                // 백준 아이디 수정
                if (request.containsKey("bojHandle")) {
                        user.setBojHandle(request.get("bojHandle"));
                }

                userRepository.save(user);
                log.info("프로필 수정 완료: userId={}", userId);

                java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                userMap.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                userMap.put("bojHandle", user.getBojHandle() != null ? user.getBojHandle() : "");

                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "프로필이 수정되었습니다",
                                "user", userMap));
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

                List<com.upme.model.UserActivity> activities = userActivityRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);

                // 최근 10개로 제한
                if (activities.size() > 10) {
                        activities = activities.subList(0, 10);
                }

                List<Map<String, Object>> activityList = activities.stream().map(a -> {
                        Map<String, Object> map = new java.util.HashMap<>();
                        map.put("id", a.getId());
                        map.put("type", a.getActivityType());
                        map.put("title", a.getTitle());

                        if ("coding".equals(a.getActivityType())) {
                                map.put("result", a.getDetail());
                        } else if ("conversation".equals(a.getActivityType())) {
                                map.put("duration", a.getDetail());
                        } else if ("word".equals(a.getActivityType())) {
                                map.put("count", a.getDetail());
                        } else {
                                map.put("detail", a.getDetail());
                        }

                        map.put("time", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
                        return map;
                }).toList();

                return ResponseEntity.ok(Map.of("recentActivity", activityList));
        }

        /**
         * 통계 조회
         * GET /api/users/stats
         */
        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getUserStats(Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();
                log.info("통계 조회: userId={}", userId);

                List<com.upme.model.UserActivity> activities = userActivityRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);
                int savedWordsCount = savedWordRepository.countByUserId(userId);
                int conversationCount = conversationRepository.countByUserId(userId);

                int codingCount = 0;
                int codingPassedCount = 0;
                int totalStudyTimeMinutes = 0;

                java.util.Set<java.time.LocalDate> activityDates = new java.util.HashSet<>();

                java.time.LocalDate today = java.time.LocalDate.now();
                java.time.LocalDate oneWeekAgo = today.minusDays(6);

                Map<java.time.DayOfWeek, Double> weeklyHoursMap = new java.util.EnumMap<>(java.time.DayOfWeek.class);
                for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
                        weeklyHoursMap.put(day, 0.0);
                }

                for (com.upme.model.UserActivity activity : activities) {
                        if (activity.getStudyTimeMinutes() != null) {
                                totalStudyTimeMinutes += activity.getStudyTimeMinutes();
                        }

                        if ("coding".equals(activity.getActivityType())) {
                                codingCount++;
                                if ("통과".equals(activity.getDetail())) {
                                        codingPassedCount++;
                                }
                        }

                        if (activity.getCreatedAt() != null) {
                                java.time.LocalDate date = activity.getCreatedAt().toLocalDate();
                                activityDates.add(date);

                                if (!date.isBefore(oneWeekAgo) && !date.isAfter(today)) {
                                        double hours = weeklyHoursMap.get(date.getDayOfWeek());
                                        int mins = activity.getStudyTimeMinutes() != null
                                                        ? activity.getStudyTimeMinutes()
                                                        : 0;
                                        weeklyHoursMap.put(date.getDayOfWeek(), hours + (mins / 60.0));
                                }
                        }
                }

                String accuracy = "0%";
                if (codingCount > 0) {
                        int acc = (int) Math.round(((double) codingPassedCount / codingCount) * 100);
                        accuracy = acc + "%";
                }

                int streak = 0;
                java.time.LocalDate checkDate = today;
                while (activityDates.contains(checkDate)) {
                        streak++;
                        checkDate = checkDate.minusDays(1);
                }

                if (streak == 0 && activityDates.contains(today.minusDays(1))) {
                        streak = 1;
                        checkDate = today.minusDays(2);
                        while (activityDates.contains(checkDate)) {
                                streak++;
                                checkDate = checkDate.minusDays(1);
                        }
                }

                String totalStudyTime = (totalStudyTimeMinutes / 60) + "시간";

                List<Map<String, Object>> weeklyData = new java.util.ArrayList<>();
                String[] dayNames = { "", "월", "화", "수", "목", "금", "토", "일" };
                for (int i = 1; i <= 7; i++) {
                        java.time.DayOfWeek dow = java.time.DayOfWeek.of(i);
                        double hours = Math.round(weeklyHoursMap.get(dow) * 10.0) / 10.0;
                        weeklyData.add(Map.of("day", dayNames[i], "hours", hours));
                }

                Map<String, Object> stats = new java.util.HashMap<>();
                stats.put("totalStudyTime", totalStudyTime);
                stats.put("streak", streak);
                stats.put("conversationCount", conversationCount);
                stats.put("codingCount", codingCount);
                stats.put("codingPassedCount", codingPassedCount);
                stats.put("accuracy", accuracy);
                stats.put("wordsLearned", savedWordsCount);

                return ResponseEntity.ok(Map.of(
                                "stats", stats,
                                "weeklyData", weeklyData));
        }
}
