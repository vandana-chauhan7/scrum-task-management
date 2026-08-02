package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Project;
import com.scrum.taskmanager.entity.Sprint;
import com.scrum.taskmanager.entity.UserStory;
import com.scrum.taskmanager.repository.ProjectRepository;
import com.scrum.taskmanager.repository.SprintRepository;
import com.scrum.taskmanager.repository.UserStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserStoryService {

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    public UserStory createUserStory(Long projectId, UserStory story) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        story.setProject(project);
        return userStoryRepository.save(story);
    }

    public List<UserStory> getStoriesByProject(Long projectId) {
        return userStoryRepository.findByProjectId(projectId);
    }

    public List<UserStory> getBacklogStories(Long projectId) {
        return userStoryRepository.findByProjectIdAndSprintIdIsNull(projectId);
    }

    public List<UserStory> getStoriesBySprint(Long sprintId) {
        return userStoryRepository.findBySprintId(sprintId);
    }

    public UserStory getUserStoryById(Long storyId) {
        return userStoryRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("User Story not found: " + storyId));
    }

    public UserStory updateStory(Long id, UserStory details) {
        UserStory story = getUserStoryById(id);
        story.setTitle(details.getTitle());
        story.setDescription(details.getDescription());
        story.setPriority(details.getPriority());
        story.setStoryPoints(details.getStoryPoints());
        story.setStatus(details.getStatus());

        if (details.getSprint() != null && details.getSprint().getId() != null) {
            Sprint sprint = sprintRepository.findById(details.getSprint().getId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found: " + details.getSprint().getId()));
            story.setSprint(sprint);
        } else {
            story.setSprint(null);
        }

        return userStoryRepository.save(story);
    }

    public UserStory moveStoryToSprint(Long storyId, Long sprintId) {
        UserStory story = getUserStoryById(storyId);
        if (sprintId == null) {
            story.setSprint(null);
        } else {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new RuntimeException("Sprint not found: " + sprintId));
            story.setSprint(sprint);
        }
        return userStoryRepository.save(story);
    }

    public void deleteStory(Long id) {
        UserStory story = getUserStoryById(id);
        userStoryRepository.delete(story);
    }
}
