// Login page JavaScript with jQuery

// Turnstile callback
window.onTurnstileSuccess = function (token) {
  console.log('Turnstile verification successful');
};

$(document).ready(function () {
  const redirectUrl = AppSDK.getQueryParam("redirect");
  console.log("🚀 QuyNH: redirect", redirectUrl)

  // If already logged in, redirect to dashboard
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

  /**
   * Hàm lấy giá trị của một tham số trong URL query string theo tên.
   *
   * Ví dụ:
   * Nếu URL hiện tại là:
   *    https://example.com/?user=john&age=25
   * Gọi hàm:
   *    getQueryParam("user")  // → "john"
   *    getQueryParam("age")   // → "25"
   *    getQueryParam("city")  // → null (không tồn tại)
   *
   * @param {string} name - Tên của tham số cần lấy trong query string.
   * @returns {string|null} - Giá trị của tham số nếu tồn tại, hoặc `null` nếu không tìm thấy.
   */
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(name);
    return value ? decodeURIComponent(value) : null;
  }

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
  $('#login-form').on('submit', async function (e) {
    e.preventDefault();

    const email = $('#email').val()?.trim();
    const password = $('#password').val();
    const redirectUrl = $('#redirectUrl').val()?.trim();
    const rememberMe = $('#remember-me').is(':checked');

    // Reset validation states
    $('.form-control').removeClass('is-invalid');

    // Validate email
    if (!validateEmail(email)) {
      $('#email').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Vui lòng nhập email hợp lệ!',
      });
      return;
    }

    // Validate password
    if (password.length < 6) {
      $('#password').addClass('is-invalid');
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Mật khẩu phải có ít nhất 6 ký tự!',
      })
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
        data: JSON.stringify({
          email, password, turnstileToken, rememberMe,
          redirectUrl: redirectUrl,
        })
      });

      if (response.success) {
        // Store token
        cookieStore.set('authToken', response.data.token); // For cookies
        localStorage.setItem('authToken', response.data.token); // For localStorage

        // Remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Store user info
        if (response.data.user) {
          localStorage.setItem('userName', response.data.user.name || email);
          localStorage.setItem('userEmail', response.data.user.email);
        }

        // Show success message
        AppSDK.Alert.show({
          icon: AppSDK.Enums.AlertIcon.SUCCESS,
          title: "Thành công",
          text: 'Đăng nhập thành công! Chuyển hướng đến trang tổng quan...',
        });

        // Add smooth transition effect
        $('body').fadeOut(500, function () {
          // Redirect to dashboard
          window.location.href = '/app/dashboard';
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
      $loginBtn.prop('disabled', false);
      $btnText.text('Đăng nhập');
      $spinner.addClass('d-none');
    }
  });

  // Handle forgot password
  $('#forgot-password').on('click', function (e) {
    e.preventDefault();
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.INFO,
      title: "Thông tin",
      text: 'Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.',
    });
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

  // Keyboard shortcuts
  $(document).on('keydown', function (e) {
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
