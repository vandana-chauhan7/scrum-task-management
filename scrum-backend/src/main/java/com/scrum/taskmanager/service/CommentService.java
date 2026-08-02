package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Comment;
import com.scrum.taskmanager.entity.Task;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.CommentRepository;
import com.scrum.taskmanager.repository.TaskRepository;
import com.scrum.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Long taskId, Long userId, String message) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setMessage(message);
        comment.setTimestamp(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByTimestampAsc(taskId);
    }
}
