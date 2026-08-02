package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.Notification;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.UserRepository;
import com.scrum.taskmanager.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/developers")
    public ResponseEntity<List<User>> getDevelopers() {
        // Find users with role DEVELOPER (or other team roles who can be assigned tasks)
        List<User> developers = userRepository.findAll().stream()
                .filter(u -> "ROLE_DEVELOPER".equalsIgnoreCase(u.getRole().getName()) 
                          || "ROLE_SCRUM_MASTER".equalsIgnoreCase(u.getRole().getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(developers);
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<Notification> notifications = notificationService.getNotificationsForUser(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<?> getUnreadNotifications(Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<Notification> notifications = notificationService.getUnreadNotifications(user.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id) {
        try {
            Notification readNotification = notificationService.markAsRead(id);
            return ResponseEntity.ok(readNotification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
