const admin = require("firebase-admin");

const serviceAccount = require("./../config/billtrack-676bd-firebase-adminsdk-fbsvc-c4e4bb156a.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
class PushNotificationService {
  static sendNotification(token, title, body) {
    (async () => {
      try {
        const message = {
          token: token,
          notification: {
            title: title,
            body: body,
          },
        };
        const response = await admin.messaging().send(message);
        return { status: true, response };
      } catch (error) {
        return { status: false, error };
      }
    })();
  }

  static async sendNotificationWithImage(token, title, body, imageUrl) {
    (async () => {
      try {
        const message = {
          token,
          notification: {
            title,
            body,
            image: imageUrl,
          },
          android: {
            notification: {
              imageUrl: imageUrl,
            },
          },
          apns: {
            payload: {
              aps: {
                "mutable-content": 1,
              },
            },
            fcm_options: {
              image: imageUrl,
            },
          },
        };

        const response = await admin.messaging().send(message);
        return { status: true, response };
      } catch (error) {
        return { status: false, error };
      }
    })();
  }
}

module.exports = PushNotificationService;
