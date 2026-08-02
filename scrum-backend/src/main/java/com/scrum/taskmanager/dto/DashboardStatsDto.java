package com.scrum.taskmanager.dto;

import java.util.List;

public class DashboardStatsDto {
    private long totalProjects;
    private long activeSprints;
    private long pendingTasks;
    private long completedTasks;
    private long totalTeamMembers;
    private double overallSprintProgress; // Percentage of tasks completed in active sprints
    private List<String> recentActivities;

    public DashboardStatsDto() {}

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getActiveSprints() {
        return activeSprints;
    }

    public void setActiveSprints(long activeSprints) {
        this.activeSprints = activeSprints;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getTotalTeamMembers() {
        return totalTeamMembers;
    }

    public void setTotalTeamMembers(long totalTeamMembers) {
        this.totalTeamMembers = totalTeamMembers;
    }

    public double getOverallSprintProgress() {
        return overallSprintProgress;
    }

    public void setOverallSprintProgress(double overallSprintProgress) {
        this.overallSprintProgress = overallSprintProgress;
    }

    public List<String> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<String> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
