// Register page JavaScript with jQuery

// Turnstile callback
window.onTurnstileSuccess = function (token) {
  console.log('Turnstile verification successful');
};

$(document).ready(function () {
  const redirectUrl = AppSDK.getQueryParam("redirect");
  console.log("🚀 QuyNH: redirect", redirectUrl)

  // Check if already logged in and redirect
  if (localStorage.getItem('authToken')) {
    window.location.href = `/app/dashboard?redirect=${redirectUrl ? encodeURIComponent(redirectUrl) : ''}`;
    return;
  }

  // Toggle password visibility
  $('#toggle-password').on('click', function () {
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

  // Toggle confirm password visibility
  $('#toggle-confirm-password').on('click', function () {
    const passwordInput = $('#confirm-password');
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
    setTimeout(function () {
      $('.alert').fadeOut('slow', function () {
        $(this).remove();
      });
    }, 5000);
  }

  // Handle form submission
  $('#register-form').on('submit', async function (e) {
    e.preventDefault();

    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();
    const confirmPassword = $('#confirm-password').val();
    const termsAccepted = $('#terms').is(':checked');

    // Reset validation states
    $('.form-control').removeClass('is-invalid');

    // Validate name
    if (name.length < 2) {
      $('#name').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự)'
      });
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      $('#email').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Vui lòng nhập địa chỉ email hợp lệ'
      });
      return;
    }

    // Validate password
    if (password.length < 6) {
      $('#password').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      $('#confirm-password').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Mật khẩu xác nhận không khớp'
      });
      return;
    }

    // Validate terms
    if (!termsAccepted) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Vui lòng đồng ý với điều khoản dịch vụ'
      });
      return;
    }

    // Get Turnstile token
    const turnstileToken = window.turnstile?.getResponse();
    if (!turnstileToken) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Vui lòng xác thực bạn không phải là robot!',
      });
      return;
    }

    // Show loading state
    const $registerBtn = $('#register-btn');
    const $btnText = $registerBtn.find('.btn-text');
    const $spinner = $registerBtn.find('.spinner-border');

    $registerBtn.prop('disabled', true);
    $btnText.text('Đang đăng ký...');
    $spinner.removeClass('d-none');

    try {
      // Make API call
      const response = await $.ajax({
        url: '/api/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          name,
          email,
          password,
          language: 'vi',
          currency: 'VND',
          turnstileToken
        })
      });

      if (response.success) {
        // Store token
        cookieStore.set('authToken', response.data.token); // For cookies
        localStorage.setItem('authToken', response.data.token); // For localStorage

        // Store user info
        if (response.data.user) {
          localStorage.setItem('userName', response.data.user.name || name);
          localStorage.setItem('userEmail', response.data.user.email);
        }

        // Show success message
        AppSDK.Alert.show({
          icon: AppSDK.Enums.AlertIcon.SUCCESS,
          title: "Thành công",
          text: 'Đăng ký thành công! Chuyển hướng đến trang tổng quan...',
        });

        // Add smooth transition effect
        $('body').fadeOut(500, function () {
          // Redirect to dashboard
          window.location.href = '/app/dashboard';
        });
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);

      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

      if (error.responseJSON) {
        errorMessage = error.responseJSON.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('đã tồn tại')) {
        errorMessage = 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.';
      }

      showAlert(errorMessage, 'danger');

      // Reset Turnstile
      if (window.turnstile) {
        window.turnstile.reset();
      }

      // Shake animation for error
      $('.card').addClass('shake');
      setTimeout(function () {
        $('.card').removeClass('shake');
      }, 500);
    } finally {
      // Reset loading state
      $registerBtn.prop('disabled', false);
      $btnText.text('Đăng ký');
      $spinner.addClass('d-none');
    }
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
  $('.form-control').on('focus', function () {
    $(this).parent().addClass('focused');
  }).on('blur', function () {
    $(this).parent().removeClass('focused');
  });

  // Remove invalid class on input
  $('.form-control').on('input', function () {
    $(this).removeClass('is-invalid');
  });

  // Real-time password match validation
  $('#confirm-password').on('input', function () {
    const password = $('#password').val();
    const confirmPassword = $(this).val();

    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid').addClass('is-valid');
      }
    }
  });

  // Password strength indicator
  $('#password').on('input', function () {
    const password = $(this).val();
    const $input = $(this);

    if (password.length >= 6) {
      $input.removeClass('is-invalid').addClass('is-valid');
    } else if (password.length > 0) {
      $input.addClass('is-invalid');
    }
  });

  // Keyboard shortcuts
  $(document).on('keydown', function (e) {
    // ESC to clear form
    if (e.key === 'Escape') {
      $('#register-form')[0].reset();
      $('.form-control').removeClass('is-invalid is-valid');
    }
  });

  // Add entrance animations
  $('.card').hide().fadeIn(600);
  $('.login-branding').css('opacity', 0).animate({ opacity: 1 }, 800);
});
