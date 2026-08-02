package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<?> getSprintReport(@PathVariable Long sprintId) {
        try {
            Map<String, Object> report = reportService.generateSprintReport(sprintId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectReport(@PathVariable Long projectId) {
        try {
            Map<String, Object> report = reportService.generateProjectReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/developer/{developerId}")
    public ResponseEntity<?> getDeveloperReport(@PathVariable Long developerId) {
        try {
            Map<String, Object> report = reportService.generateDeveloperReport(developerId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/task-completion/{projectId}")
    public ResponseEntity<?> getTaskCompletionReport(@PathVariable Long projectId) {
        try {
            Map<String, Object> report = reportService.generateTaskCompletionReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
