package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.Comment;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.UserRepository;
import com.scrum.taskmanager.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getCommentsByTask(@PathVariable Long taskId) {
        try {
            List<Comment> comments = commentService.getCommentsByTask(taskId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/task/{taskId}")
    public ResponseEntity<?> addComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String message = payload.get("message");
            Comment comment = commentService.addComment(taskId, user.getId(), message);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
