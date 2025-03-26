import { getSubscribedContacts } from 'backend/contacts.jsw';
import { currentUser } from 'wix-users';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location'; // To redirect the user
import { openLightbox } from 'wix-window';
import { sendWarrantyEmail } from 'backend/email.jsw';
import { sendComplaintEmail } from 'backend/email.jsw';

$w.onReady(async function () {
  const options = {
    suppressAuth: true
  };

  try {
    // Get the current logged-in user's email
    const user = currentUser;
    const currentUserEmail = await user.getEmail();
    //console.log("Current User's Email:", currentUserEmail);
    const memberId = user.id;
    const siteUrl = "https://www.eliospk.com";

    // Perform role check before proceeding with the rest of the logic
    await checkUserRole(user); // Pass the user object to the role check function

    // Fetch all subscribed contacts
    const results = await getSubscribedContacts(options);
    //console.log("Contacts: ", results);

    // Find the current user's contact data based on email
    const currentUserContact = results.find(contact => contact.email.some(e => e.email === currentUserEmail));

    // If a match is found, populate the form fields
    if (currentUserContact) {
      $w("#input1").value = currentUserContact.name?.first || "";
      $w("#input2").value = currentUserContact.name?.last || "";
      $w("#input3").value = currentUserContact.phone?.[0]?.phone || "No phone number available";
      $w("#input4").value = currentUserEmail;
      $w("#input10").value = currentUserContact.name?.first || "";
      $w("#input9").value = currentUserContact.name?.last || "";
      $w("#input8").value = currentUserContact.phone?.[0]?.phone || "No phone number available";
      $w("#input7").value = currentUserEmail;
      //console.log(currentUserContact.phone); // This will show all phone numbers associated with the contact
      //console.log(currentUserContact.phone?.[0].phone);

      // Extract the last 10 digits of the phone number
      const phoneNumber = currentUserContact.phone?.[0]?.phone || "";
      const last10Digits = phoneNumber.slice(-10);

      // Fetch warranties using the last 10 digits of the phone number via the Firestore Cloud Function
      if (last10Digits.length === 10) {
        fetch(`https://us-central1-sabrocustomerservice.cloudfunctions.net/getWarrantiesByPhone?phone=${last10Digits}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            //console.log("Warranties fetched: ", data.warranties);
            // Populate the table with the fetched warranty data
            populateWarrantiesTable(data.warranties);
          } else {
            //console.error("Error: ", data.message);
          }
        })
        .catch(error => {
          //console.error('Error:', error);
        });
      } else {
        //console.error('Invalid phone number');
      }

      if (last10Digits.length === 10) {
        fetch(`https://us-central1-sabrocustomerservice.cloudfunctions.net/getComplaintsByPhone?phone=${last10Digits}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            //console.log("Complaints fetched: ", data.complaints);
            // Populate the table with the fetched warranty data
            populateComplaintsTable(data.complaints);
          } else {
            //console.error("Error: ", data.message);
          }
        })
        .catch(error => {
          //console.error('Error:', error);
        });
      } else {
        //console.error('Invalid phone number');
      }
    } else {
      //console.error("Current user's contact data not found.");
    }
  } catch (error) {
    //console.log("Error Fetching Contacts: ", error);
  }


  $w("#button4").onClick((event) => {
    if ($w("#section3").collapsed) {
      $w("#section3").expand();
    }
  });

  $w("#button8").onClick((event) => {
    $w("#section3").collapse();
  });

  $w("#button5").onClick((event) => {
    if ($w("#section6").collapsed) {
      $w("#section6").expand();
    }
  });

  $w("#button9").onClick((event) => {
    $w("#section6").collapse();
  })

  $w("#button6").onClick((event) => {
    const isFormValid = (
      $w("#checkbox1").checked &&
      $w("#input1").value.trim() !== '' &&
      $w("#input2").value.trim() !== '' &&
      $w("#input3").value.trim() !== '' &&
      $w("#input4").value.trim() !== '' &&
      $w("#dropdown1").value !== '' &&
      $w("#input5").value !== '' && 'FFFFFFFFFFFF' && '000000000000' &&
      $w("#input5").value.length == 12
    );

    if (!isFormValid) {
      wixWindow.openLightbox("ErrorAlert", {
        message: "Please fill in all the required fields and check the checkbox."
      });
      return;
    }

    const formData = {
      firstname: $w("#input1").value,
      lastname: $w("#input2").value,
      phone: $w("#input3").value,
      email: $w("#input4").value,
      startdate: new Date($w("#datePicker1").value),
      devicedetails: $w("#dropdown1").value,
      deviceserial: $w("#input5").value
    };

    fetch('https://us-central1-sabrocustomerservice.cloudfunctions.net/handleWarrantyFormSubmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        openLightbox("Warranty Generated");
        $w("#section3").collapse();
        //console.log(data.message);
        const user = currentUser;
        const currentUserEmail = user.getEmail();
        //console.log("Current User's Email:", currentUserEmail);
        const memberId = user.id;
        const siteUrl = "https://www.eliospk.com";
        sendWarrantyEmail(memberId, siteUrl);
      } else {
        wixWindow.openLightbox("ErrorAlert", {
          message: `Error: ${data.message}`
        });
        //console.error(data.message);
      }
    })
    .catch(error => {
      wixWindow.openLightbox("ErrorAlert", {
        message: `Error submitting form: ${error.message}`
      });
      //console.error('Error submitting form:', error);
    });
  });

  $w("#button7").onClick((event) => {
    const isFormValid = (
      $w("#checkbox2").checked &&
      $w("#input10").value.trim() !== '' &&
      $w("#input9").value.trim() !== '' &&
      $w("#input8").value.trim() !== '' &&
      $w("#input7").value.trim() !== '' &&
      $w("#input11").value !== '' &&
      $w("#input12").value !== '' &&
      $w("#input6").value !== ''
    );

    if (!isFormValid) {
      wixWindow.openLightbox("ErrorAlert", {
        message: "Please fill in all the required fields and check the checkbox."
      });
      return;
    }

    const formData = {
      firstname: $w("#input10").value,
      lastname: $w("#input9").value,
      phone: $w("#input8").value,
      email: $w("#input7").value,
      city: $w("#input11").value,
      address: $w("#input12").value,
      complaint: $w("#input6").value
    };

    fetch('https://us-central1-sabrocustomerservice.cloudfunctions.net/handleComplaintFormSubmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        openLightbox("Complaint Submitted");
        $w("#section6").collapse();
        const user = currentUser;
        const currentUserEmail = user.getEmail();
        //console.log("Current User's Email:", currentUserEmail);
        const memberId = user.id;
        const siteUrl = "https://www.eliospk.com";
        sendComplaintEmail(memberId, siteUrl);
        //console.log(data.message);
      } else {
        wixWindow.openLightbox("ErrorAlert", {
          message: `Error: ${data.message}`
        });
        //console.error(data.message);
      }
    })
    .catch(error => {
      wixWindow.openLightbox("ErrorAlert", {
        message: `Error submitting form: ${error.message}`
      });
      //console.error('Error submitting form:', error);
    });
  });
});

