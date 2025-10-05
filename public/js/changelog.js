/**
 * Changelog Page JavaScript
 * Handles loading and displaying the changelog content
 */

(function() {
  'use strict';

  // Load changelog content when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadChangelog();
  });

  /**
   * Load changelog content from CHANGELOG.md
   */
  function loadChangelog() {
    var contentDiv = document.getElementById('changelogContent');
    
    // Fetch the CHANGELOG.md file
    fetch('/CHANGELOG.md')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load changelog');
        }
        return response.text();
      })
      .then(function(markdown) {
        // Convert markdown to HTML
        var html = convertMarkdownToHtml(markdown);
        contentDiv.innerHTML = html;
      })
      .catch(function(error) {
        console.error('Error loading changelog:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Không thể tải nội dung changelog. Vui lòng thử lại sau.</div>';
      });
  }

  /**
   * Convert markdown to HTML (simple conversion for changelog format)
   * @param {string} markdown - Markdown text
   * @returns {string} HTML
   */
  function convertMarkdownToHtml(markdown) {
    var html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert code blocks
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert lists
    var lines = html.split('\n');
    var inList = false;
    var result = [];
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      
      if (line.match(/^- /)) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push('<li>' + line.substring(2) + '</li>');
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }
    
    if (inList) {
      result.push('</ul>');
    }
    
    html = result.join('\n');
    
    // Convert line breaks to paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*<h/g, '<h');
    html = html.replace(/<\/h([2-4])>\s*<\/p>/g, '</h$1>');
    html = html.replace(/<p>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<\/p>/g, '</ul>');
    
    // Add styling classes
    html = html.replace(/<h2>/g, '<h2 class="changelog-version">');
    html = html.replace(/<h3>/g, '<h3 class="changelog-section mt-4">');
    html = html.replace(/<h4>/g, '<h4 class="changelog-subsection mt-3">');
    html = html.replace(/<ul>/g, '<ul class="changelog-list">');
    html = html.replace(/<code>/g, '<code class="changelog-code">');
    
    return html;
  }

})();
