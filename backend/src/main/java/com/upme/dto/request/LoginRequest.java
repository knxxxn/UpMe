package com.upme.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "이메일 또는 전화번호를 입력해주세요")
    private String identifier; // 이메일 또는 전화번호
    
    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;
}
