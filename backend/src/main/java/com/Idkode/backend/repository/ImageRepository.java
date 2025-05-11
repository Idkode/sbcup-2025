package com.Idkode.backend.repository;

import com.Idkode.backend.entity.Image;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImageRepository extends MongoRepository<Image, String>{

    @Query(value = "{ $and: [ " +
            " { 'camera': ?0 }, " +
            " { $expr: { $eq: [ { $dateToString: { format: '%Y-%m-%d', date: '$datetime' } }, ?1 ] } } " +
            "] }")
    List<Image> filterByCameraAndDate(
            String camera, String localDate);

    @Query(value = "{ 'camera': ?0 }")
    List<Image> findTopByCameraOrderByDatetimeDesc(String camera, Sort sort);

    List<Image> findByCameraAndDatetime(String camera, LocalDateTime datetime);
}
