document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#detail-view').style.display = 'none';

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
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Check localStorage for reply values
  if (localStorage.getItem('replySender') && localStorage.getItem('replySubject') && localStorage.getItem('replyTimestamp')) {
    // Retrieve values from localStorage
    const replySender = localStorage.getItem('replySender');
    const replySubject = localStorage.getItem('replySubject');
    const replyTimestamp = localStorage.getItem('replyTimestamp');
    const replyBody = localStorage.getItem('replyBody');

    // Set values to the input fields
    document.querySelector('#compose-recipients').value = replySender;
    document.querySelector('#compose-subject').value = `Re: ${replySubject}`;
    const composeBody = `On ${replyTimestamp} ${replySender} wrote: ${replyBody}`;
    document.querySelector('#compose-body').value = composeBody;

    // Clear localStorage
    localStorage.removeItem('replySender');
    localStorage.removeItem('replySubject');
    localStorage.removeItem('replyTimestamp');
  }
}

function load_mailbox(mailbox) {
  const detailView = document.querySelector('#detail-view');
  while (detailView.firstChild) {
    detailView.removeChild(detailView.firstChild);
  }
  // Show the mailbox and hide other views
  document.querySelector('#detail-view').style.display = 'none';
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
        const emailId = email.id

        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        rowDiv.style.padding = '4px'; 
        rowDiv.style.border = '1px solid black'; 

        rowDiv.addEventListener('click', () => {
          fetch(`/emails/${emailId}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
            .then(response => {
              if (response.ok) {
                console.log(`Email with ID ${emailId} marked as read`);
                load_detail(emailId);
              } else {
                console.log(`Error marking email with ID ${emailId} as read`);
              }
            });
        });

        const recipientDiv = document.createElement('div');
        recipientDiv.classList.add('mr-3'); 
        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('mr-3');
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('mr-3');
        timestampDiv.style.flexGrow = '1'; 
        timestampDiv.style.textAlign = 'right'; 

        recipientDiv.textContent = recipient;
        subjectDiv.textContent = subject;
        timestampDiv.textContent = timestamp;
  
        rowDiv.appendChild(recipientDiv);
        rowDiv.appendChild(subjectDiv);
        rowDiv.appendChild(timestampDiv);
  
         if (email.read) {
          rowDiv.style.backgroundColor = 'white'; 
        } else {
          rowDiv.style.backgroundColor = '#D9D9D9'; 
        }

        columnDiv.appendChild(rowDiv);
      });
  
      // Append the column to the emails view
      document.querySelector('#emails-view').appendChild(columnDiv);
    });  
  }
  
function load_detail(emailId){
    document.querySelector('#detail-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    const detailView = document.getElementById("detail-view");

    console.log(emailId);

    const replyBtn = document.createElement('button');
    replyBtn.classList.add('btn', 'btn-primary');
    replyBtn.textContent = 'Reply';
    replyBtn.classList.add('mr-3');

    const archiveBtn = document.createElement('button');
    archiveBtn.classList.add('btn', 'btn-secondary');
    archiveBtn.textContent = 'Archive';
    archiveBtn.classList.add('mr-3');

    const unarchiveBtn = document.createElement('button');
    unarchiveBtn.classList.add('btn', 'btn-secondary');
    unarchiveBtn.textContent = 'Unarchive';

    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('col-12', 'mt-2', 'mb-4');
    buttonDiv.appendChild(replyBtn);
    buttonDiv.appendChild(archiveBtn);
    buttonDiv.appendChild(unarchiveBtn);
    detailView.appendChild(buttonDiv);

    let replySender;
    let replySubject;
    let replyTimestamp;
    let replyBody;

    fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
      replySender = email.sender;
      replySubject = email.subject;
      replyTimestamp = email.timestamp;
      replyBody = email.body;
      archived_status = email.archived;

        console.log(email);
        const senderDiv = document.createElement('div');
        senderDiv.classList.add('row');
        senderDiv.style.padding = '4px';
        senderDiv.style.border = '1px solid black';
        senderDiv.textContent = `Sender: ${email.sender}`;
        detailView.appendChild(senderDiv);
  
        const recipientsDiv = document.createElement('div');
        recipientsDiv.classList.add('row');
        recipientsDiv.style.padding = '4px';
        recipientsDiv.style.border = '1px solid black';
        recipientsDiv.textContent = `Recipients: ${email.recipients.join(', ')}`;
        detailView.appendChild(recipientsDiv);
  
        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('row');
        subjectDiv.style.padding = '4px';
        subjectDiv.style.border = '1px solid black';
        subjectDiv.textContent = `Subject: ${email.subject}`;
        detailView.appendChild(subjectDiv);
  
        const timestampDiv = document.createElement('div');
        timestampDiv.classList.add('row');
        timestampDiv.style.padding = '4px';
        timestampDiv.style.border = '1px solid black';
        timestampDiv.textContent = `Timestamp: ${email.timestamp}`;
        detailView.appendChild(timestampDiv);

        const divider = document.createElement('hr');
        detailView.appendChild(divider);
  
        const bodyDiv = document.createElement('div');
        bodyDiv.classList.add('row');
        bodyDiv.style.padding = '4px';
        bodyDiv.textContent = `${email.body}`;
        detailView.appendChild(bodyDiv);

        if (email.archived) {
          // Email is archived, hide the archive button
          archiveBtn.style.display = 'none';
        } else {
          // Email is not archived, hide the unarchive button
          unarchiveBtn.style.display = 'none';
        }
});

      replyBtn.addEventListener('click', function() {
        localStorage.setItem('replySender', replySender);
        localStorage.setItem('replySubject', replySubject);
        localStorage.setItem('replyTimestamp', replyTimestamp);
        localStorage.setItem('replyBody', replyBody);
        compose_email();
      });

      archiveBtn.addEventListener('click', function() {
        fetch(`/emails/${emailId}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
          .then(response => {
            if (response.ok) {
              console.log(`Email with ID ${emailId} marked as archived`);
              load_mailbox(inbox);
            } else {
              console.log(`Error marking email with ID ${emailId} as archived`);
            }
          });
      });

      unarchiveBtn.addEventListener('click', function() {
        fetch(`/emails/${emailId}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
          .then(response => {
            if (response.ok) {
              console.log(`Email with ID ${emailId} marked as unarchived`);
              load_mailbox('inbox');
            } else {
              console.log(`Error marking email with ID ${emailId} as unarchived`);
            }
          });
        });
}