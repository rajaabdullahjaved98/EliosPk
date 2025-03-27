import { fetch } from 'wix-fetch'; // For cloud function requests
import { updateCustomer } from 'backend/firebaseFunctions.jsw'; // Backend function to update Firestore
import { updateComplaint} from 'backend/firebaseFunctions.jsw';
import { getSubscribedContacts } from 'backend/contacts.jsw';
import { currentUser } from 'wix-users';


let allWarranties = []; // To store the original data for resetting later
let allComplaints = []; // To store the original complaints data for resetting later

$w.onReady(async function () {
	$w("#text39").hide();
	$w("#text40").hide();
	$w("#text41").hide();

	$w('#input37').onClick((event) => { 
		$w("#text39").hide(); 
	});

	$w('#input27').onClick((event) => {
    	$w("#text40").hide();    
	});

	$w('#input28').onClick((event) => {
    	$w("#text41").hide();    
	});

  const options = {
    supressAuth: true
  };

  try {
    const user = currentUser;
    const currentUserEmail = await user.getEmail();

    await checkUserRole(user);
  } catch (error) {

  }

  //INITIAL DATA FETCH
  //loadCustomerData(); 
  //loadWarrantyData();
  //loadComplaintsData();

  //PERIODICALLY FETCH DATA AFTER EVERY 10 SECONDS
  setInterval(() => {
    loadCustomerData();
  }, 5000);

  setInterval(() => {
    loadWarrantyData();
  }, 5000);

  setInterval(() => {
    loadComplaintsData();
  }, 5000);

  $w("#button2").onClick(async () => {
    if (updatedComplaints.length > 0) {
      try {
        for (const complaint of updatedComplaints) {
          
          const { customerId, complaintId, complaint: complaintText, complaintstatus, closingdate } = complaint;

          const result = await updateComplaint(customerId, complaintId, complaintText, complaintstatus, closingdate);

          if (result.success) {
			      $w("#text41").text = "Complaint Updated";

            setTimeout(() => {
              loadComplaintsData();
            }, 3000);

			      $w("#text41").show();
            //console.log(`Complaint ${complaintId} updated successfully.`);
          
          } else {
            //console.error(`Failed to update complaint ${complaintId}:`, result.message);
          }
        }

        //$w("#updateStatus").text = "All complaints updated successfully!";
      } catch (error) {
        //console.error("Error updating complaints:", error);
        //$w("#updateStatus").text = "Error updating complaints: " + error.message;
      }
    } else {
      //$w("#updateStatus").text = "No changes to update.";
    }
  });

  $w("#button1").onClick(async () => {
    if (updatedCustomers.length > 0) {
      try {
        for (const customer of updatedCustomers) {
          
          const {id, firstname, lastname, phone, email, address, city } = customer;
          //console.log("Customer ID: ", id);
          //console.log("First Name: ", firstname);
          //console.log("Last Name: ", lastname);
          //console.log("Phone: ", phone);
          //console.log("Email: ", email);
          //console.log("Address: ", address);
          //console.log("City: ", city);

          const result = await updateCustomer(id, firstname, lastname, phone, email, address, city);

          if (result.success) {
            $w("#text39").text = "Customer Updated";
            $w("#text39").show();
            
            setTimeout(() => {
              loadCustomerData();
            }, 3000);
            
            //console.log("Customer Updated Successfully");
          
          } else {
            //console.error("Failed to Update Customer");
          }
        }
      } catch (error) {
        //console.error("Error Updating Customers");
      } 
    } else {
      $w("#text39").text = "No Changes Detected";
      $w("#text39").show();
    }
  });

  // Add event listener for button3 to search based on phone number
  $w("#button7").onClick(() => {
    const phoneNumber = $w("#input27").value; // Get phone number input value

    if (phoneNumber) {
      // Filter repeater data to match the phone number
      const filteredWarranties = allWarranties.filter(warranty => warranty.phone === phoneNumber);

      if (filteredWarranties.length > 0) {
        $w("#repeater2").data = filteredWarranties; // Update repeater with filtered data
      } else {
        // If no match, show a message (optional)
        //console.log("No matching warranty found for this phone number.");
		    $w("#text40").show();
      }
    } else {
      // If input field is cleared, reset to original data
      $w("#repeater2").data = allWarranties;
    }
  });

  // Event listener for 'button3' to search by phone number
  $w("#button6").onClick(() => {
    const phoneNumber = $w("#input28").value.trim();

    if (phoneNumber !== "") {
      // Filter complaints by phone number
      const filteredComplaints = originalComplaintsData.filter(complaint => complaint.phone === phoneNumber);

      // If there are complaints with the searched phone number, display them
      if (filteredComplaints.length > 0) {
        $w("#repeater3").data = filteredComplaints;
      } else {
        //console.log(`No complaints found with phone number: ${phoneNumber}`);
		    $w("#text41").text = "User Not Found!";
		    $w("#text41").show();
      }
    } else {
      // If input is cleared, reset to original complaints data
      $w("#repeater3").data = originalComplaintsData;
    }
  });

  $w("#button8").onClick(() => {
    const phoneNumber = $w("#input37").value.trim();

    if (phoneNumber !== "") {
      // Filter customers by phone number
      const filteredCustomers = originalCustomersData.filter(customer => customer.phone === phoneNumber);

      if (filteredCustomers.length > 0) {
        $w("#repeater4").data = filteredCustomers;
      } else {
        //console.log(`No customers found with phone number: ${phoneNumber}`);
		    $w("#text39").show();
      }
    } else {
    // If input is cleared, reset to original customers data
      $w("#repeater4").data = originalCustomersData;
    }
  });
});

