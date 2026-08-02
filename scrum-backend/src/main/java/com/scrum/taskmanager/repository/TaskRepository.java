package com.scrum.taskmanager.repository;

import com.scrum.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserStoryId(Long storyId);
    List<Task> findByAssignedToId(Long userId);
}
