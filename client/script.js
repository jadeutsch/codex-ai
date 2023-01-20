import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// function to generate ellipses as if AI is thinking
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// function to generate text on screen as if AI is typing response
function text(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// function to generate uIDs to map over AI response
function generateUID() {
  const timestamp = Date.now();
  const randomNum = Math.random();
  const hexString = randomNum.toString(16);

  return `id-${timestamp}-${hexString}`;
}

// function to generate color variation between user and AI
function chatStripe(isAi, value, uId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}" 
            alt="${isAi ? "bot" : "user"}" 
          />
        </div>
        <div class="message" id="${uId}">${value}</div>
      </div>
    </div> 
    `;
}

// function to handle submit and generate AI response
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // generate user chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // reset form once data has been submitted
  form.reset();

  // generate AI chat stripe
  const uniqueId = generateUID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // scrolls message as response hits page bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server for the AI response
  const response = await fetch("https://codex-ai-st01.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    text(messageDiv, parsedData);
  } else {
    const error = await response.text();

    messageDiv.innerHTML = "Something went wrong!";
    alert(error);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
