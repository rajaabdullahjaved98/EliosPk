import { addCustomerToFirebase } from 'backend/firebaseFunctions.jsw'; // Import the backend function

$w.onReady(function () {
    // Add an onClick listener to the button with ID #signupButton
    $w("#button5").onClick(() => {
        // Call the function to handle the signup process
        handleSignup();
    });
});

async function handleSignup() {
    // Get input values from the form
    const email = $w("#input2").value;
    const password = $w("#input1").value;
    const firstname = $w("#input4").value;
    const lastname = $w("#input3").value;
    const phone = $w("#input5").value;
    const address = $w("#input6").value;
    const city = $w("#dropdown1").value;

    try {
        // Call the Firebase function to send data to Firestore
        const firebaseResponse = await addCustomerToFirebase(firstname, lastname, email, phone, address, city);
        console.log("Customer data sent to Firestore successfully:", firebaseResponse);

        // Optionally, display a success message or redirect the user
        $w("#text68").text = "Signup successful!";
        $w("#text68").show();
    } catch (error) {
        console.error("Error during Firebase operation: ", error);

        // Show error message on the page
        $w("#text68").text = "Error occurred during signup";
        $w("#text68").show();
    }
}
