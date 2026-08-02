package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.Project;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.UserRepository;
import com.scrum.taskmanager.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getProjects(Principal principal) {
        try {
            String email = principal.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<Project> projects = projectService.getProjectsForUser(user.getId());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectService.getProjectById(id);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER')")
    public ResponseEntity<?> createProject(@RequestBody Project project, Principal principal) {
        try {
            // By default, add creator to the project members
            String email = principal.getName();
            User creator = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            project.getMembers().add(creator);

            Project created = projectService.createProject(project);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER')")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project details) {
        try {
            Project updated = projectService.updateProject(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER')")
    public ResponseEntity<?> archiveProject(@PathVariable Long id) {
        try {
            Project archived = projectService.archiveProject(id);
            return ResponseEntity.ok(archived);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER')")
    public ResponseEntity<?> addMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            Project project = projectService.addMember(id, userId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCRUM_MASTER')")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            Project project = projectService.removeMember(id, userId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
