package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Notification;
import com.scrum.taskmanager.entity.Project;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setStatus("UNREAD");
        notification.setTimestamp(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByTimestampDesc(userId, "UNREAD");
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notification.setStatus("READ");
        return notificationRepository.save(notification);
    }

    public void notifyProjectMembers(Project project, String message) {
        if (project == null || project.getMembers() == null) return;
        for (User user : project.getMembers()) {
            createNotification(user, message);
        }
    }
}
