package com.scrum.taskmanager.config;

import com.scrum.taskmanager.entity.*;
import com.scrum.taskmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserStoryRepository userStoryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        Role adminRole = getOrCreateRole("ROLE_ADMIN");
        Role smRole = getOrCreateRole("ROLE_SCRUM_MASTER");
        Role poRole = getOrCreateRole("ROLE_PRODUCT_OWNER");
        Role devRole = getOrCreateRole("ROLE_DEVELOPER");

        // 2. Seed Users
        User adminUser = getOrCreateUser("System Admin", "admin@scrum.com", "admin123", adminRole);
        User scrumMaster = getOrCreateUser("Sarah Master", "sm@scrum.com", "sm123", smRole);
        User productOwner = getOrCreateUser("Peter Owner", "po@scrum.com", "po123", poRole);
        User developer1 = getOrCreateUser("David Developer", "dev1@scrum.com", "dev123", devRole);
        User developer2 = getOrCreateUser("Diana Developer", "dev2@scrum.com", "dev123", devRole);

        // 3. Seed Sample Project if none exist
        if (projectRepository.count() == 0) {
            Project project = new Project();
            project.setName("Agile Core Platform");
            project.setDescription("Building the core full-stack platform for project and task tracking.");
            project.setStartDate(LocalDate.now().minusDays(15));
            project.setEndDate(LocalDate.now().plusMonths(3));
            project.setStatus("ACTIVE");

            Set<User> members = new HashSet<>();
            members.add(adminUser);
            members.add(scrumMaster);
            members.add(productOwner);
            members.add(developer1);
            members.add(developer2);
            project.setMembers(members);

            project = projectRepository.save(project);

            // 4. Seed Sprints
            // Active Sprint
            Sprint sprint1 = new Sprint();
            sprint1.setProject(project);
            sprint1.setName("Sprint 1: Auth & UI Design");
            sprint1.setGoal("Complete JWT token authorization and code the responsive Kanban interface.");
            sprint1.setStartDate(LocalDate.now().minusDays(10));
            sprint1.setEndDate(LocalDate.now().plusDays(4));
            sprint1.setStatus("ACTIVE");
            sprint1 = sprintRepository.save(sprint1);

            // Upcoming Sprint
            Sprint sprint2 = new Sprint();
            sprint2.setProject(project);
            sprint2.setName("Sprint 2: Analytics & File Upload");
            sprint2.setGoal("Develop chart analytics dashboards and enable document uploading.");
            sprint2.setStartDate(LocalDate.now().plusDays(5));
            sprint2.setEndDate(LocalDate.now().plusDays(19));
            sprint2.setStatus("PLANNED");
            sprint2 = sprintRepository.save(sprint2);

            // 5. Seed User Stories
            UserStory story1 = new UserStory();
            story1.setProject(project);
            story1.setSprint(sprint1);
            story1.setTitle("User Authentication and Role Authorization");
            story1.setDescription("As a user, I want to securely log in so I can see my personalized Scrum dashboard.");
            story1.setPriority("HIGH");
            story1.setStoryPoints(5);
            story1.setStatus("IN_PROGRESS");
            story1 = userStoryRepository.save(story1);

            UserStory story2 = new UserStory();
            story2.setProject(project);
            story2.setSprint(sprint1);
            story2.setTitle("Responsive Kanban Board UI Component");
            story2.setDescription("As a developer, I want a drag-and-drop Kanban interface to easily track subtasks.");
            story2.setPriority("HIGH");
            story2.setStoryPoints(8);
            story2.setStatus("TO_DO");
            story2 = userStoryRepository.save(story2);

            UserStory story3 = new UserStory();
            story3.setProject(project);
            story3.setSprint(null); // Stays in Product Backlog
            story3.setTitle("Analytics Charts and PDF Export");
            story3.setDescription("As a Product Owner, I want sprint velocity metrics and downloadable PDF reports.");
            story3.setPriority("MEDIUM");
            story3.setStoryPoints(5);
            story3.setStatus("BACKLOG");
            story3 = userStoryRepository.save(story3);

            // 6. Seed Subtasks
            // For story 1
            Task task1 = new Task();
            task1.setUserStory(story1);
            task1.setAssignedTo(developer1);
            task1.setTitle("Configure Security Filters and JWT Extraction");
            task1.setDescription("Set up security filter chains, custom once-per-request JWT filters and BCrypt encoder.");
            task1.setPriority("HIGH");
            task1.setDeadline(LocalDate.now().minusDays(2));
            task1.setStatus("DONE");
            task1.setLoggedHours(12.0);
            taskRepository.save(task1);

            Task task2 = new Task();
            task2.setUserStory(story1);
            task2.setAssignedTo(developer2);
            task2.setTitle("Build Registration and Login Components");
            task2.setDescription("Create login layout in frontend and handle JWT local storage token injection.");
            task2.setPriority("HIGH");
            task2.setDeadline(LocalDate.now().plusDays(1));
            task2.setStatus("IN_PROGRESS");
            task2.setLoggedHours(8.5);
            taskRepository.save(task2);

            // For story 2
            Task task3 = new Task();
            task3.setUserStory(story2);
            task3.setAssignedTo(developer1);
            task3.setTitle("Implement Drag and Drop State Handlers");
            task3.setDescription("Add drag start/end states in React and connect them with instantly updating backend APIs.");
            task3.setPriority("MEDIUM");
            task3.setDeadline(LocalDate.now().plusDays(3));
            task3.setStatus("TO_DO");
            task3.setLoggedHours(0.0);
            taskRepository.save(task3);

            Task task4 = new Task();
            task4.setUserStory(story2);
            task4.setAssignedTo(developer2);
            task4.setTitle("Design Column Layouts");
            task4.setDescription("Design glassmorphism style card panels for To-Do, In-Progress, Testing, and Done columns.");
            task4.setPriority("LOW");
            task4.setDeadline(LocalDate.now().plusDays(2));
            task4.setStatus("TESTING");
            task4.setLoggedHours(6.0);
            taskRepository.save(task4);
        }
    }

    private Role getOrCreateRole(String roleName) {
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isPresent()) {
            return roleOpt.get();
        }
        Role role = new Role(roleName);
        return roleRepository.save(role);
    }

    private User getOrCreateUser(String name, String email, String password, Role role) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get();
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus("ACTIVE");
        return userRepository.save(user);
    }
}
