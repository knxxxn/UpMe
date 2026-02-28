package com.upme.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/solvedac")
@RequiredArgsConstructor
public class SolvedAcController {

    private final RestTemplate restTemplate;
    private static final String SOLVED_AC_API_URL = "https://solved.ac/api/v3";

    @GetMapping("/search/problem")
    public ResponseEntity<?> searchProblem(
            @RequestParam String query,
            @RequestParam int page,
            @RequestParam String sort,
            @RequestParam String direction) {

        String url = String.format("%s/search/problem?query=%s&page=%d&sort=%s&direction=%s",
                SOLVED_AC_API_URL, query, page, sort, direction);

        try {
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Solved.ac search problem API error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/problem/show")
    public ResponseEntity<?> getProblem(@RequestParam int problemId) {
        String url = String.format("%s/problem/show?problemId=%d", SOLVED_AC_API_URL, problemId);

        try {
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Solved.ac get problem API error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/show")
    public ResponseEntity<?> getUserInfo(@RequestParam String handle) {
        String url = String.format("%s/user/show?handle=%s", SOLVED_AC_API_URL, handle);

        try {
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Solved.ac get user info API error", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
