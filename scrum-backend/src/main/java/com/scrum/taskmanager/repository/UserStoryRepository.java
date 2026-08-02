package com.scrum.taskmanager.repository;

import com.scrum.taskmanager.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    List<UserStory> findByProjectId(Long projectId);
    List<UserStory> findBySprintId(Long sprintId);
    List<UserStory> findByProjectIdAndSprintIdIsNull(Long projectId); // For backlog items
}
