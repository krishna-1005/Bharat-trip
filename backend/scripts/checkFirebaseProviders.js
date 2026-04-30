const { admin, initialized } = require("../firebaseAdmin");

async function checkFirebaseUserProviders(email) {
  if (!initialized) {
    console.error("Firebase Admin not initialized");
    return;
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Firebase User: ${email}`);
    console.log("Providers:");
    userRecord.providerData.forEach((provider) => {
      console.log(`- Provider ID: ${provider.providerId}`);
      console.log(`  UID: ${provider.uid}`);
      console.log(`  Email: ${provider.email}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

const email = "gotripo@gmail.com";
checkFirebaseUserProviders(email).then(() => process.exit());
