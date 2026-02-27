package com.upme.repository;

import com.upme.model.SavedWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedWordRepository extends JpaRepository<SavedWord, Long> {

    List<SavedWord> findByUserIdOrderBySavedAtDesc(Long userId);

    boolean existsByUserIdAndWordId(Long userId, Long wordId);

    int countByUserId(Long userId);

    void deleteByUserIdAndWordId(Long userId, Long wordId);
}