//CUSTOMERS TAB//
// CUSTOMERS TAB //
let originalCustomersData = [];
let updatedCustomers = [];

function loadCustomerData() {
  const cloudFunctionUrl = "https://us-central1-sabrocustomerservice.cloudfunctions.net/getCustomersData";

  fetch(cloudFunctionUrl, { method: 'GET' })
    .then((httpResponse) => {
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        //console.error("Failed to fetch customer data:", httpResponse.statusText);
        return [];
      }
    })
    .then((customers) => {
      // Map the customer data into an array of objects
      const customersData = customers.map(customer => ({
        _id: customer.id,
        firstname: customer.firstname,
        lastname: customer.lastname,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        createdAt: customer.createdAt
      }));

      // Store the complete customer data to reset later (search logic)
      originalCustomersData = customersData;

      // Populate repeater with customer data
      $w("#repeater4").data = customersData;

      // Bind data to the repeater items
      $w("#repeater4").onItemReady(($item, itemData) => {
        $item("#input36").value = itemData.firstname;
        $item("#input35").value = itemData.lastname;
        $item("#input34").value = itemData.phone;
        $item("#input33").value = itemData.email;
        $item("#input32").value = itemData.address;
        $item("#input31").value = itemData.city;
        $item("#input30").value = itemData.createdAt;

        $item("#input36, #input35, #input32, #input31").onChange(() => {
          const updatedCustomer = {
            id: itemData._id,
            firstname: $item("#input36").value,
            lastname: $item("#input35").value,
            phone: $item("#input34").value,
            email: $item("#input33").value,
            address: $item("#input32").value,
            city: $item("#input31").value
          };

          const existingIndex = updatedCustomers.findIndex(c => c.id === itemData._id);

          if (existingIndex !== -1) {
            updatedCustomers[existingIndex] = updatedCustomer;
          } else {
            updatedCustomers.push(updatedCustomer);
          }

          //console.log(updatedCustomers);
        });
      });
    })
    .catch((error) => console.error("Error fetching customer data:", error));
}
//CUSTOMERS TAB//


//WARRANTIES TAB//
function loadWarrantyData() {
  const cloudFunctionUrl = "https://us-central1-sabrocustomerservice.cloudfunctions.net/getAllCustomerWarranties";

  fetch(cloudFunctionUrl, { method: 'GET' })
    .then((httpResponse) => {
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        //console.error("Failed to fetch customer warranties data:", httpResponse.statusText);
        return [];
      }
    })
    .then((customers) => {
      const warranties = customers.flatMap(customer => customer.warranties.map(warranty => {
        //const startDate = new Date(warranty.startdate); // Parse the start date
        //const endDate = new Date(startDate);
        //endDate.setFullYear(startDate.getFullYear() + 1);

        return {
          _id: warranty.id, // Each warranty document's id
          firstname: warranty.firstname,
          lastname: warranty.lastname,
          phone: warranty.phone,
          email: warranty.email,
          devicedetails: warranty.devicedetails,
          deviceserial: warranty.deviceserial,
          startdate: warranty.startdate, // Convert and format startdate
          endingdate: warranty.endingdate // Format the calculated end date
        };
      }));

      // Store the complete warranty data to reset later
      allWarranties = warranties;

      // Populate repeater with warranty data
      $w("#repeater2").data = allWarranties;

      // Bind data to the repeater
      $w("#repeater2").onItemReady(($item, itemData) => {
        $item("#input14").value = itemData.firstname;
        $item("#input13").value = itemData.lastname;
        $item("#input16").value = itemData._id;
        $item("#input12").value = itemData.phone;
        $item("#input11").value = itemData.email;
        $item("#input9").value = itemData.devicedetails;
        $item("#input8").value = itemData.startdate;
        $item("#input15").value = itemData.endingdate;
        $item("#input38").value = itemData.deviceserial;
      });
    })
  .catch((error) => console.error("Error fetching warranty data:", error));
}

//COMPLAINTS TAB
let updatedComplaints = [];
let originalComplaintsData = [];

