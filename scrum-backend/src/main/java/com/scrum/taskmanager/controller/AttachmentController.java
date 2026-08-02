package com.scrum.taskmanager.controller;

import com.scrum.taskmanager.entity.Attachment;
import com.scrum.taskmanager.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private static final Logger logger = LoggerFactory.getLogger(AttachmentController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload/task/{taskId}")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable Long taskId) {
        try {
            Attachment attachment = fileStorageService.storeFile(file, taskId);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getAttachmentsByTask(@PathVariable Long taskId) {
        try {
            List<Attachment> attachments = fileStorageService.getAttachmentsByTask(taskId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
