package com.upme.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    private String email;           // 구글 이메일 (선택)
    
    private String phoneNumber;     // 핸드폰 번호 (선택)
    
    @NotBlank(message = "이름을 입력해주세요")
    private String name;
    
    @NotBlank(message = "비밀번호를 입력해주세요")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;
    
    // 이메일 또는 전화번호 중 하나는 필수
    public boolean hasValidIdentifier() {
        return (email != null && !email.isBlank()) || 
               (phoneNumber != null && !phoneNumber.isBlank());
    }
}
