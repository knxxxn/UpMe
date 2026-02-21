package com.upme.controller;

import com.upme.model.SavedWord;
import com.upme.model.User;
import com.upme.model.Word;
import com.upme.repository.SavedWordRepository;
import com.upme.repository.UserRepository;
import com.upme.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordRepository wordRepository;
    private final SavedWordRepository savedWordRepository;
    private final UserRepository userRepository;

    /**
     * 오늘의 단어 3개 조회 (비로그인 가능)
     * 날짜 기반 시드로 하루 동안 같은 단어를 반환
     */
    @GetMapping("/random")
    public ResponseEntity<List<Map<String, Object>>> getRandomWords() {
        int seed = LocalDate.now().hashCode();
        List<Word> words = wordRepository.findRandomWords(seed, 3);
        List<Map<String, Object>> result = words.stream()
                .map(this::wordToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * 단어 저장 - 로그인 필요
     */
    @PostMapping("/{wordId}/save")
    public ResponseEntity<Map<String, Object>> saveWord(
            @PathVariable Long wordId,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();

        if (savedWordRepository.existsByUserIdAndWordId(userId, wordId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "이미 저장된 단어입니다."));
        }

        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        SavedWord savedWord = SavedWord.builder()
                .user(user)
                .word(word)
                .build();

        savedWordRepository.save(savedWord);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "단어가 저장되었습니다.");
        return ResponseEntity.ok(response);
    }

    /**
     * 단어 저장 취소 - 로그인 필요
     */
    @DeleteMapping("/{wordId}/save")
    @Transactional
    public ResponseEntity<Map<String, Object>> unsaveWord(
            @PathVariable Long wordId,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();

        if (!savedWordRepository.existsByUserIdAndWordId(userId, wordId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "저장되지 않은 단어입니다."));
        }

        savedWordRepository.deleteByUserIdAndWordId(userId, wordId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "단어 저장이 취소되었습니다.");
        return ResponseEntity.ok(response);
    }

    /**
     * 저장한 단어 목록 조회 - 로그인 필요
     */
    @GetMapping("/saved")
    public ResponseEntity<List<Map<String, Object>>> getSavedWords(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<SavedWord> savedWords = savedWordRepository.findByUserIdOrderBySavedAtDesc(userId);

        List<Map<String, Object>> result = savedWords.stream()
                .map(sw -> {
                    Map<String, Object> map = wordToMap(sw.getWord());
                    map.put("savedAt", sw.getSavedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> wordToMap(Word word) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", word.getId());
        map.put("english", word.getEnglish());
        map.put("korean", word.getKorean());
        return map;
    }
}
