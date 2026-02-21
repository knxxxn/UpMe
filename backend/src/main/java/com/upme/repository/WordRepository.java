package com.upme.repository;

import com.upme.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    @Query(value = "SELECT * FROM words ORDER BY RAND(:seed) LIMIT :count", nativeQuery = true)
    List<Word> findRandomWords(@Param("seed") int seed, @Param("count") int count);
}
