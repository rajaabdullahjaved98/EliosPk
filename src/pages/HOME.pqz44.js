import { getSubscribedContacts } from 'backend/contacts.jsw';
import {currentUser} from 'wix-users';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(async function() {
	const options = {
		suppressAuth: true
	};

	try {
		const user = currentUser;
		const currentUserEmail = await user.getEmail();
		//console.log("Current user's email: ", currentUserEmail);

		await checkUserRole(user);
	} catch (error) {
		//console.log("Error fetching contacts: ", error);
	}
});

async function checkUserRole(user) {
	//console.log("Checking user role for user ID: ", user.id);

	try {
		const roles = await user.getRoles();
		//console.log("User role:", roles);

		const isAdmin = roles.some(role => role.name === "Admin");

		if(isAdmin) {
			//console.log("The current user is an Admin");
			setTimeout(() => {
				wixLocation.to("/admin-panel");
			}, 1000);
		} else {
			//console.log("The current user is not an admin. Roles: ", roles);
		}
	} catch (err) {
		//console.log("Error checking user role: ", err);
	}
}