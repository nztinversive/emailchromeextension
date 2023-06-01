async function callApi(emailSubject, openaiApiKey, optionAction) {
  const response = await fetch('https://emailchrome.nztinversive.repl.co/generate_emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_subject: emailSubject,
      openai_api_key: openaiApiKey,
      action: optionAction, // Pass the action option to the API
      tone: 'Formal', // Pass the tone option to the API
      dialect: 'American' // Pass the dialect option to the API
    })
  });

  const jsonResponse = await response.json();

  if (jsonResponse.formatted_email) {
    // Save the generated email in chrome.storage.local
    chrome.runtime.sendMessage({ type: 'setGeneratedEmail', email: jsonResponse.formatted_email });
  }

  return jsonResponse;
}


function showExampleText() {
  const emailSubjectInput = document.getElementById('emailSubject');
  if (emailSubjectInput.value === '') {
    emailSubjectInput.placeholder = 'Tell Sam the weekly estimates look good but we need to add Q2 to the data.';
  } else {
    emailSubjectInput.placeholder = '';
  }
}

// Load the generated emails from the background storage when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Get the latest generated email from chrome.storage.local
    chrome.runtime.sendMessage({ type: 'getGeneratedEmails' }, response => {
      if (response.emails && response.emails.length > 0) {
        const latestEmail = response.emails[response.emails.length - 1];
        document.getElementById('suggestions').innerHTML = `<p>${latestEmail}</p>`;
        document.getElementById('copyButton').style.display = 'inline-block';
        document.getElementById('suggestions').style.border = '1px solid #0aaf66';
      }
    });
  }, 100);
});



document.getElementById('generateEmails').addEventListener('click', async () => {
  console.log('Generate Emails button clicked');

  // Show the loading screen
  document.getElementById('loadingScreen').style.display = 'block';
  
  try {
    const emailSubject = document.getElementById('emailSubject').value;
    const openaiApiKey = 'your-openai-api-key'; // Replace with your actual API key or store it securely
    const emailToggle = document.getElementById('emailToggle').checked;
    const optionAction = emailToggle ? 'Reply' : 'New Email';

    const result = await callApi(emailSubject, openaiApiKey, optionAction);
    const suggestionsDiv = document.getElementById('suggestions');

    // Display the generated suggestions in the 'suggestions' div
    if (result.formatted_email) {
      suggestionsDiv.innerHTML = `<p>${result.formatted_email}</p>`;
      document.getElementById('copyButton').style.display = 'inline-block'; // Show the copy button
      suggestionsDiv.style.border = '1px solid #0aaf66'; // Change the border to solid green

       // Reset the copy button color
      const copyButton = document.getElementById('copyButton');
      copyButton.style.backgroundColor = '#f5f5f5';
      copyButton.style.borderColor = '#ccc';


      // Save the email subject to localStorage
      let previousInputs = JSON.parse(localStorage.getItem('previousInputs') || '[]');
      previousInputs.push(emailSubject);
      localStorage.setItem('previousInputs', JSON.stringify(previousInputs));

      // Update the datalist with the saved email subjects
      const previousInputsDatalist = document.getElementById('previousInputs');
      previousInputsDatalist.innerHTML = '';
      previousInputs.forEach(subject => {
        previousInputsDatalist.innerHTML += `<option value="${subject}">`;
      });
    } else {
      suggestionsDiv.innerHTML = '<p>No suggestions available.</p>';
    }
    
    document.getElementById('loadingScreen').style.display = 'none';
    
  } catch (error) {
    console.error('Error:', error);

    // Save an empty string to the background storage when an error occurs
    chrome.runtime.sendMessage({ type: 'setGeneratedEmail', email: '' });

    // Hide the loading screen
    document.getElementById('loadingScreen').style.display = 'none';
  }
});

// Function to copy email content to clipboard
async function copyToClipboard() {
  await new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'getGeneratedEmails' }, response => {
      if (response.emails && response.emails.length > 0) {
        const latestEmail = response.emails[response.emails.length - 1];
        const textArea = document.createElement('textarea');
        textArea.textContent = latestEmail;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Change the copy button color to green
        const copyButton = document.getElementById('copyButton');
        copyButton.style.backgroundColor = '#28a745';
        copyButton.style.borderColor = '#28a745';
      }
      resolve();
    });
  });
}

// Add event listener for the copy button
document.getElementById('copyButton').addEventListener('click', copyToClipboard);


// Set the background color of the popup based on the toggle switch state
function toggleSwitch() {
  const emailToggle = document.getElementById('emailToggle');
  emailToggle.checked = !emailToggle.checked;
}
// Add event listener for the toggle switch
document.getElementById('toggleButton').addEventListener('click', toggleSwitch);
