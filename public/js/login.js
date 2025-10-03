// Login page JavaScript with jQuery

$(document).ready(function() {
    // Check if already logged in
    if (localStorage.getItem('authToken')) {
        window.location.href = '/dashboard.html';
        return;
    }

    // Toggle password visibility
    $('#toggle-password').on('click', function() {
        const passwordInput = $('#password');
        const icon = $(this).find('i');
        
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Form validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showAlert(message, type = 'danger') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        $('#alert-container').html(alertHtml);
        
        // Auto dismiss after 5 seconds
        setTimeout(function() {
            $('.alert').fadeOut('slow', function() {
                $(this).remove();
            });
        }, 5000);
    }

    // Handle form submission
    $('#login-form').on('submit', async function(e) {
        e.preventDefault();
        
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#remember-me').is(':checked');
        
        // Reset validation states
        $('.form-control').removeClass('is-invalid');
        
        // Validate email
        if (!validateEmail(email)) {
            $('#email').addClass('is-invalid');
            showAlert('Vui lòng nhập địa chỉ email hợp lệ', 'danger');
            return;
        }
        
        // Validate password
        if (password.length < 6) {
            $('#password').addClass('is-invalid');
            showAlert('Mật khẩu phải có ít nhất 6 ký tự', 'danger');
            return;
        }
        
        // Show loading state
        const $loginBtn = $('#login-btn');
        const $btnText = $loginBtn.find('.btn-text');
        const $spinner = $loginBtn.find('.spinner-border');
        
        $loginBtn.prop('disabled', true);
        $btnText.text('Đang đăng nhập...');
        $spinner.removeClass('d-none');
        
        try {
            // Make API call
            const response = await $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email, password })
            });
            
            if (response.success) {
                // Store token
                localStorage.setItem('authToken', response.data.token);
                
                // Store user info
                if (response.data.user) {
                    localStorage.setItem('userName', response.data.user.name || email);
                    localStorage.setItem('userEmail', response.data.user.email);
                }
                
                // Show success message
                showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                
                // Add smooth transition effect
                $('body').fadeOut(500, function() {
                    // Redirect to dashboard
                    window.location.href = '/dashboard.html';
                });
            } else {
                throw new Error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
            
            if (error.responseJSON) {
                errorMessage = error.responseJSON.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Check for specific error messages
            if (errorMessage.toLowerCase().includes('invalid credentials') || 
                errorMessage.toLowerCase().includes('không hợp lệ')) {
                errorMessage = 'Email hoặc mật khẩu không đúng';
            }
            
            showAlert(errorMessage, 'danger');
            
            // Shake animation for error
            $('.card').addClass('shake');
            setTimeout(function() {
                $('.card').removeClass('shake');
            }, 500);
        } finally {
            // Reset loading state
            $loginBtn.prop('disabled', false);
            $btnText.text('Đăng nhập');
            $spinner.addClass('d-none');
        }
    });

    // Handle forgot password
    $('#forgot-password').on('click', function(e) {
        e.preventDefault();
        showAlert('Tính năng đặt lại mật khẩu sẽ sớm được cập nhật', 'info');
    });

    // Add shake animation CSS
    if (!$('#shake-animation-style').length) {
        $('head').append(`
            <style id="shake-animation-style">
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .shake {
                    animation: shake 0.5s;
                }
            </style>
        `);
    }

    // Add smooth focus effects
    $('.form-control').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });

    // Remove invalid class on input
    $('.form-control').on('input', function() {
        $(this).removeClass('is-invalid');
    });

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        // ESC to clear form
        if (e.key === 'Escape') {
            $('#login-form')[0].reset();
            $('.form-control').removeClass('is-invalid');
        }
    });

    // Add entrance animations
    $('.card').hide().fadeIn(600);
    $('.login-branding').css('opacity', 0).animate({ opacity: 1 }, 800);
});
