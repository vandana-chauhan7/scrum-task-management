package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Sprint;
import com.scrum.taskmanager.entity.UserStory;
import com.scrum.taskmanager.repository.SprintRepository;
import com.scrum.taskmanager.repository.UserStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private NotificationService notificationService;

    public Sprint createSprint(Sprint sprint) {
        Sprint saved = sprintRepository.save(sprint);
        // Notify team if active
        if ("ACTIVE".equalsIgnoreCase(saved.getStatus())) {
            notificationService.notifyProjectMembers(
                    saved.getProject(), 
                    "New active sprint started: " + saved.getName()
            );
        }
        return saved;
    }

    public List<Sprint> getSprintsByProject(Long projectId) {
        return sprintRepository.findByProjectId(projectId);
    }

    public Sprint getSprintById(Long sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + sprintId));
    }

    public Sprint updateSprint(Long id, Sprint details) {
        Sprint sprint = getSprintById(id);
        String oldStatus = sprint.getStatus();
        
        sprint.setName(details.getName());
        sprint.setGoal(details.getGoal());
        sprint.setStartDate(details.getStartDate());
        sprint.setEndDate(details.getEndDate());
        sprint.setStatus(details.getStatus());

        Sprint updated = sprintRepository.save(sprint);

        // Check if sprint just got started
        if (!"ACTIVE".equalsIgnoreCase(oldStatus) && "ACTIVE".equalsIgnoreCase(updated.getStatus())) {
            notificationService.notifyProjectMembers(
                    updated.getProject(),
                    "Sprint started: " + updated.getName()
            );
        }
        
        return updated;
    }

    public Sprint closeSprint(Long id) {
        Sprint sprint = getSprintById(id);
        sprint.setStatus("CLOSED");

        // Real-world Scrum rule: Move incomplete user stories back to the backlog
        List<UserStory> stories = userStoryRepository.findBySprintId(id);
        int movedCount = 0;
        for (UserStory story : stories) {
            if (!"DONE".equalsIgnoreCase(story.getStatus())) {
                story.setSprint(null);
                userStoryRepository.save(story);
                movedCount++;
            }
        }

        Sprint closedSprint = sprintRepository.save(sprint);
        notificationService.notifyProjectMembers(
                closedSprint.getProject(),
                "Sprint completed: " + closedSprint.getName() + 
                (movedCount > 0 ? ". (" + movedCount + " incomplete stories returned to Backlog)" : "")
        );

        return closedSprint;
    }
}
