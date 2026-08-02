package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.UserStory;
import com.scrum.taskmanager.service.UserStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
public class UserStoryController {

    @Autowired
    private UserStoryService userStoryService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getStoriesByProject(@PathVariable Long projectId) {
        try {
            List<UserStory> stories = userStoryService.getStoriesByProject(projectId);
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}/backlog")
    public ResponseEntity<?> getBacklogStories(@PathVariable Long projectId) {
        try {
            List<UserStory> stories = userStoryService.getBacklogStories(projectId);
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<?> getStoriesBySprint(@PathVariable Long sprintId) {
        try {
            List<UserStory> stories = userStoryService.getStoriesBySprint(sprintId);
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStoryById(@PathVariable Long id) {
        try {
            UserStory story = userStoryService.getUserStoryById(id);
            return ResponseEntity.ok(story);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRODUCT_OWNER', 'SCRUM_MASTER')")
    public ResponseEntity<?> createUserStory(@PathVariable Long projectId, @RequestBody UserStory story) {
        try {
            UserStory created = userStoryService.createUserStory(projectId, story);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRODUCT_OWNER', 'SCRUM_MASTER')")
    public ResponseEntity<?> updateStory(@PathVariable Long id, @RequestBody UserStory details) {
        try {
            UserStory updated = userStoryService.updateStory(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/move")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER')")
    public ResponseEntity<?> moveStory(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long sprintId = payload.get("sprintId") != null ? Long.valueOf(payload.get("sprintId").toString()) : null;
            UserStory moved = userStoryService.moveStoryToSprint(id, sprintId);
            return ResponseEntity.ok(moved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRODUCT_OWNER')")
    public ResponseEntity<?> deleteStory(@PathVariable Long id) {
        try {
            userStoryService.deleteStory(id);
            return ResponseEntity.ok(Map.of("message", "User story deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