async function populateWarrantiesTable(warranties) {
  $w("#table1").rows = [];

  const tableRows = warranties.map(warranty => {
    const endingDateInSeconds = warranty.endingdate._seconds;
    const endingDate = new Date(endingDateInSeconds * 1000);
    //const formatedEndingDate = endingDate.toLocaleDateString();
    const rowData = {
      "warranty_no": warranty.id,
      "device": warranty.devicedetails,
      "starting_date": warranty.startdate,
      "expiry_date": warranty.endingdate
    };

    //console.log(rowData);
    return rowData;
  });

  $w("#table1").rows = tableRows;
  if (tableRows.length !== 0) {
    $w("#section3").collapse();
  }
}

async function populateComplaintsTable(complaints) {
  $w("#table2").rows = [];

  const tableRows = complaints.map(complaint => {
    const rowData = {
      "complaint_id": complaint.id,
      "complaint": complaint.complaint,
      "status": complaint.complaintstatus
    };

    //console.log(rowData);
    return rowData;
  });

  $w("#table2").rows = tableRows;
  if (tableRows.length !== 0) {
    $w("#section6").collapse();
  }
}

// Role checking function to handle redirection based on user role
async function checkUserRole(user) {
  console.log("Checking user role for user ID:", user.id);

  try {
    // Get the roles of the current user
    const roles = await user.getRoles(); // Fetch roles from the current user
    //console.log("User roles:", roles);

    // Check if the user has the "Admins" role
    const isAdmin = roles.some(role => role.name === "Admins");

    if (isAdmin) {
      //console.log("The current user is an admin");
      setTimeout(() => {
        wixLocation.to("/blank-1"); // Redirect to admin panel
      }, 1000); // Redirect to admin panel
    } else {
      //console.log("The current user is not an admin. Roles:", roles);
    }
  } catch (err) {
    //console.log("Error checking user role:", err);  // Log any errors that occur during the query
  }
}
