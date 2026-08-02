package com.scrum.taskmanager.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String roleName; // ROLE_ADMIN, ROLE_SCRUM_MASTER, ROLE_PRODUCT_OWNER, ROLE_DEVELOPER

    public RegisterRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
