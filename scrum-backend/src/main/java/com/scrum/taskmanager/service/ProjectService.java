package com.scrum.taskmanager.service;

import com.scrum.taskmanager.entity.Project;
import com.scrum.taskmanager.entity.User;
import com.scrum.taskmanager.repository.ProjectRepository;
import com.scrum.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsForUser(Long userId) {
        // Admins can see all projects; other roles can see projects they belong to.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        if ("ROLE_ADMIN".equals(user.getRole().getName())) {
            return projectRepository.findAll();
        }
        return projectRepository.findProjectsByMemberId(userId);
    }

    public Project getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
    }

    public Project updateProject(Long id, Project details) {
        Project project = getProjectById(id);
        project.setName(details.getName());
        project.setDescription(details.getDescription());
        project.setStartDate(details.getStartDate());
        project.setEndDate(details.getEndDate());
        project.setStatus(details.getStatus());
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }

    public Project archiveProject(Long id) {
        Project project = getProjectById(id);
        project.setStatus("ARCHIVED");
        return projectRepository.save(project);
    }

    public Project addMember(Long projectId, Long userId) {
        Project project = getProjectById(projectId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        project.getMembers().add(user);
        return projectRepository.save(project);
    }

    public Project removeMember(Long projectId, Long userId) {
        Project project = getProjectById(projectId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        project.getMembers().remove(user);
        return projectRepository.save(project);
    }
}
