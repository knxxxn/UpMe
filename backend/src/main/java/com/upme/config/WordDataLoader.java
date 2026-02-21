package com.upme.config;

import com.upme.model.Word;
import com.upme.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class WordDataLoader implements ApplicationRunner {

    private final WordRepository wordRepository;

    // 첫 번째 한글 문자를 기준으로 영어/한국어 분리
    private static final Pattern KOREAN_SPLIT = Pattern.compile("^(.+?)\\s*([가-힣].*)$");

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 이미 데이터가 있으면 스킵
        if (wordRepository.count() >= 1000) {
            log.info("단어 데이터가 이미 존재합니다. 로딩을 스킵합니다. (현재 {}개)", wordRepository.count());
            return;
        }

        log.info("words.xlsx에서 단어 데이터 로딩 시작...");

        List<Word> words = new ArrayList<>();

        try (InputStream is = new ClassPathResource("words.xlsx").getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Row 0은 헤더, Row 1부터 데이터
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                // 왼쪽 2열: 단어(col 1) → 1~500번
                Word leftWord = parseWord(row, 1);
                if (leftWord != null) {
                    words.add(leftWord);
                }

                // 오른쪽 2열: 단어(col 3) → 501~1000번
                Word rightWord = parseWord(row, 3);
                if (rightWord != null) {
                    words.add(rightWord);
                }
            }

            if (!words.isEmpty()) {
                wordRepository.saveAll(words);
                log.info("단어 데이터 로딩 완료: {}개 저장됨", words.size());
            } else {
                log.info("새로 저장할 단어가 없습니다.");
            }

        } catch (Exception e) {
            log.error("단어 데이터 로딩 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Word parseWord(Row row, int textCol) {
        Cell textCell = row.getCell(textCol);
        if (textCell == null)
            return null;

        String rawText;
        try {
            rawText = textCell.getStringCellValue();
        } catch (Exception e) {
            return null;
        }

        if (rawText == null || rawText.isBlank())
            return null;

        // NBSP 등을 일반 공백으로 치환 후 trim
        rawText = rawText.replace('\u00A0', ' ').trim();

        Matcher matcher = KOREAN_SPLIT.matcher(rawText);
        if (!matcher.matches())
            return null;

        String english = matcher.group(1).trim();
        String korean = matcher.group(2).trim();

        return Word.builder()
                .english(english)
                .korean(korean)
                .build();
    }
}
