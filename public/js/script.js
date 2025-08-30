(() => {
    'use strict';
  
    // Bootstrap form validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  })();
  
  (() => {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const body = document.body;
  
    if (!toggleButton || !darkModeIcon) return;
  
    // Load saved mode
    const isDarkMode = localStorage.getItem('dark-mode') === 'enabled';
    if (isDarkMode) {
      body.classList.add('dark-mode');
      darkModeIcon.classList.replace('fa-moon', 'fa-sun');
    }
  
    // Toggle dark mode and icon
    toggleButton.addEventListener('click', () => {
      const enabled = body.classList.toggle('dark-mode');
  
      localStorage.setItem('dark-mode', enabled ? 'enabled' : 'disabled');
      darkModeIcon.classList.replace(
        enabled ? 'fa-moon' : 'fa-sun',
        enabled ? 'fa-sun' : 'fa-moon'
      );
    });
  })();

  const sampleLocations = [
    "Delhi", "Mumbai", "Goa", "Manali", "Shimla",
    "Kerala", "Bangalore", "Hyderabad", "Chennai", "Pune", "Udaipur"
  ];
  
  function suggestLocation(query) {
    const suggestionBox = document.getElementById("locationSuggestions");
    if (!query.trim()) {
      suggestionBox.classList.add("d-none");
      suggestionBox.innerHTML = "";
      return;
    }
  
    const filtered = sampleLocations.filter(place =>
      place.toLowerCase().startsWith(query.toLowerCase())
    );
  
    suggestionBox.innerHTML = filtered.map(loc =>
      `<div class="p-2 suggestion" onclick="selectSuggestion('${loc}')">${loc}</div>`
    ).join("");
  
    suggestionBox.classList.toggle("d-none", filtered.length === 0);
  }
  
  function selectSuggestion(value) {
    document.getElementById("location").value = value;
    document.getElementById("locationSuggestions").classList.add("d-none");
  }
  
 
