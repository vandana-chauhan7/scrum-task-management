package com.scrum.taskmanager.service;

import com.scrum.taskmanager.dto.DashboardStatsDto;
import com.scrum.taskmanager.entity.*;
import com.scrum.taskmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

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

    @Autowired
    private NotificationRepository notificationRepository;

    public DashboardStatsDto getDashboardStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole().getName());

        List<Project> userProjects;
        if (isAdmin) {
            userProjects = projectRepository.findAll();
        } else {
            userProjects = projectRepository.findProjectsByMemberId(userId);
        }

        long totalProjects = userProjects.size();
        long activeSprintsCount = 0;
        long pendingTasksCount = 0;
        long completedTasksCount = 0;

        List<Sprint> activeSprints = new ArrayList<>();
        Set<Long> projectIds = userProjects.stream().map(Project::getId).collect(Collectors.toSet());

        // Get active sprints
        for (Project p : userProjects) {
            List<Sprint> projectSprints = sprintRepository.findByProjectId(p.getId());
            for (Sprint s : projectSprints) {
                if ("ACTIVE".equalsIgnoreCase(s.getStatus())) {
                    activeSprints.add(s);
                    activeSprintsCount++;
                }
            }
        }

        // Count tasks
        List<Task> userAssignedTasks = taskRepository.findByAssignedToId(userId);
        if (isAdmin) {
            // Admin sees all tasks in the system
            List<Task> allTasks = taskRepository.findAll();
            for (Task t : allTasks) {
                if ("DONE".equalsIgnoreCase(t.getStatus())) {
                    completedTasksCount++;
                } else {
                    pendingTasksCount++;
                }
            }
        } else {
            // Other roles see tasks assigned to them, or tasks within their projects
            for (Task t : taskRepository.findAll()) {
                UserStory story = t.getUserStory();
                if (story != null && story.getProject() != null && projectIds.contains(story.getProject().getId())) {
                    if ("DONE".equalsIgnoreCase(t.getStatus())) {
                        completedTasksCount++;
                    } else {
                        pendingTasksCount++;
                    }
                }
            }
        }

        // Calculate active sprint progress (percentage of done tasks in active sprints)
        double sprintProgress = 0.0;
        int activeSprintTasksTotal = 0;
        int activeSprintTasksDone = 0;

        for (Sprint s : activeSprints) {
            List<UserStory> stories = userStoryRepository.findBySprintId(s.getId());
            for (UserStory story : stories) {
                List<Task> tasks = taskRepository.findByUserStoryId(story.getId());
                for (Task t : tasks) {
                    activeSprintTasksTotal++;
                    if ("DONE".equalsIgnoreCase(t.getStatus())) {
                        activeSprintTasksDone++;
                    }
                }
            }
        }

        if (activeSprintTasksTotal > 0) {
            sprintProgress = ((double) activeSprintTasksDone / activeSprintTasksTotal) * 100.0;
        }

        // Get total team members
        long totalTeamMembers = userRepository.count();

        // Get recent activities (last 5 notifications or actions)
        List<Notification> recentNotifications = notificationRepository.findByUserIdOrderByTimestampDesc(userId);
        List<String> activities = new ArrayList<>();
        int limit = Math.min(recentNotifications.size(), 5);
        for (int i = 0; i < limit; i++) {
            activities.add(recentNotifications.get(i).getMessage());
        }
        
        // Add a fallback activity if empty
        if (activities.isEmpty()) {
            activities.add("System initialized. Welcome to Scrum Task Manager.");
        }

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalProjects(totalProjects);
        stats.setActiveSprints(activeSprintsCount);
        stats.setPendingTasks(pendingTasksCount);
        stats.setCompletedTasks(completedTasksCount);
        stats.setTotalTeamMembers(totalTeamMembers);
        stats.setOverallSprintProgress(Math.round(sprintProgress * 100.0) / 100.0);
        stats.setRecentActivities(activities);

        return stats;
    }
}
