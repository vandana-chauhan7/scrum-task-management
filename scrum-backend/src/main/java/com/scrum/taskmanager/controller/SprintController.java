package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.Project;
import com.scrum.taskmanager.entity.Sprint;
import com.scrum.taskmanager.repository.ProjectRepository;
import com.scrum.taskmanager.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getSprintsByProject(@PathVariable Long projectId) {
        try {
            List<Sprint> sprints = sprintService.getSprintsByProject(projectId);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSprintById(@PathVariable Long id) {
        try {
            Sprint sprint = sprintService.getSprintById(id);
            return ResponseEntity.ok(sprint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER')")
    public ResponseEntity<?> createSprint(@RequestBody Map<String, Object> payload) {
        try {
            Long projectId = Long.valueOf(payload.get("projectId").toString());
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

            Sprint sprint = new Sprint();
            sprint.setProject(project);
            sprint.setName(payload.get("name").toString());
            sprint.setGoal(payload.get("goal").toString());
            sprint.setStartDate(java.time.LocalDate.parse(payload.get("startDate").toString()));
            sprint.setEndDate(java.time.LocalDate.parse(payload.get("endDate").toString()));
            sprint.setStatus(payload.getOrDefault("status", "PLANNED").toString());

            Sprint created = sprintService.createSprint(sprint);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER')")
    public ResponseEntity<?> updateSprint(@PathVariable Long id, @RequestBody Sprint details) {
        try {
            Sprint updated = sprintService.updateSprint(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER')")
    public ResponseEntity<?> closeSprint(@PathVariable Long id) {
        try {
            Sprint closed = sprintService.closeSprint(id);
            return ResponseEntity.ok(closed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
