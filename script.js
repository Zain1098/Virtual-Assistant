let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let recognitionTimeout;

let userName = "";

let tasks = [];

let apiKey = '8b4ca08013d33e29a8a086a5';

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "hi-IN";
    // Female voice select karne ke liye
    window.speechSynthesis.getVoices().forEach(voice => {
        if (voice.name.includes("Female")) {
            text_speak.voice = voice;
        }
    });
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    let minutes = day.getMinutes();
    let period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    let timeString = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;

    if (hours >= 5 && period === "AM") {
        speak(`Good Morning Sir, the time is ${timeString}`);
    } else if (hours < 5 && period === "PM") {
        speak(`Good Afternoon Sir, the time is ${timeString}`);
    } else if (hours >= 5 && period === "PM") {
        speak(`Good Evening Sir, the time is ${timeString}`);
    } else {
        speak(`Good Night Sir, the time is ${timeString}`);
    }
}

window.addEventListener('load', () => {
    wishMe();
});

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    clearTimeout(recognitionTimeout);
    clearTimeout(voiceTimeout);
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());

    voiceTimeout = setTimeout(() => {
        resetAssistant();
    }, 5000);
};

btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";

    voiceTimeout = setTimeout(() => {
        resetAssistant();
    }, 5000);
});

function resetAssistant() {
    voice.style.display = "none";
    btn.style.display = "flex";
}

function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    // Check for specific commands first
    if (message.includes("convert currency")) {
        // Extracting amount, from currency, and to currency
        let parts = message.replace("convert currency", "").trim().split(" ");

        // Check if the command has enough parts
        if (parts.length < 4) {
            speak("Please provide the amount and the currencies in the format: convert currency [amount] [from currency] to [to currency].");
            return;
        }

        let amount = parts[0]; // Amount
        let from = parts[1]; // From currency
        let to = parts.slice(3).join(" "); // Join the remaining parts for the 'to' currency

        // Fetching exchange rate from ExchangeRate-API
        fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from.toUpperCase()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                // Check if 'conversion_rates' exists in the response
                let rate = data.conversion_rates ? data.conversion_rates[to.toUpperCase()] : null;

                if (rate) {
                    let converted = amount * rate;
                    speak(`The converted amount is ${converted.toFixed(2)} ${to.toUpperCase()}`);
                } else {
                    speak(`Sorry, I couldn't find the conversion rate for ${to.toUpperCase()}.`);
                }
            })
            .catch(error => {
                console.error(error); // Log the error to understand what went wrong
                speak("Sorry, there was an error fetching the currency conversion data. Please check the currency codes and try again.");
            });
        return; // Exit the function after processing the command
    }

    // Other commands

    if (message.includes("hello") || message.includes("hey") || message.includes("hi")) {
        speak("Hello Sir, what can I help you with?");
    } else if (message.includes("who are you")) {
        speak("I am a virtual assistant, created by Zain Sir.");
    } else if (message.includes("activate light mode")) {
        document.body.style.backgroundColor = "#ffff";
        speak("light mode activated.");
    } else if (message.includes("activate dark mode")) {
        document.body.style.backgroundColor = "#000000";
        speak("Dark mode activated.");
    }
    
    else if (message.includes("open youtube")) {
        speak("Opening YouTube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("Opening Google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open facebook")) {
        speak("Opening Facebook...");
        window.open("https://facebook.com/", "_blank");
    } else if (message.includes("open instagram")) {
        speak("Opening Instagram...");
        window.open("https://instagram.com/", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak(`The time is ${time}`);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
        speak(`Today's date is ${date}`);
    } else if (message.includes("weather")) {
        speak("Opening weather.");
        window.open("https://www.accuweather.com/", "_blank");
    } else if (message.includes("joke")) {
        speak("Why don't scientists trust atoms? Because they make up everything!");
    } else if (message.includes("news")) {
        speak("Fetching the latest news for you.");
        window.open("https://news.google.com/", "_blank");
    } else if (message.includes("play music")) {
        speak("Playing some music for you.");
        window.open("https://www.youtube.com/results?search_query=music", "_blank");
    } else if (message.includes("how are you")) {
        speak("I am just a program, but thanks for asking!");
    } else if (message.includes("what is your name")) {
        speak("My name is your virtual assistant");
    } else if (message.includes("my name is")) {
        userName = message.split("my name is ")[1].trim();
        speak(`Nice to meet you, ${userName}!`);
    } else if (message.includes("tell me a fun fact")) {
        const funFacts = [
            "Did you know that honey never spoils?",
            "Bananas are berries, but strawberries aren't.",
            "A group of flamingos is called a 'flamboyance'."
        ];
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        speak(randomFact);
    } else if (message.includes("calculate")) {
        let calculation = message.replace("calculate", "").trim();
        try {
            let result = eval(calculation);
            speak(`The result is ${result}`);
        } catch (error) {
            speak("Sorry, I couldn't calculate that.");
        }
    } else if (message.includes("tell me a joke")) {
        speak("Why did the scarecrow win an award? Because he was outstanding in his field!");
    } else if (message.includes("what can you do")) {
        speak("I can help you with various tasks like telling the weather, playing music, and answering your questions.");
    } else if (message.includes("give me a quote")) {
        speak("The only way to do great work is to love what you do. - Steve Jobs");
    } else if (message.includes("tell me about yourself")) {
        speak("I am a virtual assistant designed to help you with your queries and tasks.");
    } else if (message.includes("set a reminder")) {
        speak("Please tell me what you want to be reminded about and when.");
    } else if (message.includes("news about technology")) {
        speak("Fetching the latest technology news for you.");
        window.open("https://news.google.com/topics/CAAqJggKIiJDQkFTRWdvSUwyMHZNRGd4YjJvU0FtVnVHZ0pZV0Z3Z0FBUAE?hl=en-PK&gl=PK&ceid=PK%3Aen", "_blank");
    } else if (message.includes("who created you") || message.includes("who is your creator")) {
        speak("I was created by Zain. I am designed to assist you with various tasks.");
    } else if (message.includes("a task")) {
        let task = message.split("a task ")[1].trim();
        tasks.push(task);
        speak(`Task "${task}" has been added.`);
    } else if (message.includes("show my task")) {
        if (tasks.length > 0) {
            speak("Your tasks are: " + tasks.join(", "));
        } else {
            speak("You have no tasks.");
        }
    } else if (message.includes("delete task")) {
        let taskToDelete = message.split("delete task ")[1].trim();
        tasks = tasks.filter(task => task !== taskToDelete);
        speak(`Task "${taskToDelete}" has been deleted.`);
    } else {
        let finalText = `This is what I found on the internet regarding ${message}`;
        speak(finalText);
        window.open(`https://www.google.com/search?q=${message}`, "_blank");
    }
}