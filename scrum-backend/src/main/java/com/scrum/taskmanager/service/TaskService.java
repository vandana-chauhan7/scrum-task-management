package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Task;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.entity.UserStory;
import com.scrum.taskmanager.repository.TaskRepository;
import com.scrum.taskmanager.repository.UserRepository;
import com.scrum.taskmanager.repository.UserStoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Task createTask(Long storyId, Task task) {
        UserStory story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("User Story not found: " + storyId));
        task.setUserStory(story);
        
        Task savedTask = taskRepository.save(task);

        if (savedTask.getAssignedTo() != null) {
            notificationService.createNotification(
                    savedTask.getAssignedTo(),
                    "You have been assigned the task: " + savedTask.getTitle()
            );
        }

        return savedTask;
    }

    public List<Task> getTasksByStory(Long storyId) {
        return taskRepository.findByUserStoryId(storyId);
    }

    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
    }

    public Task updateTask(Long id, Task details) {
        Task task = getTaskById(id);
        User oldAssignee = task.getAssignedTo();
        String oldStatus = task.getStatus();

        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());
        task.setPriority(details.getPriority());
        task.setDeadline(details.getDeadline());
        task.setStatus(details.getStatus());
        task.setLoggedHours(details.getLoggedHours());

        if (details.getAssignedTo() != null && details.getAssignedTo().getId() != null) {
            User assignee = userRepository.findById(details.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + details.getAssignedTo().getId()));
            task.setAssignedTo(assignee);

            // Notify if new assignee
            if (oldAssignee == null || !oldAssignee.getId().equals(assignee.getId())) {
                notificationService.createNotification(
                        assignee,
                        "You have been assigned the task: " + task.getTitle()
                );
            }
        } else {
            task.setAssignedTo(null);
        }

        Task updated = taskRepository.save(task);

        // Notify if status changed to DONE
        if (!"DONE".equalsIgnoreCase(oldStatus) && "DONE".equalsIgnoreCase(updated.getStatus())) {
            UserStory story = updated.getUserStory();
            if (story != null && story.getProject() != null) {
                notificationService.notifyProjectMembers(
                        story.getProject(),
                        "Task completed: " + updated.getTitle() + " under Story: " + story.getTitle()
                );
            }
        }

        return updated;
    }

    public Task logHours(Long taskId, Double hours) {
        Task task = getTaskById(taskId);
        task.setLoggedHours(task.getLoggedHours() + hours);
        return taskRepository.save(task);
    }

    public Task updateStatus(Long taskId, String status) {
        Task task = getTaskById(taskId);
        String oldStatus = task.getStatus();
        task.setStatus(status);
        Task updated = taskRepository.save(task);

        // Notify if status changed to DONE
        if (!"DONE".equalsIgnoreCase(oldStatus) && "DONE".equalsIgnoreCase(status)) {
            UserStory story = updated.getUserStory();
            if (story != null && story.getProject() != null) {
                notificationService.notifyProjectMembers(
                        story.getProject(),
                        "Task completed: " + updated.getTitle()
                );
            }
        }

        return updated;
    }

    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
