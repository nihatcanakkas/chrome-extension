document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const statusText = document.getElementById('statusText');
    const timeTypeSelect = document.getElementById('timeType');
    const presetTimeContainer = document.getElementById('presetTimeContainer');
    const customTimeContainer = document.getElementById('customTimeContainer');
    const presetTimeSelect = document.getElementById('presetTime');
    const customDateTimeInput = document.getElementById('customDateTime');
    const notificationMessageInput = document.getElementById('notificationMessage');

    let countdownInterval;

    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
    
        let formattedTime = '';
    
        if (days > 0) {
            formattedTime += `${days} gün `;
        }
        if (hours > 0 || days > 0) {  // Show hours if there are days or hours
            formattedTime += `${hours} saat `;
        }
        if (minutes > 0 || hours > 0 || days > 0) {  // Show minutes if there are days or hours or minutes
            formattedTime += `${minutes} dakika `;
        }
        if (remainingSeconds > 0 || formattedTime === '') {  // Always show seconds, even if other units are zero
            formattedTime += `${remainingSeconds} saniye`;
        }
    
        return formattedTime.trim();  // Remove any extra whitespace at the end
    }
    
    function updateStatus() {
        chrome.storage.local.get('endTime', (result) => {
            if (result.endTime) {
                const now = Date.now();
                const remainingTime = result.endTime - now;
                if (remainingTime > 0) {
                    statusText.textContent = `Kalan Süre: ${formatTime(remainingTime)}`;
                } else {
                    statusText.textContent = "Mola Süresi Doldu!";
                    chrome.storage.local.remove('endTime');
                    chrome.alarms.clear('breakReminder');
                    clearInterval(countdownInterval);
                }
            } else {
                statusText.textContent = "Mola Ayarlanmadı";
            }
        });
    }
    
    function startCountdown() {
        updateStatus();
        countdownInterval = setInterval(updateStatus, 1000);
    }

    timeTypeSelect.addEventListener('change', () => {
        if (timeTypeSelect.value === 'preset') {
            presetTimeContainer.style.display = 'block';
            customTimeContainer.style.display = 'none';
        } else {
            presetTimeContainer.style.display = 'none';
            customTimeContainer.style.display = 'block';
        }
    });

    startButton.addEventListener('click', () => {
        let endTime;

        if (timeTypeSelect.value === 'preset') {
            const time = parseInt(presetTimeSelect.value);
            if (isNaN(time) || time <= 0) {
                alert("Lütfen geçerli bir zaman aralığı seçin.");
                return;
            }
            const startTime = Date.now();
            endTime = startTime + time * 60000;
        } else if (timeTypeSelect.value === 'custom') {
            const customDateTime = new Date(customDateTimeInput.value);
            if (isNaN(customDateTime.getTime())) {
                alert("Lütfen geçerli bir tarih ve saat seçin.");
                return;
            }
            endTime = customDateTime.getTime();
            const now = Date.now();
            if (endTime <= now) {
                alert("Seçtiğiniz tarih ve saat geçmişte olamaz.");
                return;
            }
        }

        const notificationMessage = notificationMessageInput.value.trim() || "Mola Süresi Doldu!";
        chrome.storage.local.set({ endTime: endTime, notificationMessage: notificationMessage });
        chrome.alarms.create('breakReminder', { when: endTime });

        startCountdown();
    });

    stopButton.addEventListener('click', () => {
        chrome.alarms.clear('breakReminder');
        chrome.storage.local.remove('endTime');
        statusText.textContent = "Mola Durduruldu";
        clearInterval(countdownInterval);
    });

    chrome.alarms.getAll((alarms) => {
        const breakReminder = alarms.find(a => a.name === 'breakReminder');
        if (breakReminder) {
            updateStatus();
            startCountdown();
        } else {
            updateStatus();
        }
    });
});
