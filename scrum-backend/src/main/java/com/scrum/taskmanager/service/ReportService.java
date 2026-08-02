package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.*;
import com.scrum.taskmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> generateSprintReport(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + sprintId));

        List<UserStory> stories = userStoryRepository.findBySprintId(sprintId);
        int totalStories = stories.size();
        int completedStories = 0;
        int totalStoryPoints = 0;
        int completedStoryPoints = 0;

        List<Map<String, Object>> storiesSummary = new ArrayList<>();
        List<Map<String, Object>> tasksSummary = new ArrayList<>();

        for (UserStory story : stories) {
            totalStoryPoints += story.getStoryPoints();
            if ("DONE".equalsIgnoreCase(story.getStatus())) {
                completedStories++;
                completedStoryPoints += story.getStoryPoints();
            }

            Map<String, Object> sm = new HashMap<>();
            sm.put("id", story.getId());
            sm.put("title", story.getTitle());
            sm.put("storyPoints", story.getStoryPoints());
            sm.put("status", story.getStatus());
            storiesSummary.add(sm);

            // Fetch tasks under story
            List<Task> tasks = taskRepository.findByUserStoryId(story.getId());
            for (Task t : tasks) {
                Map<String, Object> tm = new HashMap<>();
                tm.put("id", t.getId());
                tm.put("title", t.getTitle());
                tm.put("status", t.getStatus());
                tm.put("assignee", t.getAssignedTo() != null ? t.getAssignedTo().getName() : "Unassigned");
                tm.put("loggedHours", t.getLoggedHours());
                tasksSummary.add(tm);
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("sprintName", sprint.getName());
        report.put("sprintGoal", sprint.getGoal());
        report.put("startDate", sprint.getStartDate());
        report.put("endDate", sprint.getEndDate());
        report.put("status", sprint.getStatus());
        report.put("totalStories", totalStories);
        report.put("completedStories", completedStories);
        report.put("totalStoryPoints", totalStoryPoints);
        report.put("completedStoryPoints", completedStoryPoints);
        report.put("stories", storiesSummary);
        report.put("tasks", tasksSummary);

        return report;
    }

    public Map<String, Object> generateProjectReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        List<UserStory> stories = userStoryRepository.findByProjectId(projectId);

        long activeSprintsCount = sprints.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus())).count();
        long closedSprintsCount = sprints.stream().filter(s -> "CLOSED".equalsIgnoreCase(s.getStatus())).count();

        int totalStories = stories.size();
        int completedStories = 0;
        int backlogStories = 0;

        for (UserStory story : stories) {
            if ("DONE".equalsIgnoreCase(story.getStatus())) {
                completedStories++;
            }
            if (story.getSprint() == null) {
                backlogStories++;
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("projectName", project.getName());
        report.put("description", project.getDescription());
        report.put("startDate", project.getStartDate());
        report.put("endDate", project.getEndDate());
        report.put("status", project.getStatus());
        report.put("totalSprints", sprints.size());
        report.put("activeSprints", activeSprintsCount);
        report.put("closedSprints", closedSprintsCount);
        report.put("totalStories", totalStories);
        report.put("completedStories", completedStories);
        report.put("backlogStories", backlogStories);
        report.put("teamMembersCount", project.getMembers().size());

        List<Map<String, String>> membersList = new ArrayList<>();
        for (User m : project.getMembers()) {
            Map<String, String> mm = new HashMap<>();
            mm.put("name", m.getName());
            mm.put("email", m.getEmail());
            mm.put("role", m.getRole().getName());
            membersList.add(mm);
        }
        report.put("members", membersList);

        return report;
    }

    public Map<String, Object> generateDeveloperReport(Long developerId) {
        User developer = userRepository.findById(developerId)
                .orElseThrow(() -> new RuntimeException("Developer not found: " + developerId));

        List<Task> tasks = taskRepository.findByAssignedToId(developerId);
        int totalTasks = tasks.size();
        int completedTasks = 0;
        double totalLoggedHours = 0.0;

        Map<String, Integer> statusCount = new HashMap<>();
        statusCount.put("TO_DO", 0);
        statusCount.put("IN_PROGRESS", 0);
        statusCount.put("TESTING", 0);
        statusCount.put("DONE", 0);

        List<Map<String, Object>> tasksDetail = new ArrayList<>();

        for (Task t : tasks) {
            totalLoggedHours += t.getLoggedHours();
            String status = t.getStatus().toUpperCase();
            statusCount.put(status, statusCount.getOrDefault(status, 0) + 1);

            if ("DONE".equalsIgnoreCase(status)) {
                completedTasks++;
            }

            Map<String, Object> td = new HashMap<>();
            td.put("taskId", t.getId());
            td.put("title", t.getTitle());
            td.put("status", t.getStatus());
            td.put("priority", t.getPriority());
            td.put("loggedHours", t.getLoggedHours());
            td.put("deadline", t.getDeadline());
            td.put("storyTitle", t.getUserStory().getTitle());
            tasksDetail.add(td);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("developerName", developer.getName());
        report.put("email", developer.getEmail());
        report.put("role", developer.getRole().getName());
        report.put("status", developer.getStatus());
        report.put("totalTasks", totalTasks);
        report.put("completedTasks", completedTasks);
        report.put("totalLoggedHours", totalLoggedHours);
        report.put("statusBreakdown", statusCount);
        report.put("tasks", tasksDetail);

        return report;
    }

    public Map<String, Object> generateTaskCompletionReport(Long projectId) {
        List<UserStory> stories = userStoryRepository.findByProjectId(projectId);
        List<Map<String, Object>> tasksSummary = new ArrayList<>();

        int totalTasks = 0;
        int completedTasks = 0;
        int inProgressTasks = 0;
        int testingTasks = 0;
        int toDoTasks = 0;
        int overdueTasks = 0;

        for (UserStory story : stories) {
            List<Task> tasks = taskRepository.findByUserStoryId(story.getId());
            for (Task t : tasks) {
                totalTasks++;
                switch (t.getStatus().toUpperCase()) {
                    case "DONE" -> completedTasks++;
                    case "IN_PROGRESS" -> inProgressTasks++;
                    case "TESTING", "REVIEW" -> testingTasks++;
                    default -> toDoTasks++;
                }

                // Check overdue status
                boolean isOverdue = false;
                if (t.getDeadline() != null && !"DONE".equalsIgnoreCase(t.getStatus()) && t.getDeadline().isBefore(LocalDate.now())) {
                    overdueTasks++;
                    isOverdue = true;
                }

                Map<String, Object> tm = new HashMap<>();
                tm.put("id", t.getId());
                tm.put("title", t.getTitle());
                tm.put("status", t.getStatus());
                tm.put("priority", t.getPriority());
                tm.put("deadline", t.getDeadline());
                tm.put("isOverdue", isOverdue);
                tm.put("assignee", t.getAssignedTo() != null ? t.getAssignedTo().getName() : "Unassigned");
                tasksSummary.add(tm);
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalTasks", totalTasks);
        report.put("completedTasks", completedTasks);
        report.put("inProgressTasks", inProgressTasks);
        report.put("testingTasks", testingTasks);
        report.put("toDoTasks", toDoTasks);
        report.put("overdueTasks", overdueTasks);
        report.put("tasks", tasksSummary);

        return report;
    }
}
