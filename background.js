// Initialize the storage object for storing the generated emails
chrome.storage.local.set({ generatedEmails: [] });

// Add a listener to handle the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getGeneratedEmails') {
    chrome.storage.local.get(['generatedEmails'], result => {
      sendResponse({ emails: result.generatedEmails });
    });
    return true; // This is required to use sendResponse asynchronously
  } else if (request.type === 'setGeneratedEmail') {
    chrome.storage.local.get(['generatedEmails'], result => {
      const updatedEmails = [...result.generatedEmails, request.email];
      chrome.storage.local.set({ generatedEmails: updatedEmails });
    });
  }
});
