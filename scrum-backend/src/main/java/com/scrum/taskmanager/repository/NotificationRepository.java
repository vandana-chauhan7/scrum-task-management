package com.scrum.taskmanager.repository;

import com.scrum.taskmanager.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);
    List<Notification> findByUserIdAndStatusOrderByTimestampDesc(Long userId, String status);
}
