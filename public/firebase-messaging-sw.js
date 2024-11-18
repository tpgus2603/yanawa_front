self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});

self.addEventListener("push", function (e) {
  if (!e.data || !e.data.json()) {
    console.error("Push event does not contain valid JSON data.");
    return;
  }

  const resultData = e.data.json().notification;
  const resultURL = e.data.json().data.click_action;

  if (!resultData || !resultData.title || !resultData.body) {
    const notificationTitle = "Notification data is incomplete.";
    const notificationOptions = {
      body: "Notification data is incomplete.",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
    return;
  }

  const notificationTitle = resultData.title;
  const notificationOptions = {
    body: resultData.body.split("\\n").join("\n"),
    icon: resultData.image,
    tag: resultData.tag,
    data: { click_action: resultURL },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  const resultURL =
    event.notification.data && event.notification.data.click_action;

  if (!resultURL) {
    const notificationTitle = "URL is missing.";
    const notificationOptions = {
      body: "Notification click action URL is missing.",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === resultURL && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(resultURL);
        }
      })
  );

  event.notification.close();
});
