document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
 
  const form = document.getElementById('compose-form');
  let submitCount = 0;
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const recipientsInput = document.getElementById("compose-recipients");
    const subjectInput = document.getElementById("compose-subject");
    const bodyInput = document.getElementById("compose-body");
    const recipients = recipientsInput.value;
    const subject = subjectInput.value;
    const body = bodyInput.value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    })
    .catch(error => {
      // Handle error
      console.error('An error occurred:', error);
    });
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  console.log('Mailbox:', mailbox);

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      const columnDiv = document.createElement('div');
      columnDiv.classList.add('column');
  
      emails.forEach(email => {
        const recipient = email.sender;
        const subject = email.subject;
        const timestamp = email.timestamp;
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        rowDiv.style.padding = '4px'; 
        rowDiv.style.border = '1px solid black'; 
        const recipientDiv = document.createElement('div');
        recipientDiv.classList.add('mr-3'); 
        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('mr-3');
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('mr-3');
  
        recipientDiv.textContent = recipient;
        subjectDiv.textContent = subject;
        timestampDiv.textContent = timestamp;
  
        rowDiv.appendChild(recipientDiv);
        rowDiv.appendChild(subjectDiv);
        rowDiv.appendChild(timestampDiv);
  
        columnDiv.appendChild(rowDiv);
      });
  
      // Append the column to the emails view
      document.querySelector('#emails-view').appendChild(columnDiv);
    });  
  }
  