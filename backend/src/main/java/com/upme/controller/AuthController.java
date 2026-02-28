package com.upme.controller;

import com.upme.dto.request.LoginRequest;
import com.upme.dto.request.RegisterRequest;
import com.upme.dto.response.AuthResponse;
import com.upme.model.User;
import com.upme.repository.UserRepository;
import com.upme.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import java.util.UUID;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final JwtTokenProvider jwtTokenProvider;
        private final PasswordEncoder passwordEncoder;
        private final UserRepository userRepository;
        private final RestTemplate restTemplate;

        @Value("${google.client.id}")
        private String googleClientId;

        /**
         * 로그인 (이메일 또는 전화번호)
         * POST /api/auth/login
         */
        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
                log.info("로그인 시도: {}", request.getIdentifier());

                // 이메일 또는 전화번호로 사용자 조회
                Optional<User> userOptional = userRepository.findByEmailOrPhoneNumber(
                                request.getIdentifier(), request.getIdentifier());

                if (userOptional.isEmpty()) {
                        return ResponseEntity.badRequest().body(AuthResponse.builder()
                                        .success(false)
                                        .message("존재하지 않는 사용자입니다")
                                        .build());
                }

                User user = userOptional.get();

                // 비밀번호 검증
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return ResponseEntity.badRequest().body(AuthResponse.builder()
                                        .success(false)
                                        .message("비밀번호가 일치하지 않습니다")
                                        .build());
                }

                // JWT 토큰 발급
                String accessToken = jwtTokenProvider.createAccessToken(user.getId(),
                                user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());
                String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

                return ResponseEntity.ok(AuthResponse.builder()
                                .success(true)
                                .message("로그인 성공")
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .user(AuthResponse.UserInfo.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .phoneNumber(user.getPhoneNumber())
                                                .name(user.getName())
                                                .build())
                                .build());
        }

        /**
         * 회원가입 (구글 이메일 또는 전화번호)
         * POST /api/auth/register
         */
        @PostMapping("/register")
        public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
                log.info("회원가입 시도: email={}, phone={}", request.getEmail(), request.getPhoneNumber());

                // 이메일 또는 전화번호 필수 검증
                if (!request.hasValidIdentifier()) {
                        return ResponseEntity.badRequest().body(AuthResponse.builder()
                                        .success(false)
                                        .message("이메일 또는 전화번호 중 하나는 필수입니다")
                                        .build());
                }

                // 중복 검사
                if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
                        return ResponseEntity.badRequest().body(AuthResponse.builder()
                                        .success(false)
                                        .message("이미 사용 중인 이메일입니다")
                                        .build());
                }

                if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                        return ResponseEntity.badRequest().body(AuthResponse.builder()
                                        .success(false)
                                        .message("이미 사용 중인 전화번호입니다")
                                        .build());
                }

                // 사용자 저장
                User user = User.builder()
                                .email(request.getEmail())
                                .phoneNumber(request.getPhoneNumber())
                                .name(request.getName())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .build();

                user = userRepository.save(user);
                log.info("회원가입 완료: userId={}", user.getId());

                // JWT 토큰 발급
                String accessToken = jwtTokenProvider.createAccessToken(user.getId(),
                                user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());
                String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

                return ResponseEntity.ok(AuthResponse.builder()
                                .success(true)
                                .message("회원가입이 완료되었습니다")
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .user(AuthResponse.UserInfo.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .phoneNumber(user.getPhoneNumber())
                                                .name(user.getName())
                                                .build())
                                .build());
        }

        /**
         * 구글 소셜 로그인
         * POST /api/auth/google
         */
        @PostMapping("/google")
        public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
                String accessTokenParam = request.get("token");

                if (accessTokenParam == null) {
                        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "토큰이 없습니다."));
                }

                try {
                        // 1. 구글 액세스 토큰을 사용하여 구글 사용자 정보 가져오기
                        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token="
                                        + accessTokenParam;
                        ResponseEntity<Map> response = restTemplate.getForEntity(userInfoUrl, Map.class);

                        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                                throw new RuntimeException("구글 사용자 정보를 가져오는데 실패했습니다.");
                        }

                        Map<String, Object> payload = response.getBody();
                        String email = (String) payload.get("email");
                        String name = (String) payload.get("name");
                        // profile picture: String pictureUrl = (String) payload.get("picture");

                        if (email == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("success", false, "message", "구글 계정 이메일 정보를 얻을 수 없습니다."));
                        }

                        // 2. DB에서 이메일 확인, 없으면 신규 가입
                        Optional<User> userOptional = userRepository.findByEmailOrPhoneNumber(email, email);
                        User user;

                        if (userOptional.isPresent()) {
                                user = userOptional.get();
                                log.info("구글 로그인 시도 (기존 유저): {}", email);
                        } else {
                                log.info("구글 로그인 시도 (신규 가입): {}", email);
                                // 비밀번호는 구글 로그인 시 사용되지 않으므로 랜덤 UUID 생성
                                user = User.builder()
                                                .email(email)
                                                .name(name != null ? name : "Google User")
                                                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                                                .build();
                                user = userRepository.save(user);
                        }

                        // 3. JWT 토큰 발급 (기존 로그인 방식과 동일)
                        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
                        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

                        return ResponseEntity.ok(AuthResponse.builder()
                                        .success(true)
                                        .message("구글 로그인 성공")
                                        .accessToken(accessToken)
                                        .refreshToken(refreshToken)
                                        .user(AuthResponse.UserInfo.builder()
                                                        .id(user.getId())
                                                        .email(user.getEmail())
                                                        .phoneNumber(user.getPhoneNumber())
                                                        .name(user.getName())
                                                        .build())
                                        .build());

                } catch (Exception e) {
                        log.error("구글 로그인 처리 중 오류 발생", e);
                        return ResponseEntity.badRequest().body(
                                        Map.of("success", false, "message", "구글 인증에 실패했습니다.", "error", e.getMessage()));
                }
        }

        /**
         * 토큰 갱신
         * POST /api/auth/refresh
         */
        @PostMapping("/refresh")
        public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) {
                String refreshToken = request.get("refreshToken");

                if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "유효하지 않은 리프레시 토큰"));
                }

                Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
                Optional<User> userOptional = userRepository.findById(userId);

                if (userOptional.isEmpty()) {
                        return ResponseEntity.badRequest().body(Map.of("error", "사용자를 찾을 수 없습니다"));
                }

                User user = userOptional.get();
                String newAccessToken = jwtTokenProvider.createAccessToken(userId,
                                user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());

                return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        }

        /**
         * 로그아웃
         * POST /api/auth/logout
         */
        @PostMapping("/logout")
        public ResponseEntity<Map<String, Object>> logout() {
                // 클라이언트에서 토큰 삭제 처리
                // TODO: 블랙리스트 토큰 관리 (Redis 등)
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "로그아웃 성공"));
        }
}