function loadComplaintsData() {
  const cloudFunctionUrl = "https://us-central1-sabrocustomerservice.cloudfunctions.net/getAllCustomerComplaints";

  fetch(cloudFunctionUrl, { method: 'GET' })
    .then((httpResponse) => {
      if (httpResponse.ok) {
        return httpResponse.json();
      } else {
        //console.error("Failed to fetch customer complaints data:", httpResponse.statusText);
        return [];
      }
    })
    .then((customers) => {
      //console.log(customers); // Debugging - check if customers data is returned

      const complaints = customers.flatMap(customer => customer.complaints.map(complaint => {
        return {
          _id: complaint.id,  // Complaint document's id
          customerId: customer.id,  // Customer document's id
          firstname: complaint.firstname,
          lastname: complaint.lastname,
          phone: complaint.phone,
          email: complaint.email,
          city: complaint.city,
          address: complaint.address,
          complaintdate: complaint.complaintdate,
          complaint: complaint.complaint,
          complaintstatus: complaint.complaintstatus,
          closingdate: complaint.closingdate
        };
      }));

      //console.log(complaints); // Debugging - check if complaints array is populated

      // Store the original complaints data for resetting after search
      originalComplaintsData = complaints;

      // Populate repeater with complaints data
      $w("#repeater3").data = complaints;

      // Bind data to the repeater
      $w("#repeater3").onItemReady(($item, itemData) => {
        $item("#input21").value = itemData._id;  // complaintId
        $item("#input22").value = itemData.firstname + ' ' + itemData.lastname;
        $item("#input23").value = itemData.phone;
        $item("#input25").value = itemData.city + ' ' + itemData.address;
        $item("#input26").value = itemData.complaintdate;
        $item("#input17").value = itemData.complaint;  // Bind complaint
        $item("#input18").value = itemData.complaintstatus;  // Bind complaint status
        $item("#input19").value = itemData.closingdate;  // Bind closing date

        // Track changes in repeater inputs and store in updatedComplaints array
        $item("#input17, #input18, #input19").onChange(() => {
          const updatedComplaint = {
            customerId: itemData.customerId,
            complaintId: itemData._id,
            complaint: $item("#input17").value,
            complaintstatus: $item("#input18").value,
            closingdate: $item("#input19").value
          };

          // Check if the complaint already exists in the updatedComplaints array
          const existingIndex = updatedComplaints.findIndex(c => c.complaintId === itemData._id);

          if (existingIndex !== -1) {
            // Update the existing complaint
            updatedComplaints[existingIndex] = updatedComplaint;
          } else {
            // Add a new complaint entry
            updatedComplaints.push(updatedComplaint);
          }

          //console.log(updatedComplaints);  // Debugging - see the updated complaints list
        });
      });
    })
  .catch((error) => console.error("Error fetching complaints data:", error));
}

async function checkUserRole(user) {
  
  try {
    const roles = await user.getRoles();
    const isISBAdmin = roles.some(role => role.name === "ISB Admin");
    const isFSDAdmin = roles.some(role => role.name === "FSD Admin");
    const isKHIAdmin = roles.some(role => role.name === "KHI Admin");
    const isLHRAdmin = roles.some(role => role.name === "LHR Admin");
    const isPWRAdmin = roles.some(role => role.name === "PWR Admin");

    if (isISBAdmin) {
      console.log("The user is an ISB admin");
      loadCustomerData(); 
      loadWarrantyData();
      loadComplaintsData();
    } else {

    }

    if (!isISBAdmin) {
      console.log("The user is not an ISB admin");
      loadCustomerData(); 
      loadWarrantyData();
      loadComplaintsData();

      //DISABLE CUSTOMER TAB
      $w("#input36").disable();
      $w("#input35").disable();
      $w("#input34").disable();
      $w("#input33").disable();
      $w("#input32").disable();
      $w("#input31").disable();
      $w("#input30").disable();

      //DISABLE WARRANTIES TAB
      $w("#input14").disable();
      $w("#input13").disable();
      $w("#input12").disable();
      $w("#input11").disable();
      $w("#input16").disable();
      $w("#input38").disable();
      $w("#input9").disable();
      $w("#input8").disable();
      $w("#input15").disable();

      //DISABLE COMPLAINTS TAB
      $w("#input21").disable();
      $w("#input22").disable();
      $w("#input23").disable();
      $w("#input25").disable();
      $w("#input26").disable();
      $w("#input17").disable();
      $w("#input18").disable();
      $w("#input19").disable();
    }

    if (isFSDAdmin) {
      console.log("The user is FSD admin");
      $w("#input31").onInput(() => {
        const filterValue = "Faisalabad";

        let repeaterData = $w("#repeater4").data;

        $w("#repeater4").onItemReady(($item, itemData) => {
          if (itemData.city === filterValue) {
            console.log("Key value found");
            $item.show();
          } else {
            console.log("Key value not found");
            $item.hide();
          }
        });
      });
    }

    if (isKHIAdmin) {
      console.log("The user is KHI admin");
    }

    if (isLHRAdmin) {
      console.log("The user is LHR admin");
    }

    if(isPWRAdmin) {
      console.log("The user is PWR admin");
    }
  } catch (err) {

  }
}