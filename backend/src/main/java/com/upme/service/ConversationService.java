package com.upme.service;

import com.upme.model.ChatMessage;
import com.upme.model.Conversation;
import com.upme.model.User;
import com.upme.repository.ChatMessageRepository;
import com.upme.repository.ConversationRepository;
import com.upme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private static final Map<Integer, String> TOPIC_NAMES = Map.of(
            1, "일상 대화",
            2, "여행",
            3, "비즈니스",
            4, "면접 준비",
            5, "기술 토론",
            6, "자유 주제");

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    /**
     * 새 대화 생성
     */
    @Transactional
    public Conversation createConversation(Long userId, Integer topicId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String topicName = TOPIC_NAMES.getOrDefault(topicId, "자유 주제");

        Conversation conversation = Conversation.builder()
                .user(user)
                .topicId(topicId)
                .title(topicName)
                .build();

        conversation = conversationRepository.save(conversation);
        log.info("새 대화 생성: conversationId={}, userId={}, topic={}", conversation.getId(), userId, topicName);

        // 첫 AI 인사 메시지 저장
        ChatMessage greeting = ChatMessage.builder()
                .conversation(conversation)
                .role("ai")
                .content("Hello! I'm your AI conversation partner. Let's practice English together! Today's topic is \""
                        + topicName + "\". What would you like to talk about?")
                .build();
        chatMessageRepository.save(greeting);

        return conversation;
    }

    /**
     * 사용자의 대화 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    /**
     * 대화 메시지 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getMessages(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("대화를 찾을 수 없습니다."));

        // 본인 대화인지 확인
        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    /**
     * 메시지 저장 (유저 메시지 + AI 응답)
     */
    @Transactional
    public void saveMessages(Long conversationId, String userContent, String aiReply, String aiFeedback) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("대화를 찾을 수 없습니다."));

        // 유저 메시지 저장
        ChatMessage userMsg = ChatMessage.builder()
                .conversation(conversation)
                .role("user")
                .content(userContent)
                .build();
        chatMessageRepository.save(userMsg);

        // AI 응답 저장
        ChatMessage aiMsg = ChatMessage.builder()
                .conversation(conversation)
                .role("ai")
                .content(aiReply)
                .feedback(aiFeedback)
                .build();
        chatMessageRepository.save(aiMsg);

        // 대화 updatedAt 갱신
        conversationRepository.save(conversation);

        log.info("메시지 저장 완료: conversationId={}", conversationId);
    }

    /**
     * 대화 삭제
     */
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("대화를 찾을 수 없습니다."));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        // 메시지 먼저 삭제 후 대화 삭제
        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        chatMessageRepository.deleteAll(messages);
        conversationRepository.delete(conversation);

        log.info("대화 삭제: conversationId={}, userId={}", conversationId, userId);
    }
}
