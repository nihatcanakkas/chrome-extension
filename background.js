chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'breakReminder') {
        // Kullanıcıdan alınan bildirim mesajını getir
        chrome.storage.local.get('notificationMessage', (result) => {
            const message = result.notificationMessage || 'Mola süreniz doldu!'; // Varsayılan mesaj

            // Bildirim oluştur
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png', // Simgenin doğru yolda olduğundan emin olun
                title: 'Mola Zamanı!',
                message: message,
                priority: 2
            });
        });

        // Zaman bilgisini temizleyin, gerekirse alarmı temizleyin
        chrome.storage.local.remove('endTime');
    }
});
